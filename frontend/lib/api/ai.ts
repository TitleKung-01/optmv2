import type { AISubtask } from '@/lib/types';
import { apiFetch } from './http';

export async function aiBreakdown(taskTitle: string): Promise<AISubtask[]> {
  const data = await apiFetch<{ success: boolean; subtasks: AISubtask[] }>('/api/ai-breakdown', {
    method: 'POST',
    body: JSON.stringify({ taskTitle }),
  });
  return data.subtasks;
}
