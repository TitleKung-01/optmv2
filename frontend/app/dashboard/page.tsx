"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTasks } from "@/hooks/useTasks";
import { useSchedule } from "@/hooks/useSchedule";
import { useProfile } from "@/hooks/useProfile";
import { useEnergy } from "@/hooks/useEnergy";
import Sidebar from "@/components/Sidebar";
import DashboardStats from "@/components/DashboardStats";
import EnergyGauge from "@/components/EnergyGauge";
import ScheduleTimeline from "@/components/ScheduleTimeline";
import BurnoutWidget from "@/components/BurnoutWidget";
import { Calendar, User, Zap } from "lucide-react";

function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { tasks, fetchTasks } = useTasks();
  const { schedules, fetchSchedules } = useSchedule();
  const { profile, fetchProfile } = useProfile();
  const energy = useEnergy(profile);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchSchedules(getTodayISO());
      fetchProfile();
    }
  }, [user, fetchTasks, fetchSchedules, fetchProfile]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-zinc-800 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const now = new Date();
  const greeting =
    now.getHours() < 12
      ? "อรุณสวัสดิ์"
      : now.getHours() < 17
        ? "สวัสดีตอนบ่าย"
        : "สวัสดีตอนเย็น";

  // Upcoming schedules (next 3)
  const upcoming = schedules
    .filter((s) => s.event_type === "Task" && new Date(s.end_time) > now)
    .slice(0, 3);

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar />
      <main className="flex-1 min-w-0 p-8 overflow-y-auto max-w-7xl mx-auto sh-fade-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-zinc-900">
          <div>
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {now.toLocaleDateString("th-TH", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 mb-1">
              {greeting}, {user.email?.split("@")[0]} 👋
            </h1>
            <p className="text-sm text-zinc-500 font-medium">
              นี่คือสรุปภาพรวมตารางชีวิตของคุณวันนี้
            </p>
          </div>
          <div className="flex-shrink-0 bg-zinc-900/40 border border-zinc-900 rounded-lg p-3">
            <EnergyGauge energy={energy} compact />
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <DashboardStats tasks={tasks} />
        </div>

        {/* 2-column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Upcoming Today (Left 2 cols) */}
          <div className="lg:col-span-2 sh-card p-6 flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-zinc-900">
              <div className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-400" />
                ตารางงานรอตรวจสอบวันนี้
              </div>
              <span className="sh-badge sh-badge-secondary text-[11px] font-semibold">
                {schedules.length} ช่วงเวลา
              </span>
            </div>

            {upcoming.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-zinc-500">
                <Calendar className="w-10 h-10 text-zinc-700 mb-3 stroke-[1.5]" />
                <div className="text-sm font-semibold text-zinc-400 mb-1">
                  ไม่มีตารางที่ต้องดำเนินการต่อวันนี้
                </div>
                <p className="text-xs text-zinc-500 max-w-[280px]">
                  งานทั้งหมดเสร็จสิ้น
                  หรือตารางชีวิตของคุณในวันนี้ยังไม่ได้จัดสรร
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <ScheduleTimeline schedules={upcoming} onReorder={() => {}} />
              </div>
            )}
          </div>

          {/* Right Sidebar (1 col) */}
          <div className="flex flex-col gap-8">
            {/* Burnout Risk Widget */}
            <div className="h-full">
              <BurnoutWidget />
            </div>

            {/* Full Energy Widget */}
            <div className="sh-card p-6 flex flex-col items-center">
              <div className="text-sm font-semibold text-zinc-300 flex items-center gap-2 self-start mb-6 pb-3 border-b border-zinc-900 w-full">
                <Zap className="w-4 h-4 text-indigo-400" />
                ระดับพลังงานตลอดวัน
              </div>
              <EnergyGauge energy={energy} />

              {profile?.chronotype && (
                <div className="mt-6 w-full py-2.5 px-4 rounded-md bg-indigo-500/5 border border-indigo-500/10 text-xs font-semibold text-indigo-400 text-center flex items-center justify-center gap-1.5 uppercase tracking-wider">
                  <User className="w-3.5 h-3.5" />
                  Chronotype: {profile.chronotype}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
