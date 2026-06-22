'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../hooks/useTasks';
import { useSchedule } from '../hooks/useSchedule';
import { useProfile } from '../hooks/useProfile';
import { useEnergy } from '../hooks/useEnergy';
import Sidebar from '../components/Sidebar';
import DashboardStats from '../components/DashboardStats';
import EnergyGauge from '../components/EnergyGauge';
import ScheduleTimeline from '../components/ScheduleTimeline';
import BurnoutWidget from '../components/BurnoutWidget';

function getTodayISO() { return new Date().toISOString().slice(0, 10); }

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { tasks, fetchTasks } = useTasks();
  const { schedules, fetchSchedules } = useSchedule();
  const { profile, fetchProfile } = useProfile();
  const energy = useEnergy(profile);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchSchedules(getTodayISO());
      fetchProfile();
    }
  }, [user, fetchTasks, fetchSchedules, fetchProfile]);

  if (authLoading || !user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'อรุณสวัสดิ์' : now.getHours() < 17 ? 'สวัสดีตอนบ่าย' : 'สวัสดีตอนเย็น';

  // Upcoming schedules (next 3)
  const upcoming = schedules
    .filter(s => s.event_type === 'Task' && new Date(s.end_time) > now)
    .slice(0, 3);

  return (
    <div className="page-shell">
      <Sidebar />
      <main className="page-content">
        {/* Header */}
        <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
              {now.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <h1 className="page-title">{greeting} 👋</h1>
            <p className="page-subtitle">{user.email}</p>
          </div>
          <div style={{ flexShrink: 0 }}>
            <EnergyGauge energy={energy} compact />
          </div>
        </div>

        {/* Stats */}
        <div style={{ marginBottom: 28 }}>
          <DashboardStats tasks={tasks} />
        </div>

        {/* 2-column */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
          {/* Upcoming Today */}
          <div className="glass" style={{ padding: '20px 24px' }}>
            <div style={{
              fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)',
              marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              ◷ ตารางวันนี้
              <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
                {schedules.length} ช่วงเวลา
              </span>
            </div>
            {upcoming.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>ไม่มีตารางวันนี้</div>
              </div>
            ) : (
              <ScheduleTimeline schedules={upcoming} onReorder={() => {}} />
            )}
          </div>

          {/* Right Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Burnout Risk Gauge */}
            <BurnoutWidget />

            {/* Full Energy Gauge */}
            <div className="glass" style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 20, alignSelf: 'flex-start' }}>
                ⚡ ระดับพลังงาน
              </div>
              <EnergyGauge energy={energy} />
              {profile?.chronotype && (
                <div style={{
                  marginTop: 20, padding: '8px 16px', borderRadius: 'var(--radius-sm)',
                  background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)',
                  fontSize: 12, color: 'var(--indigo-light)', textAlign: 'center',
                }}>
                  🦅 {profile.chronotype}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
