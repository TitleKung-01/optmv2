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

  console.log("clearSchedulesForDate called with date:", date);
  console.log("Range ISO:", dayStart.toISOString(), "to", dayEnd.toISOString());

  const { data: daySchedules, error: fetchError } = await supabase
    .from('schedules')
    .select('task_id')
    .gte('start_time', dayStart.toISOString())
    .lte('start_time', dayEnd.toISOString());

  if (fetchError) {
    console.error("fetchError in clearSchedulesForDate:", fetchError);
    throw fetchError;
  }

  console.log("Fetched day schedules to clear:", daySchedules);

  const taskIds = (daySchedules ?? [])
    .map((s) => s.task_id)
    .filter((id): id is string => id !== null);

  console.log("Task IDs to reset to Pending:", taskIds);

  if (taskIds.length > 0) {
    const { error: taskError } = await supabase
      .from('tasks')
      .update({ status: 'Pending' })
      .in('id', taskIds);
    if (taskError) {
      console.error("taskError in clearSchedulesForDate:", taskError);
      throw taskError;
    }
  }

  const { error: deleteError } = await supabase
    .from('schedules')
    .delete()
    .gte('start_time', dayStart.toISOString())
    .lte('start_time', dayEnd.toISOString());

  if (deleteError) {
    console.error("deleteError in clearSchedulesForDate:", deleteError);
    throw deleteError;
  }

  console.log("clearSchedulesForDate completed successfully");
}

export async function updateSchedule(id: string, updates: Partial<Schedule>): Promise<Schedule> {
  const { data, error } = await supabase
    .from('schedules')
    .update(updates)
    .eq('id', id)
    .select('*, tasks(*)')
    .single();

  if (error) {
    console.error("updateSchedule error:", error);
    throw error;
  }
  return data as Schedule;
}

