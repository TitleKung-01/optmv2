/**
 * จำลอง LINE webhook event ไปยัง backend บน localhost
 *
 * ใช้:
 *   bun run scripts/test-line-webhook.ts
 *
 * ต้องรัน backend ก่อน:
 *   cd backend && bun run dev
 */

import crypto from "crypto";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// โหลด backend/.env.local อัตโนมัติ
function loadBackendEnv() {
  const envPath = resolve(import.meta.dir, "../backend/.env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const key = t.slice(0, i).trim();
    const val = t.slice(i + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}
loadBackendEnv();

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";
const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || "";

// ─── Mock LINE event (user ส่งข้อความมาที่บอท) ──────────────────────────────
const mockEvent = {
  destination: "Udeadbeef",
  events: [
    {
      type: "message",
      replyToken: "mock-reply-token-00000000",
      source: {
        userId: "U1234567890abcdef1234567890abcdef", // mock LINE User ID
        type: "user",
      },
      timestamp: Date.now(),
      mode: "active",
      message: {
        type: "text",
        id: "1",
        text: "สวัสดี",
      },
    },
  ],
};

const body = JSON.stringify(mockEvent);

// คำนวณ signature เหมือน LINE จะส่งมา
function makeSignature(secret: string, body: string): string {
  if (!secret) return "no-secret-skip-verify";
  return crypto.createHmac("sha256", secret).update(body).digest("base64");
}

async function main() {
  const url = `${BACKEND_URL}/api/notify/webhook`;
  const signature = makeSignature(CHANNEL_SECRET, body);

  console.log(`🔗 POST ${url}`);
  console.log(`📦 Payload:\n${JSON.stringify(mockEvent, null, 2)}\n`);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Line-Signature": signature,
    },
    body,
  });

  console.log(`✅ HTTP ${res.status}`);

  if (!CHANNEL_SECRET) {
    console.warn(
      "\n⚠️  LINE_CHANNEL_SECRET ไม่พบใน backend/.env.local — ข้าม signature verification",
    );
  } else {
    console.log("\n🔐 Signature verified with Channel Secret ✅");
  }

  console.log(
    "\n📋 ถ้า backend ทำงานถูกต้อง จะเห็น log ใน terminal ของ backend:",
  );
  console.log('   "LINE Webhook: reply to mock-reply-token-00000000"');
  console.log(
    "   (reply จริงจะล้มเหลวเพราะ replyToken เป็น mock แต่ logic ทำงานถูกต้อง)",
  );
}

main().catch(console.error);
