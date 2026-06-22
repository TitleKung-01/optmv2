'use client';

import type { Task } from '../lib/types';

interface Stats {
  total: number;
  pending: number;
  scheduled: number;
  completed: number;
  overdue: number;
  streak: number;
  weeklyCompleted: number[];
}

interface Props {
  tasks: Task[];
}

function computeStats(tasks: Task[]): Stats {
  const now = Date.now();
  const pending   = tasks.filter(t => t.status === 'Pending').length;
  const scheduled = tasks.filter(t => t.status === 'Scheduled').length;
  const completed = tasks.filter(t => t.status === 'Completed').length;
  const overdue   = tasks.filter(t =>
    t.status !== 'Completed' && t.deadline && new Date(t.deadline).getTime() < now
  ).length;

  // Streak: consecutive days with at least 1 completed task
  // Simplified: count completed tasks in last 7 days per day
  const weeklyCompleted: number[] = Array(7).fill(0);
  const today = new Date();
  tasks.forEach(t => {
    if (t.status !== 'Completed') return;
    const d = new Date(t.created_at);
    const daysAgo = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo >= 0 && daysAgo < 7) {
      weeklyCompleted[6 - daysAgo]++;
    }
  });

  let streak = 0;
  for (let i = 6; i >= 0; i--) {
    if (weeklyCompleted[i] > 0) streak++;
    else break;
  }

  return { total: tasks.length, pending, scheduled, completed, overdue, streak, weeklyCompleted };
}

const DAY_LABELS = ['6 วัน', '5 วัน', '4 วัน', '3 วัน', '2 วัน', 'เมื่อวาน', 'วันนี้'];

export default function DashboardStats({ tasks }: Props) {
  const s = computeStats(tasks);
  const maxBar = Math.max(...s.weeklyCompleted, 1);

  const statCards = [
    { label: 'งานทั้งหมด',     value: s.total,     icon: '✦', color: 'var(--indigo-light)' },
    { label: 'รอดำเนินการ',    value: s.pending,   icon: '◈', color: 'var(--text-secondary)' },
    { label: 'จัดตารางแล้ว',  value: s.scheduled, icon: '◷', color: 'var(--info)' },
    { label: 'เสร็จแล้ว',     value: s.completed, icon: '✓', color: 'var(--success)' },
    { label: 'เกินกำหนด',     value: s.overdue,   icon: '⚠', color: s.overdue > 0 ? 'var(--danger)' : 'var(--text-muted)' },
    { label: 'Streak (วัน)',  value: s.streak,    icon: '🔥', color: s.streak > 0 ? 'var(--warning)' : 'var(--text-muted)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {statCards.map((card, i) => (
          <div
            key={i}
            className="glass anim-fade-up"
            style={{
              padding: '16px 18px',
              animationDelay: `${i * 60}ms`,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: `color-mix(in srgb, ${card.color} 12%, transparent)`,
              border: `1px solid color-mix(in srgb, ${card.color} 25%, transparent)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, flexShrink: 0,
            }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: card.color, lineHeight: 1 }}>
                {card.value}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                {card.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Bar Chart */}
      <div className="glass" style={{ padding: '20px 24px' }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>
          งานที่เสร็จ 7 วันที่ผ่านมา
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 80 }}>
          {s.weeklyCompleted.map((count, i) => {
            const isToday = i === 6;
            const height = count === 0 ? 6 : Math.max(12, (count / maxBar) * 80);
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                  {count > 0 ? count : ''}
                </div>
                <div
                  style={{
                    width: '100%',
                    height,
                    borderRadius: 6,
                    background: isToday
                      ? 'linear-gradient(180deg, var(--indigo), var(--violet))'
                      : count > 0
                      ? 'rgba(99,102,241,0.4)'
                      : 'rgba(255,255,255,0.05)',
                    boxShadow: isToday && count > 0 ? 'var(--shadow-glow)' : undefined,
                    transition: 'height 0.6s ease',
                  }}
                />
                <div style={{ fontSize: 10, color: isToday ? 'var(--indigo-light)' : 'var(--text-muted)', fontWeight: isToday ? 600 : 400, whiteSpace: 'nowrap' }}>
                  {DAY_LABELS[i]}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
