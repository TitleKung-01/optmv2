'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../hooks/useTasks';
import { spawnRecurring } from '../lib/api';
import Sidebar from '../components/Sidebar';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import type { Task, TaskStatus } from '../lib/types';

type Filter = 'All' | TaskStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'All',       label: 'ทั้งหมด' },
  { key: 'Pending',   label: 'รอดำเนินการ' },
  { key: 'Scheduled', label: 'จัดตารางแล้ว' },
  { key: 'Completed', label: 'เสร็จแล้ว' },
];

export default function TasksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { tasks, loading, fetchTasks, addTask, editTask, removeTask, breakdownWithAI, clearAllTasks } = useTasks();

  const [filter, setFilter] = useState<Filter>('All');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchTasks();
      const today = new Date().toISOString().slice(0, 10);
      spawnRecurring(today).catch(() => {});
    }
  }, [user, fetchTasks]);

  if (authLoading || !user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  const filtered = tasks.filter(t => {
    if (filter !== 'All' && t.status !== filter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) &&
        !t.category?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleComplete = async (task: Task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    await editTask(task.id, { status: newStatus });
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleSave = async (data: Omit<Task, 'id' | 'user_id' | 'created_at' | 'status'>) => {
    if (editingTask) {
      await editTask(editingTask.id, data);
    } else {
      await addTask(data);
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const handleClearAll = async () => {
    if (tasks.length === 0) return;
    const ok = window.confirm(
      'ล้างงานทั้งหมดและตารางที่เกี่ยวข้อง?\nการกระทำนี้ไม่สามารถย้อนกลับได้'
    );
    if (!ok) return;

    setClearing(true);
    try {
      await clearAllTasks();
    } catch (error) {
      console.error('Clear tasks error:', error);
      alert('ล้างข้อมูลไม่สำเร็จ');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="page-shell">
      <Sidebar />
      <main className="page-content">
        {/* Header */}
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 className="page-title">✦ Tasks</h1>
            <p className="page-subtitle">จัดการงานทั้งหมดของคุณ</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              id="add-task-btn"
              className="btn btn-primary"
              onClick={() => { setEditingTask(null); setShowForm(true); }}
            >
              + เพิ่มงาน
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleClearAll}
              disabled={clearing || tasks.length === 0}
            >
              {clearing ? 'กำลังล้าง...' : 'ล้างข้อมูล'}
            </button>
          </div>
        </div>

        {/* Filter + Search */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={filter === f.key ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
              >
                {f.label}
                {f.key === 'All' && <span style={{ marginLeft: 4, fontSize: 11, opacity: 0.7 }}>({tasks.length})</span>}
              </button>
            ))}
          </div>
          <input
            className="input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 ค้นหาชื่องาน หรือหมวดหมู่..."
            style={{ maxWidth: 260 }}
          />
        </div>

        {/* Task List */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner" style={{ width: 32, height: 32 }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">
              {search ? 'ไม่พบงานที่ตรงกัน' : 'ยังไม่มีงาน'}
            </div>
            <p style={{ fontSize: 13 }}>
              {search ? 'ลองค้นหาด้วยคีย์เวิร์ดอื่น' : 'กดปุ่ม "+ เพิ่มงาน" เพื่อเริ่มต้น'}
            </p>
          </div>
        ) : (
          <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEdit}
                onDelete={removeTask}
                onComplete={() => handleComplete(task)}
              />
            ))}
          </div>
        )}

        {/* Task Form Modal */}
        {showForm && (
          <TaskForm
            initial={editingTask ?? undefined}
            onSave={handleSave}
            onClose={handleClose}
            onBreakdown={breakdownWithAI}
            onAddSubtask={async (sub) => { await addTask(sub); }}
          />
        )}
      </main>
    </div>
  );
}
