import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth';
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  spawnRecurringTasks,
} from '../services/tasks.service';

export async function getTasksHandler(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const status = req.query['status'] as string | undefined;
    const tasks = await listTasks(req.userId!, status);
    res.json({ success: true, tasks });
  } catch (err) {
    console.error('GET Tasks Error:', err);
    res.status(500).json({ success: false, message: 'ดึงข้อมูลงานล้มเหลว' });
  }
}

export async function createTaskHandler(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { title, ...rest } = req.body;
    if (!title) {
      res.status(400).json({ success: false, message: 'กรุณาส่ง title' });
      return;
    }
    const task = await createTask(req.userId!, { title, ...rest });
    res.status(201).json({ success: true, task });
  } catch (err) {
    console.error('POST Task Error:', err);
    res.status(500).json({ success: false, message: 'สร้างงานล้มเหลว' });
  }
}

export async function updateTaskHandler(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const task = await updateTask(id, req.userId!, req.body);
    res.json({ success: true, task });
  } catch (err) {
    console.error('PUT Task Error:', err);
    res.status(500).json({ success: false, message: 'อัปเดตงานล้มเหลว' });
  }
}

export async function deleteTaskHandler(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    await deleteTask(id, req.userId!);
    res.json({ success: true, message: 'ลบงานสำเร็จ' });
  } catch (err) {
    console.error('DELETE Task Error:', err);
    res.status(500).json({ success: false, message: 'ลบงานล้มเหลว' });
  }
}

export async function spawnRecurringHandler(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { date } = req.body as { date?: string };
    if (!date) {
      res.status(400).json({ success: false, message: 'กรุณาส่ง date' });
      return;
    }
    const spawned = await spawnRecurringTasks(req.userId!, date);
    res.json({ success: true, spawned, message: `สร้าง ${spawned} งานซ้ำสำเร็จ` });
  } catch (err) {
    console.error('Spawn Recurring Error:', err);
    res.status(500).json({ success: false, message: 'สร้างงานซ้ำล้มเหลว' });
  }
}
