import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";
import { supabase } from "../db/supabase";
import {
  sendPushMessage,
  replyMessage,
  verifyLineSignature,
} from "../services/line.service";

/** POST /api/notify/line — ส่ง LINE notification ไปยังผู้ใช้ที่ login */
export async function lineNotifyHandler(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const { message } = req.body as { message?: string };
    if (!message) {
      res.status(400).json({ success: false, message: "กรุณาส่ง message" });
      return;
    }

    const { data: profile } = await supabase
      .from("users")
      .select("line_user_id")
      .eq("id", req.userId!)
      .single();

    if (!profile?.line_user_id) {
      res
        .status(400)
        .json({
          success: false,
          message: "ยังไม่ได้ตั้ง LINE User ID ใน Profile",
        });
      return;
    }

    await sendPushMessage(profile.line_user_id, message);
    res.json({ success: true });
  } catch (err) {
    console.error("LINE Notify Error:", err);
    res
      .status(500)
      .json({ success: false, message: "ส่ง LINE notification ไม่สำเร็จ" });
  }
}

interface LineEvent {
  type: string;
  replyToken?: string;
  source?: { userId?: string };
  message?: { type: string; text?: string };
}

/** POST /api/notify/webhook — รับ event จาก LINE platform (ไม่ต้อง auth)
 *  เมื่อผู้ใช้ส่งข้อความใดๆ มาที่บอท → บอทตอบกลับ LINE User ID */
export async function lineWebhookHandler(
  req: Request,
  res: Response,
): Promise<void> {
  // LINE ต้องการ 200 ไว เพื่อไม่ให้ retry
  res.sendStatus(200);

  try {
    const signature = req.headers["x-line-signature"] as string | undefined;
    const rawBody =
      (req as Request & { rawBody?: string }).rawBody ??
      JSON.stringify(req.body);

    if (signature && !verifyLineSignature(rawBody, signature)) {
      console.warn("LINE Webhook: invalid signature");
      return;
    }

    const events: LineEvent[] =
      (req.body as { events?: LineEvent[] })?.events ?? [];

    for (const event of events) {
      if (event.type !== "message") continue;
      const lineUserId = event.source?.userId;
      const replyToken = event.replyToken;
      if (!lineUserId || !replyToken) continue;

      await replyMessage(
        replyToken,
        `🤖 Smart Scheduler\n\nLINE User ID ของคุณคือ:\n${lineUserId}\n\nนำไปวางใน Profile → LINE User ID เพื่อรับแจ้งเตือนงานครับ 🔔`,
      );
    }
  } catch (err) {
    console.error("LINE Webhook Error:", err);
  }
}
