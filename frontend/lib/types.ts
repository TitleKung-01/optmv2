export type Difficulty = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Pending' | 'Scheduled' | 'Completed';
export type Recurrence = 'none' | 'daily' | 'weekly' | 'custom';
export type Chronotype = 'Morning Lark' | 'Third Bird' | 'Night Owl';
export type EventType = 'Task' | 'Mandatory_Break' | 'Fixed';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  difficulty: Difficulty;
  estimated_duration: number; // minutes
  status: TaskStatus;
  priority: number; // 1-5
  deadline: string | null;
  recurrence: Recurrence;
  recurrence_days: number[] | null;
  category: string | null;
  created_at: string;
}

export interface Schedule {
  id: string;
  user_id: string;
  task_id: string | null;
  start_time: string;
  end_time: string;
  event_type: EventType;
  created_at: string;
  tasks?: Task | null; // joined
}

export interface UserProfile {
  id: string;
  email: string | null;
  chronotype: Chronotype | null;
  peak_time_start: string | null;
  peak_time_end: string | null;
  dip_time_start: string | null;
  dip_time_end: string | null;
  created_at: string;
}

export interface AISubtask {
  title: string;
  duration: number;
  difficulty: Difficulty;
}

export type EnergyLevel = 'peak' | 'normal' | 'dip';

export interface EnergyState {
  level: EnergyLevel;
  percentage: number;
  label: string;
}
