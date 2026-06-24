import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth';
import { generateSmartSchedule } from '../services/schedule.service';

export async function generateScheduleHandler(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { start_time } = req.body as { start_time?: string };
    const userId = req.userId;

    if (!userId || !start_time) {
      res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบถ้วน' });
      return;
    }

    const { mode, taskCount } = await generateSmartSchedule(userId, start_time);
    res.json({ success: true, message: `${mode} จัดตารางงานเรียบร้อย (${taskCount} งาน)` });
  } catch (err) {
    const error = err as Error & { code?: string };
    if (error.code === 'NO_TASKS') {
      res.json({ success: false, message: error.message });
      return;
    }
    console.error('Schedule Error:', err);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการจัดตาราง' });
  }
}
