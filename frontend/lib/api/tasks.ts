import type { Task } from '@/lib/types';
import { apiFetch } from './http';

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
