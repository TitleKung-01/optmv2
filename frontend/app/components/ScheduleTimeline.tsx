'use client';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Schedule } from '../lib/types';

interface Props {
  schedules: Schedule[];
  onReorder: (newOrder: Schedule[]) => void;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(start: string, end: string) {
  const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
  return mins >= 60 ? `${Math.floor(mins / 60)}ชม ${mins % 60 > 0 ? `${mins % 60}น.` : ''}`.trim() : `${mins} นาที`;
}

function SortableItem({ schedule }: { schedule: Schedule }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: schedule.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : undefined,
    opacity: isDragging ? 0.85 : 1,
  };

  const isBreak = schedule.event_type === 'Mandatory_Break';
  const task = schedule.tasks;

  const accentColor = isBreak
    ? 'var(--warning)'
    : task?.difficulty === 'High'
    ? 'var(--diff-high)'
    : task?.difficulty === 'Low'
    ? 'var(--diff-low)'
    : 'var(--indigo)';

  const bgColor = isBreak
    ? 'rgba(245,158,11,0.06)'
    : 'var(--bg-card)';

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        display: 'flex',
        gap: 14,
        alignItems: 'stretch',
        padding: '12px 0',
        borderBottom: '1px solid var(--border)',
        background: bgColor,
        borderRadius: 'var(--radius-md)',
        paddingRight: 12,
        cursor: isDragging ? 'grabbing' : undefined,
      }}
    >
      {/* Time column */}
      <div style={{ width: 70, flexShrink: 0, textAlign: 'right', paddingRight: 4, paddingTop: 2 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          {formatTime(schedule.start_time)}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          {formatTime(schedule.end_time)}
        </div>
      </div>

      {/* Color bar */}
      <div style={{
        width: 4, flexShrink: 0, borderRadius: 99,
        background: accentColor,
        boxShadow: `0 0 8px ${accentColor}55`,
      }} />

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{
            fontSize: 14, fontWeight: isBreak ? 500 : 600,
            color: isBreak ? 'var(--warning)' : 'var(--text-primary)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {isBreak ? '☕ พักเบรก' : task?.title ?? 'งาน'}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              ◷ {formatDuration(schedule.start_time, schedule.end_time)}
            </span>
            {!isBreak && task && (
              <>
                <span className={`badge badge-${task.difficulty.toLowerCase()}`} style={{ fontSize: 10, padding: '2px 7px' }}>
                  {task.difficulty}
                </span>
                {task.category && (
                  <span style={{ fontSize: 10, color: 'var(--violet-light)' }}>{task.category}</span>
                )}
              </>
            )}
          </div>
        </div>
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          style={{
            cursor: 'grab',
            color: 'var(--text-muted)',
            background: 'none',
            border: 'none',
            fontSize: 18,
            padding: '4px 8px',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
          }}
          title="ลากเพื่อจัดเรียง"
        >
          ⠿
        </button>
      </div>
    </div>
  );
}

export default function ScheduleTimeline({ schedules, onReorder }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = schedules.findIndex(s => s.id === active.id);
    const newIndex = schedules.findIndex(s => s.id === over.id);
    onReorder(arrayMove(schedules, oldIndex, newIndex));
  }

  if (schedules.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📅</div>
        <div className="empty-state-title">ยังไม่มีตาราง</div>
        <p style={{ fontSize: 13 }}>กดปุ่ม "จัดตารางอัตโนมัติ" เพื่อให้ AI จัดตารางให้</p>
      </div>
    );
  }

  // Current time indicator
  const now = new Date();
  const nowMs = now.getTime();
  const firstMs = new Date(schedules[0].start_time).getTime();
  const lastMs  = new Date(schedules[schedules.length - 1].end_time).getTime();
  const showNow = nowMs >= firstMs && nowMs <= lastMs;

  return (
    <div>
      {/* Current time marker */}
      {showNow && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 8, padding: '6px 12px',
          background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 12, color: 'var(--indigo-light)',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--indigo)', display: 'inline-block', animation: 'pulse-glow 2s infinite' }} />
          ตอนนี้ {now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={schedules.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {schedules.map(s => (
              <SortableItem key={s.id} schedule={s} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
