import type { Schedule } from '@/lib/types';
import { apiFetch } from './http';
import { supabase } from '@/lib/supabase';

export async function generateSchedule(start_time: string): Promise<string> {
  const data = await apiFetch<{ success: boolean; message: string }>('/api/schedule', {
    method: 'POST',
    body: JSON.stringify({ start_time }),
  });
  return data.message;
}

export async function spawnRecurring(date: string): Promise<number> {
  const data = await apiFetch<{ success: boolean; spawned: number }>('/api/tasks/spawn-recurring', {
    method: 'POST',
    body: JSON.stringify({ date }),
  });
  return data.spawned;
}

export async function getSchedulesByDate(date: string): Promise<Schedule[]> {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from('schedules')
    .select('*, tasks(*)')
    .gte('start_time', dayStart.toISOString())
    .lte('start_time', dayEnd.toISOString())
    .order('start_time', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Schedule[];
}

export async function getRecentSchedules(days: number): Promise<Schedule[]> {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('schedules')
    .select('*, tasks(*)')
    .gte('start_time', start.toISOString())
    .lte('start_time', end.toISOString())
    .order('start_time', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Schedule[];
}

export async function clearSchedulesForDate(date: string): Promise<void> {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const { data: daySchedules, error: fetchError } = await supabase
    .from('schedules')
    .select('task_id')
    .gte('start_time', dayStart.toISOString())
    .lte('start_time', dayEnd.toISOString());

  if (fetchError) throw fetchError;

  const taskIds = (daySchedules ?? [])
    .map((s) => s.task_id)
    .filter((id): id is string => id !== null);

  if (taskIds.length > 0) {
    const { error: taskError } = await supabase
      .from('tasks')
      .update({ status: 'Pending' })
      .in('id', taskIds);
    if (taskError) throw taskError;
  }

  const { error: deleteError } = await supabase
    .from('schedules')
    .delete()
    .gte('start_time', dayStart.toISOString())
    .lte('start_time', dayEnd.toISOString());

  if (deleteError) throw deleteError;
}
