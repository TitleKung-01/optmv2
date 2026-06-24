import { supabase } from '../db/supabase';
import type { TaskRow } from '../types';

export async function listTasks(userId: string, status?: string): Promise<TaskRow[]> {
  let query = supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as TaskRow[];
}

export async function createTask(
  userId: string,
  payload: Partial<TaskRow> & { title: string }
): Promise<TaskRow> {
  const row = {
    user_id: userId,
    title: payload.title.trim(),
    difficulty: payload.difficulty ?? 'Medium',
    estimated_duration: payload.estimated_duration ?? 30,
    priority: Math.min(5, Math.max(1, payload.priority ?? 3)),
    deadline: payload.deadline ?? null,
    recurrence: payload.recurrence ?? 'none',
    recurrence_days: payload.recurrence_days ?? null,
    category: payload.category?.trim() ?? null,
    status: 'Pending',
  };

  const { data, error } = await supabase.from('tasks').insert([row]).select().single();
  if (error) throw error;
  return data as TaskRow;
}

export async function updateTask(
  id: string,
  userId: string,
  updates: Partial<TaskRow>
): Promise<TaskRow> {
  // Strip immutable fields
  const { id: _i, user_id: _u, created_at: _c, ...safeUpdates } = updates as Record<string, unknown>;

  if (typeof safeUpdates['priority'] === 'number') {
    safeUpdates['priority'] = Math.min(5, Math.max(1, safeUpdates['priority'] as number));
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(safeUpdates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as TaskRow;
}

export async function deleteTask(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function spawnRecurringTasks(userId: string, date: string): Promise<number> {
  const targetDate = new Date(date);
  const dayOfWeek = targetDate.getDay();

  const { data: templates, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .neq('recurrence', 'none');

  if (error) throw error;
  if (!templates || templates.length === 0) return 0;

  const toInsert: Partial<TaskRow>[] = [];

  for (const task of templates as TaskRow[]) {
    let spawn = false;
    if (task.recurrence === 'daily') {
      spawn = true;
    } else if (task.recurrence === 'weekly') {
      spawn = dayOfWeek === new Date(task.created_at).getDay();
    } else if (task.recurrence === 'custom' && task.recurrence_days) {
      spawn = task.recurrence_days.includes(dayOfWeek);
    }

    if (spawn) {
      toInsert.push({
        user_id: task.user_id,
        title: task.title,
        difficulty: task.difficulty,
        estimated_duration: task.estimated_duration,
        priority: task.priority,
        deadline: null,
        recurrence: 'none',
        recurrence_days: null,
        category: task.category,
        status: 'Pending',
      });
    }
  }

  if (toInsert.length > 0) {
    const { error: insertError } = await supabase.from('tasks').insert(toInsert);
    if (insertError) throw insertError;
  }

  return toInsert.length;
}
