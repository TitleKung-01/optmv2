"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSchedule } from "@/hooks/useSchedule";
import { useProfile } from "@/hooks/useProfile";
import { useEnergy } from "@/hooks/useEnergy";
import Sidebar from "@/components/Sidebar";
import ScheduleTimeline from "@/components/ScheduleTimeline";
import EnergyGauge from "@/components/EnergyGauge";
import MiniCalendar from "@/components/MiniCalendar";
import ScheduleHeader from "@/components/ScheduleHeader";
import DayStatusCard from "@/components/DayStatusCard";
import EnergyIntervalsCard from "@/components/EnergyIntervalsCard";
import SmartTipsCard from "@/components/SmartTipsCard";
import ConfirmClearScheduleModal from "@/components/ConfirmClearScheduleModal";
import {
  Clock,
  Zap,
  Smile,
} from "lucide-react";
import { updateTask } from "@/lib/api";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function SchedulePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const {
    schedules,
    loading,
    fetchSchedules,
    triggerSchedule,
    reorderSchedules,
    clearDay,
    updateScheduleTime,
  } = useSchedule();
  const { profile, fetchProfile } = useProfile();
  const energy = useEnergy(profile);

  const [date, setDate] = useState(todayISO());
  const [generating, setGenerating] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState("");
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchSchedules(date);
      fetchProfile();
    }
  }, [user, date, fetchSchedules, fetchProfile]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-zinc-800 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const handleGenerate = async () => {
    setGenerating(true);
    setMessage("");
    const msg = await triggerSchedule(date);
    setMessage(msg);
    setGenerating(false);
  };

  const handleClearDay = () => {
    if (schedules.length === 0) return;
    setShowConfirmClear(true);
  };

  const executeClearDay = async () => {
    setShowConfirmClear(false);
    setClearing(true);
    setMessage("");
    try {
      await clearDay(date);
      setMessage("ล้างตารางสำหรับวันนี้เรียบร้อย");
    } catch (error) {
      console.error("Clear schedule error:", error);
      setMessage("ล้างตารางไม่สำเร็จ");
    } finally {
      setClearing(false);
    }
  };

  const handleUpdateSchedule = async (id: string, start: string, end: string, title?: string, taskId?: string | null) => {
    try {
      await updateScheduleTime(id, start, end);
      if (title && taskId) {
        await updateTask(taskId, { title });
      }
      await fetchSchedules(date);
    } catch (error) {
      console.error("Update schedule error:", error);
    }
  };

  const totalDuration = schedules
    .filter((s) => s.event_type === "Task")
    .reduce((acc, s) => {
      const mins =
        (new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) /
        60000;
      return acc + mins;
    }, 0);

  // สรุปจำนวนงานของวันที่เลือก
  const todayTasksCount = schedules.filter(
    (s) => s.event_type === "Task",
  ).length;

  return (
    <>
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar />
      <main className="flex-1 min-w-0 p-8 overflow-y-auto max-w-7xl mx-auto sh-fade-up">
        {/* Header */}
        <ScheduleHeader
          generating={generating}
          clearing={clearing}
          onGenerate={handleGenerate}
          onClear={handleClearDay}
          hasSchedules={schedules.length > 0}
        />

        {/* Message Banner */}
        {message && (
          <div className="flex items-center gap-2 px-4 py-3 border border-emerald-500/20 bg-emerald-950/10 rounded-md text-xs font-semibold text-emerald-400 mb-6 sh-fade-up">
            <Smile className="w-4 h-4" />
            {message}
          </div>
        )}

        {/* 3-column Layout (Calendar | Timeline | Energy) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Column 1: Interactive Monthly Calendar (4 cols on wide screens) */}
          <div className="xl:col-span-4 flex flex-col gap-4">
            <MiniCalendar selectedDate={date} onSelectDate={setDate} />

            {/* Quick Status card below calendar */}
            <DayStatusCard
              date={date}
              todayTasksCount={todayTasksCount}
              totalDuration={totalDuration}
            />
          </div>

          {/* Column 2: Timeline list (5 cols on wide screens) */}
          <div className="xl:col-span-5 sh-card p-6 flex flex-col min-h-[460px]">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-zinc-900">
              <div className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-500" />
                ตารางงานรายวัน
              </div>
              {totalDuration > 0 && (
                <span className="sh-badge sh-badge-secondary text-[10px] font-bold">
                  {schedules.length} ช่วงเวลารวม
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-zinc-800 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            ) : (
              <ScheduleTimeline
                schedules={schedules}
                onReorder={reorderSchedules}
                onUpdateSchedule={handleUpdateSchedule}
              />
            )}
          </div>

          {/* Column 3: Biorythm + Tips (3 cols on wide screens) */}
          <div className="xl:col-span-3 flex flex-col gap-6">
            {/* Energy Gauge Widget */}
            <div className="sh-card p-5 flex flex-col items-center">
              <div className="text-sm font-semibold text-zinc-300 flex items-center gap-2 self-start mb-6 pb-3 border-b border-zinc-900 w-full">
                <Zap className="w-4 h-4 text-indigo-400" />
                ช่วงระดับพลังงาน
              </div>
              <EnergyGauge energy={energy} />
            </div>

            {/* Profile Energy summary */}
            <EnergyIntervalsCard profile={profile} />

            {/* AI Smart Tips */}
            <SmartTipsCard />
          </div>
        </div>
      </main>
    </div>

    <ConfirmClearScheduleModal
      isOpen={showConfirmClear}
      date={date}
      clearing={clearing}
      onClose={() => setShowConfirmClear(false)}
      onConfirm={executeClearDay}
    />
    </>
  );
}
