'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSchedulesByDate } from '../lib/api';
import type { Schedule } from '../lib/types';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'deadline';
}

export default function NotificationBar() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    // Auto-dismiss after 8s
    toasts.forEach(t => {
      const timer = setTimeout(() => dismiss(t.id), 8000);
      return () => clearTimeout(timer);
    });
  }, [toasts, dismiss]);

  useEffect(() => {
    const shown = new Set<string>();

    async function checkSchedules() {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const schedules: Schedule[] = await getSchedulesByDate(today);
        const now = Date.now();
        const fiveMin = 5 * 60 * 1000;

        schedules.forEach(s => {
          if (s.event_type !== 'Task' || !s.tasks) return;
          const startMs = new Date(s.start_time).getTime();
          const diff = startMs - now;
          if (diff > 0 && diff <= fiveMin && !shown.has(s.id)) {
            shown.add(s.id);
            const minsLeft = Math.ceil(diff / 60000);
            setToasts(prev => [...prev, {
              id: s.id,
              title: '⏰ งานกำลังจะเริ่ม',
              message: `"${s.tasks!.title}" อีก ${minsLeft} นาที`,
              type: 'reminder',
            }]);
          }
        });
      } catch {
        // ยังไม่ได้ login หรือ error — ไม่ต้องทำอะไร
      }
    }

    checkSchedules();
    const interval = setInterval(checkSchedules, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className="toast anim-slide-right">
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>
            ⏰
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--indigo-light)', marginBottom: 2 }}>
              {toast.title}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {toast.message}
            </div>
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: 16, flexShrink: 0,
              padding: '0 4px',
            }}
          >✕</button>
        </div>
      ))}
    </div>
  );
}
