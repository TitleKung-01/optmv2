import { supabase } from '../db/supabase';
import { timeToMinutes, setTimeFromMinutes } from '../utils/time';
import type { TaskRow, UserRow, TimeSlot, ScheduleEntry } from '../types';

export interface ScheduleResult {
  mode: string;
  taskCount: number;
}

export async function generateSmartSchedule(
  userId: string,
  startTime: string
): Promise<ScheduleResult> {
  // 1. ดึงงานที่ยังไม่เสร็จ (Pending)
  const { data: tasks, error: fetchError } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'Pending')
    .order('created_at', { ascending: true });

  if (fetchError) throw fetchError;
  if (!tasks || tasks.length === 0) {
    throw Object.assign(new Error('ไม่มีงานรอคิวให้จัดตาราง'), { code: 'NO_TASKS' });
  }

  // 2. ดึง user profile เพื่อใช้ peak/dip time
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  const profile = userProfile as UserRow | null;

  // 3. ลบตารางงานเก่าของวันที่เลือก
  const targetDate = new Date(startTime);
  const dayStart = new Date(targetDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(targetDate);
  dayEnd.setHours(23, 59, 59, 999);

  await supabase
    .from('schedules')
    .delete()
    .eq('user_id', userId)
    .gte('start_time', dayStart.toISOString())
    .lte('start_time', dayEnd.toISOString());

  // 4. Smart Scheduling — จัดงานตาม peak/dip + difficulty
  const typedTasks = tasks as TaskRow[];
  const hasPeakDip =
    profile?.peak_time_start &&
    profile?.peak_time_end &&
    profile?.dip_time_start &&
    profile?.dip_time_end;

  const sortedTasks = hasPeakDip
    ? sortTasksSmartly(typedTasks, profile!)
    : typedTasks;

  // 5. สร้างตารางงานจากลำดับที่จัดแล้ว
  let currentTime = new Date(startTime);

  if (currentTime.getHours() === 0 && currentTime.getMinutes() === 0) {
    if (hasPeakDip) {
      const firstSlotMin = Math.min(
        timeToMinutes(profile!.peak_time_start!),
        timeToMinutes(profile!.dip_time_start!),
        360
      );
      currentTime = setTimeFromMinutes(currentTime, Math.max(firstSlotMin, 360));
    } else {
      currentTime.setHours(9, 0, 0, 0);
    }
  }

  const newSchedules: ScheduleEntry[] = [];
  let workDuration = 0;

  for (const task of sortedTasks) {
    if (workDuration >= 120) {
      const breakEnd = new Date(currentTime.getTime() + 15 * 60_000);
      newSchedules.push({
        user_id: userId,
        task_id: null,
        start_time: currentTime.toISOString(),
        end_time: breakEnd.toISOString(),
        event_type: 'Mandatory_Break',
      });
      currentTime = breakEnd;
      workDuration = 0;
    }

    const taskEnd = new Date(currentTime.getTime() + task.estimated_duration * 60_000);
    newSchedules.push({
      user_id: userId,
      task_id: task.id,
      start_time: currentTime.toISOString(),
      end_time: taskEnd.toISOString(),
      event_type: 'Task',
    });

    await supabase.from('tasks').update({ status: 'Scheduled' }).eq('id', task.id);

    currentTime = taskEnd;
    workDuration += task.estimated_duration;
  }

  const { error: insertError } = await supabase.from('schedules').insert(newSchedules);
  if (insertError) throw insertError;

  const mode = hasPeakDip ? '🧠 Smart' : '📋 Basic';
  return { mode, taskCount: sortedTasks.length };
}

// ─── Private Helpers ──────────────────────────────────────────────────────────

function sortTasksSmartly(tasks: TaskRow[], profile: UserRow): TaskRow[] {
  const now = new Date();

  const scoredTasks = tasks.map((t) => {
    let urgencyScore = (t.priority || 3) * 10;

    if (t.deadline) {
      const daysLeft =
        Math.max(0, (new Date(t.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 0) urgencyScore += 50;
      else if (daysLeft <= 1) urgencyScore += 40;
      else if (daysLeft <= 3) urgencyScore += 25;
      else if (daysLeft <= 7) urgencyScore += 10;
    }

    const difficultyScore = t.difficulty === 'High' ? 3 : t.difficulty === 'Medium' ? 2 : 1;
    return { task: t, urgencyScore, difficultyScore };
  });

  scoredTasks.sort((a, b) => b.urgencyScore - a.urgencyScore);

  const highTasks = scoredTasks.filter((s) => s.task.difficulty === 'High').map((s) => s.task);
  const medTasks  = scoredTasks.filter((s) => s.task.difficulty === 'Medium').map((s) => s.task);
  const lowTasks  = scoredTasks.filter((s) => s.task.difficulty === 'Low').map((s) => s.task);

  // สร้าง time slots แบ่ง 3 ช่วง (06:00–23:00)
  const DAY_START = 360;
  const DAY_END   = 1380;

  const rawSlots: TimeSlot[] = [
    { startMin: timeToMinutes(profile.peak_time_start!), endMin: timeToMinutes(profile.peak_time_end!), label: 'peak' },
    { startMin: timeToMinutes(profile.dip_time_start!),  endMin: timeToMinutes(profile.dip_time_end!),  label: 'dip'  },
  ];
  rawSlots.sort((a, b) => a.startMin - b.startMin);

  const slots: TimeSlot[] = [];
  let cursor = DAY_START;

  for (const slot of rawSlots) {
    if (cursor < slot.startMin) slots.push({ startMin: cursor, endMin: slot.startMin, label: 'normal' });
    slots.push(slot);
    cursor = Math.max(cursor, slot.endMin);
  }
  if (cursor < DAY_END) slots.push({ startMin: cursor, endMin: DAY_END, label: 'normal' });

  const queues: Record<string, TaskRow[]> = {
    peak:   [...highTasks, ...medTasks, ...lowTasks],
    normal: [...medTasks,  ...highTasks, ...lowTasks],
    dip:    [...lowTasks,  ...medTasks,  ...highTasks],
  };

  const seen = new Set<string>();
  const sorted: TaskRow[] = [];

  for (const slot of slots) {
    for (const task of queues[slot.label]) {
      if (!seen.has(task.id)) { seen.add(task.id); sorted.push(task); }
    }
  }
  for (const task of tasks) {
    if (!seen.has(task.id)) sorted.push(task);
  }

  console.log(
    `🧠 Smart: ${highTasks.length} High→Peak (${profile.peak_time_start}–${profile.peak_time_end}), ` +
    `${lowTasks.length} Low→Dip (${profile.dip_time_start}–${profile.dip_time_end})`
  );

  return sorted;
}
