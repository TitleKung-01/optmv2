import { supabase } from './supabase';
import type { Task, Schedule, AISubtask, UserProfile } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ─── Helper ───────────────────────────────────────────────────────────────────

async function getToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? '';
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'API error');
  return json as T;
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export async function getTasks(status?: string): Promise<Task[]> {
  const qs = status ? `?status=${status}` : '';
  const data = await apiFetch<{ success: boolean; tasks: Task[] }>(`/api/tasks${qs}`);
  return data.tasks;
}

export async function createTask(
  payload: Omit<Task, 'id' | 'user_id' | 'created_at' | 'status'>
): Promise<Task> {
  const data = await apiFetch<{ success: boolean; task: Task }>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data.task;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const data = await apiFetch<{ success: boolean; task: Task }>(`/api/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return data.task;
}

export async function deleteTask(id: string): Promise<void> {
  await apiFetch(`/api/tasks/${id}`, { method: 'DELETE' });
}

// ─── AI Breakdown ─────────────────────────────────────────────────────────────

export async function aiBreakdown(taskTitle: string): Promise<AISubtask[]> {
  const data = await apiFetch<{ success: boolean; subtasks: AISubtask[] }>('/api/ai-breakdown', {
    method: 'POST',
    body: JSON.stringify({ taskTitle }),
  });
  return data.subtasks;
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

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

// ─── Schedules (from Supabase directly) ──────────────────────────────────────

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

export async function clearAllTasks(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error: scheduleError } = await supabase
    .from('schedules')
    .delete()
    .eq('user_id', user.id);
  if (scheduleError) throw scheduleError;

  const { error: taskError } = await supabase
    .from('tasks')
    .delete()
    .eq('user_id', user.id);
  if (taskError) throw taskError;
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

// ─── User Profile ─────────────────────────────────────────────────────────────

export async function getUserProfile(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) return null;
  return data as UserProfile;
}

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data as UserProfile;
}
