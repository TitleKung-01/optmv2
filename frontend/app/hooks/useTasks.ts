'use client';

import { useState, useCallback } from 'react';
import type { Task, AISubtask } from '../lib/types';
import * as api from '../lib/api';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTasks(status);
      setTasks(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addTask = useCallback(async (payload: Omit<Task, 'id' | 'user_id' | 'created_at' | 'status'>): Promise<Task | null> => {
    try {
      const task = await api.createTask(payload);
      setTasks(prev => [task, ...prev]);
      return task;
    } catch (e) {
      setError((e as Error).message);
      return null;
    }
  }, []);

  const editTask = useCallback(async (id: string, updates: Partial<Task>): Promise<void> => {
    try {
      const updated = await api.updateTask(id, updates);
      setTasks(prev => prev.map(t => (t.id === id ? updated : t)));
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  const removeTask = useCallback(async (id: string): Promise<void> => {
    try {
      await api.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  const breakdownWithAI = useCallback(async (title: string): Promise<AISubtask[]> => {
    try {
      return await api.aiBreakdown(title);
    } catch (e) {
      setError((e as Error).message);
      return [];
    }
  }, []);

  const clearAllTasks = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await api.clearAllTasks();
      setTasks([]);
    } catch (e) {
      setError((e as Error).message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { tasks, loading, error, fetchTasks, addTask, editTask, removeTask, breakdownWithAI, clearAllTasks };
}
