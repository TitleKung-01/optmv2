export type Difficulty = 'Low' | 'Medium' | 'High';
export type Recurrence = 'none' | 'daily' | 'weekly' | 'custom';
export type EventType = 'Task' | 'Mandatory_Break' | 'Fixed';

export interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  difficulty: Difficulty;
  estimated_duration: number;
  status: string;
  priority: number;
  deadline: string | null;
  recurrence: Recurrence;
  recurrence_days: number[] | null;
  category: string | null;
  created_at: string;
}

export interface UserRow {
  id: string;
  email?: string;
  chronotype?: string | null;
  peak_time_start?: string | null;
  peak_time_end?: string | null;
  dip_time_start?: string | null;
  dip_time_end?: string | null;
}

export interface TimeSlot {
  startMin: number;
  endMin: number;
  label: 'peak' | 'normal' | 'dip';
}

export interface ScheduleEntry {
  user_id: string;
  task_id: string | null;
  start_time: string;
  end_time: string;
  event_type: string;
}
