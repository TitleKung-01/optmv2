'use client';

import { useState, useEffect, useCallback } from 'react';
import * as api from '@/lib/api';
import type { Task, Schedule } from '@/lib/types';

export interface BurnoutData {
  score: number; // 0-100
  level: 'Safe' | 'Warning' | 'Critical';
  factors: {
    overdue: { score: number; max: number; label: string; count: number };
    intensity: { score: number; max: number; label: string; count: number };
    overwork: { score: number; max: number; label: string; hours: number };
    noRest: { score: number; max: number; label: string; days: number };
  };
}

export function useBurnout() {
  const [data, setData] = useState<BurnoutData | null>(null);
  const [loading, setLoading] = useState(true);

  const calculateBurnout = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all tasks and last 7 days of schedules
      const [tasks, recentSchedules] = await Promise.all([
        api.getTasks(), // gets all tasks for user
        api.getRecentSchedules(7),
      ]);

      // 1. Overdue Stress (Max 30%)
      const now = new Date();
      const overdueTasks = tasks.filter(t =>
        t.status !== 'Completed' &&
        t.deadline &&
        new Date(t.deadline).getTime() < now.getTime()
      );
      const overdueCount = overdueTasks.length;
      const overdueScore = Math.min(overdueCount * 10, 30);

      // 2. Intensity Overload (Max 25%)
      // High difficulty tasks that are active (Pending/Scheduled)
      const highDiffTasks = tasks.filter(t =>
        t.status !== 'Completed' && t.difficulty === 'High'
      );
      const highDiffCount = highDiffTasks.length;
      const intensityScore = Math.min(highDiffCount * 5, 25);

      // 3. Overwork Penalty (Max 25%)
      // Calculate total scheduled task hours in the last 7 days
      let totalWorkMins = 0;
      recentSchedules.forEach(s => {
        if (s.event_type === 'Task') {
          const diff = new Date(s.end_time).getTime() - new Date(s.start_time).getTime();
          totalWorkMins += diff / 60000;
        }
      });
      const totalHours = totalWorkMins / 60;
      let overworkScore = 0;
      if (totalHours >= 40) overworkScore = 25;
      else if (totalHours >= 30) overworkScore = 15;
      else if (totalHours >= 25) overworkScore = 5;

      // 4. No-Rest Streak (Max 20%)
      // Consecutive days with > 4 hours of scheduled work
      // Group schedules by day
      const workByDay: Record<string, number> = {};
      recentSchedules.forEach(s => {
        if (s.event_type === 'Task') {
          const dayKey = s.start_time.slice(0, 10);
          const diff = new Date(s.end_time).getTime() - new Date(s.start_time).getTime();
          workByDay[dayKey] = (workByDay[dayKey] || 0) + diff / 60000;
        }
      });

      // Count streak starting from today backwards
      let noRestDays = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayKey = d.toISOString().slice(0, 10);
        const hours = (workByDay[dayKey] || 0) / 60;
        if (hours > 4) {
          noRestDays++;
        } else {
          // Break the streak
          break;
        }
      }
      const noRestScore = Math.min(noRestDays * 5, 20);

      const totalScore = overdueScore + intensityScore + overworkScore + noRestScore;
      let level: 'Safe' | 'Warning' | 'Critical' = 'Safe';
      if (totalScore >= 70) level = 'Critical';
      else if (totalScore >= 31) level = 'Warning';

      setData({
        score: totalScore,
        level,
        factors: {
          overdue: { score: overdueScore, max: 30, label: 'งานเลยกำหนด', count: overdueCount },
          intensity: { score: intensityScore, max: 25, label: 'ภาระงานยาก', count: highDiffCount },
          overwork: { score: overworkScore, max: 25, label: 'ชั่วโมงงานรวม', hours: Math.round(totalHours) },
          noRest: { score: noRestScore, max: 20, label: 'ทำงานติดกัน', days: noRestDays },
        }
      });
    } catch (e) {
      console.error('Failed to calculate burnout', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    calculateBurnout();
  }, [calculateBurnout]);

  return { data, loading, refresh: calculateBurnout };
}
