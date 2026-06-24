'use client';

import { useState, useEffect } from 'react';
import type { Task, AISubtask, Difficulty, Recurrence } from '@/lib/types';

interface Props {
  initial?: Partial<Task>;
  onSave: (data: Omit<Task, 'id' | 'user_id' | 'created_at' | 'status'>) => Promise<void>;
  onClose: () => void;
  onBreakdown?: (title: string) => Promise<AISubtask[]>;
  onAddSubtask?: (subtask: Omit<Task, 'id' | 'user_id' | 'created_at' | 'status'>) => Promise<void>;
}

const DAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

export default function TaskForm({ initial, onSave, onClose, onBreakdown, onAddSubtask }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [difficulty, setDifficulty] = useState<Difficulty>(initial?.difficulty ?? 'Medium');
  const [duration, setDuration] = useState(initial?.estimated_duration ?? 30);
  const [priority, setPriority] = useState(initial?.priority ?? 3);
  const [deadline, setDeadline] = useState(initial?.deadline ? initial.deadline.slice(0, 16) : '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [recurrence, setRecurrence] = useState<Recurrence>(initial?.recurrence ?? 'none');
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>(initial?.recurrence_days ?? []);

  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [subtasks, setSubtasks] = useState<AISubtask[]>([]);
  const [addingSubtasks, setAddingSubtasks] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await onSave({
      title: title.trim(),
      difficulty,
      estimated_duration: duration,
      priority,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      category: category.trim() || null,
      recurrence,
      recurrence_days: recurrence === 'custom' ? recurrenceDays : null,
    });
    setSaving(false);
    onClose();
  };

  const handleBreakdown = async () => {
    if (!title.trim() || !onBreakdown) return;
    setAiLoading(true);
    const result = await onBreakdown(title.trim());
    setSubtasks(result);
    setAiLoading(false);
  };

  const handleAddAllSubtasks = async () => {
    if (!onAddSubtask) return;
    setAddingSubtasks(true);
    for (const sub of subtasks) {
      await onAddSubtask({
        title: sub.title,
        difficulty: sub.difficulty,
        estimated_duration: sub.duration,
        priority,
        deadline: null,
        category: category.trim() || null,
        recurrence: 'none',
        recurrence_days: null,
      });
    }
    setAddingSubtasks(false);
    setSubtasks([]);
    onClose();
  };

  const toggleDay = (d: number) => {
    setRecurrenceDays(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    );
  };

  const isEdit = !!initial?.id;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>
            {isEdit ? 'แก้ไขงาน' : '✦ เพิ่มงานใหม่'}
          </h2>
          <button className="btn-icon" onClick={onClose} style={{ fontSize: 18 }}>✕</button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Title */}
          <div>
            <label className="input-label">ชื่องาน *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="เช่น เขียนรายงาน, อ่านหนังสือ..."
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
              {onBreakdown && (
                <button
                  className="btn btn-ghost"
                  onClick={handleBreakdown}
                  disabled={!title.trim() || aiLoading}
                  title="ให้ AI แตกงานย่อย"
                  style={{ flexShrink: 0, padding: '0 14px', fontSize: 13 }}
                >
                  {aiLoading ? <span className="spinner" /> : '🤖 AI'}
                </button>
              )}
            </div>
          </div>

          {/* AI Subtasks result */}
          {subtasks.length > 0 && (
            <div style={{
              background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 'var(--radius-md)', padding: 16,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--indigo-light)', marginBottom: 12 }}>
                🤖 AI แนะนำ {subtasks.length} งานย่อย
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                {subtasks.map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 8, fontSize: 13, padding: '6px 0',
                    borderBottom: i < subtasks.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}>
                    <span style={{ color: 'var(--text-primary)' }}>{s.title}</span>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <span className={`badge badge-${s.difficulty.toLowerCase()}`}>{s.difficulty}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.duration} นาที</span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="btn btn-primary"
                onClick={handleAddAllSubtasks}
                disabled={addingSubtasks}
                style={{ width: '100%', fontSize: 13 }}
              >
                {addingSubtasks ? <><span className="spinner" /> กำลังเพิ่ม...</> : `✓ เพิ่มทั้งหมด ${subtasks.length} งาน`}
              </button>
            </div>
          )}

          {/* Difficulty + Duration */}
          <div className="grid-2">
            <div>
              <label className="input-label">ระดับความยาก</label>
              <select className="input" value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty)}>
                <option value="Low">ง่าย (Low)</option>
                <option value="Medium">ปานกลาง (Medium)</option>
                <option value="High">ยาก (High)</option>
              </select>
            </div>
            <div>
              <label className="input-label">เวลาโดยประมาณ (นาที)</label>
              <input
                type="number" className="input"
                value={duration} min={5} max={480} step={5}
                onChange={e => setDuration(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="input-label">ความสำคัญ (1 ต่ำ – 5 สูง)</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
              {[1, 2, 3, 4, 5].map(p => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  style={{
                    width: 40, height: 40, borderRadius: 8,
                    border: `1px solid ${priority >= p ? 'var(--warning)' : 'var(--border)'}`,
                    background: priority >= p ? 'rgba(245,158,11,0.12)' : 'transparent',
                    cursor: 'pointer', fontSize: 16,
                    color: priority >= p ? 'var(--warning)' : 'var(--text-muted)',
                    transition: 'all 0.15s ease',
                  }}
                >★</button>
              ))}
            </div>
          </div>

          {/* Deadline + Category */}
          <div className="grid-2">
            <div>
              <label className="input-label">Deadline</label>
              <input type="datetime-local" className="input" value={deadline} onChange={e => setDeadline(e.target.value)} />
            </div>
            <div>
              <label className="input-label">หมวดหมู่</label>
              <input className="input" value={category} onChange={e => setCategory(e.target.value)} placeholder="เช่น งาน, เรียน, ส่วนตัว" />
            </div>
          </div>

          {/* Recurrence */}
          <div>
            <label className="input-label">งานซ้ำ</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(['none', 'daily', 'weekly', 'custom'] as Recurrence[]).map(r => (
                <button
                  key={r}
                  onClick={() => setRecurrence(r)}
                  className={recurrence === r ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
                >
                  {r === 'none' ? 'ไม่ซ้ำ' : r === 'daily' ? 'ทุกวัน' : r === 'weekly' ? 'ทุกสัปดาห์' : 'กำหนดเอง'}
                </button>
              ))}
            </div>
            {recurrence === 'custom' && (
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                {DAYS.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => toggleDay(i)}
                    style={{
                      width: 36, height: 36, borderRadius: 8,
                      border: `1px solid ${recurrenceDays.includes(i) ? 'var(--indigo)' : 'var(--border)'}`,
                      background: recurrenceDays.includes(i) ? 'rgba(99,102,241,0.2)' : 'transparent',
                      cursor: 'pointer', fontSize: 12, fontWeight: 600,
                      color: recurrenceDays.includes(i) ? 'var(--indigo-light)' : 'var(--text-muted)',
                      transition: 'all 0.15s ease',
                    }}
                  >{d}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>ยกเลิก</button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!title.trim() || saving}
          >
            {saving ? <><span className="spinner" /> กำลังบันทึก...</> : isEdit ? '✓ บันทึกการแก้ไข' : '✦ เพิ่มงาน'}
          </button>
        </div>
      </div>
    </div>
  );
}
