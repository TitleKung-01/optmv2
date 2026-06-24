import type { Request, Response } from 'express';
import { breakdownTaskWithAI } from '../services/ai.service';

export async function aiBreakdownHandler(req: Request, res: Response): Promise<void> {
  try {
    const { taskTitle } = req.body as { taskTitle?: string };
    if (!taskTitle) {
      res.status(400).json({ success: false, message: 'กรุณาส่งชื่องานมาด้วยครับ' });
      return;
    }
    const subtasks = await breakdownTaskWithAI(taskTitle);
    res.json({ success: true, subtasks });
  } catch (err) {
    console.error('AI Breakdown Error:', err);
    res.status(500).json({ success: false, message: 'สมองกล AI ทำงานผิดพลาดครับ ลองใหม่อีกครั้ง' });
  }
}
