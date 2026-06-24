'use client';

import type { Task } from '@/lib/types';

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
}

const difficultyLabel = { Low: 'ง่าย', Medium: 'ปานกลาง', High: 'ยาก' } as const;
const priorityLabel = ['', '★', '★★', '★★★', '★★★★', '★★★★★'] as const;

function getDeadlineInfo(deadline: string | null) {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0)  return { text: `เกินกำหนด ${Math.abs(days)} วัน`, color: 'var(--danger)' };
  if (days === 0) return { text: 'ครบกำหนดวันนี้', color: 'var(--warning)' };
  if (days <= 3)  return { text: `อีก ${days} วัน`, color: 'var(--warning)' };
  return { text: `อีก ${days} วัน`, color: 'var(--text-muted)' };
}

export default function TaskCard({ task, onEdit, onDelete, onComplete }: Props) {
  const dl = getDeadlineInfo(task.deadline);
  const isCompleted = task.status === 'Completed';

  return (
    <div
      className="glass glass-glow anim-fade-up"
      style={{
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        opacity: isCompleted ? 0.65 : 1,
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Priority accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: task.priority >= 4
          ? 'linear-gradient(180deg, var(--danger), var(--warning))'
          : task.priority === 3
          ? 'linear-gradient(180deg, var(--indigo), var(--violet))'
          : 'rgba(255,255,255,0.08)',
        borderRadius: '12px 0 0 12px',
      }} />

      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingLeft: 8 }}>
        {/* Checkbox */}
        <button
          onClick={() => onComplete(task.id)}
          title={isCompleted ? "ยกเลิกทำเสร็จ" : "ทำเสร็จแล้ว"}
          style={{
            width: 22, height: 22,
            borderRadius: 6,
            border: `2px solid ${isCompleted ? 'var(--success)' : 'rgba(255,255,255,0.2)'}`,
            background: isCompleted ? 'rgba(34,211,164,0.15)' : 'transparent',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.2s ease',
            color: 'var(--success)',
            fontSize: 13,
            marginTop: 1,
          }}
        >
          {isCompleted ? '✓' : ''}
        </button>

        {/* Title + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 15, fontWeight: 600,
            color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
            textDecoration: isCompleted ? 'line-through' : 'none',
            marginBottom: 6,
            lineHeight: 1.4,
          }}>
            {task.title}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            {/* Difficulty */}
            <span className={`badge badge-${task.difficulty.toLowerCase()}`}>
              {difficultyLabel[task.difficulty]}
            </span>
            {/* Status */}
            <span className={`badge badge-${task.status.toLowerCase()}`}>
              {task.status === 'Pending' ? 'รอดำเนินการ' : task.status === 'Scheduled' ? 'จัดตาราง' : 'เสร็จแล้ว'}
            </span>
            {/* Category */}
            {task.category && (
              <span style={{
                fontSize: 11, padding: '3px 8px', borderRadius: 99,
                background: 'rgba(139,92,246,0.12)', color: 'var(--violet-light)',
                border: '1px solid rgba(139,92,246,0.2)',
              }}>
                {task.category}
              </span>
            )}
            {/* Recurrence */}
            {task.recurrence !== 'none' && (
              <span style={{ fontSize: 11, color: 'var(--info)' }} title={`ซ้ำ: ${task.recurrence}`}>
                🔁
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button className="btn-icon btn-sm" onClick={() => onEdit(task)} title="แก้ไข">✏</button>
          <button className="btn-icon btn-sm" onClick={() => onDelete(task.id)} title="ลบ"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--danger)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
          >✕</button>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingLeft: 8, gap: 12,
      }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {/* Duration */}
          <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            ◷ {task.estimated_duration} นาที
          </span>
          {/* Priority stars */}
          <span style={{ fontSize: 11, color: 'var(--warning)', letterSpacing: -1 }}>
            {priorityLabel[task.priority]}
          </span>
        </div>
        {/* Deadline */}
        {dl && (
          <span style={{ fontSize: 12, color: dl.color, fontWeight: 500 }}>
            ⏰ {dl.text}
          </span>
        )}
      </div>
    </div>
  );
}
