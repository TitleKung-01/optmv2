'use client';

import { useState, useCallback } from 'react';
import type { Schedule } from '@/lib/types';
import * as api from '@/lib/api';

export function useSchedule() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async (date: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSchedulesByDate(date);
      setSchedules(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const triggerSchedule = useCallback(async (date: string): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const message = await api.generateSchedule(dayStart.toISOString());
      await fetchSchedules(date);
      return message;
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      return msg;
    } finally {
      setLoading(false);
    }
  }, [fetchSchedules]);

  // Optimistic reorder (for drag & drop UI — doesn't persist to backend)
  const reorderSchedules = useCallback((newOrder: Schedule[]) => {
    setSchedules(newOrder);
  }, []);

  const clearDay = useCallback(async (date: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await api.clearSchedulesForDate(date);
      setSchedules([]);
    } catch (e) {
      setError((e as Error).message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateScheduleTime = useCallback(async (id: string, startTime: string, endTime: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await api.updateSchedule(id, { start_time: startTime, end_time: endTime });
    } catch (e) {
      setError((e as Error).message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { schedules, loading, error, fetchSchedules, triggerSchedule, reorderSchedules, clearDay, updateScheduleTime };
}
