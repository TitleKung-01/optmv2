import type { UserProfile } from '@/lib/types';
import { supabase } from '@/lib/supabase';

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
