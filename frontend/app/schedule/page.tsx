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
import {
  Clock,
  Lightbulb,
  Zap,
  Smile,
  Sparkles,
  Trash2,
  CalendarCheck,
} from "lucide-react";

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
  } = useSchedule();
  const { profile, fetchProfile } = useProfile();
  const energy = useEnergy(profile);

  const [date, setDate] = useState(todayISO());
  const [generating, setGenerating] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState("");

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

  const handleClearDay = async () => {
    if (schedules.length === 0) return;
    const ok = window.confirm(
      `ล้างตารางของวันที่ ${date}?\nงานที่จัดแล้วจะกลับเป็นสถานะ "รอดำเนินการ"`,
    );
    if (!ok) return;

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
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar />
      <main className="flex-1 min-w-0 p-8 overflow-y-auto max-w-7xl mx-auto sh-fade-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-900">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 flex items-center gap-2">
              Schedule Dashboard
            </h1>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              จัดสรรและตรวจสอบวันที่มีภารกิจเพื่อผลลัพธ์ที่ดีที่สุด
            </p>
          </div>

          <div className="flex gap-2.5 items-center flex-wrap">
            <button
              id="generate-schedule-btn"
              className="sh-btn sh-btn-default px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10"
              onClick={handleGenerate}
              disabled={generating || clearing}
            >
              <Sparkles className="w-4 h-4 text-indigo-200" />
              {generating ? "กำลังวิเคราะห์จัดตาราง..." : "จัดตารางงานอัจฉริยะ"}
            </button>
            <button
              type="button"
              className="sh-btn sh-btn-outline px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 text-zinc-400 border-zinc-800 hover:text-rose-400 hover:bg-rose-500/5 hover:border-rose-500/20"
              onClick={handleClearDay}
              disabled={clearing || generating || schedules.length === 0}
            >
              <Trash2 className="w-4 h-4" />
              {clearing ? "กำลังล้างตาราง..." : "ล้างตาราง"}
            </button>
          </div>
        </div>

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
            <div className="sh-card p-5">
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CalendarCheck className="w-3.5 h-3.5 text-indigo-400" />
                สถานะวันที่เลือก
              </div>
              <div className="flex flex-col gap-2 text-xs font-medium">
                <div className="flex justify-between py-1.5 border-b border-zinc-900/60 text-zinc-400">
                  <span>วันที่กำหนด</span>
                  <span className="text-zinc-200">
                    {new Date(date).toLocaleDateString("th-TH", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-900/60 text-zinc-400">
                  <span>งานรอทำวันนี้</span>
                  <span
                    className={
                      todayTasksCount > 0
                        ? "text-indigo-400 font-bold"
                        : "text-zinc-500"
                    }
                  >
                    {todayTasksCount} งาน
                  </span>
                </div>
                <div className="flex justify-between py-1.5 text-zinc-400">
                  <span>รวมชั่วโมงงาน</span>
                  <span
                    className={
                      totalDuration > 0
                        ? "text-emerald-400 font-bold"
                        : "text-zinc-500"
                    }
                  >
                    {totalDuration > 0
                      ? `${Math.floor(totalDuration / 60)} ชม. ${totalDuration % 60} น.`
                      : "0 นาที"}
                  </span>
                </div>
              </div>
            </div>
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
            {profile?.peak_time_start && (
              <div className="sh-card p-5 flex flex-col">
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-1.5 pb-2 border-b border-zinc-900">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  ช่วงพลังงานของคุณ
                </div>

                <div className="flex flex-col gap-3.5">
                  {profile.peak_time_start && profile.peak_time_end && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        🔥 Peak (สูงสุด)
                      </span>
                      <span className="font-semibold text-zinc-300 bg-zinc-900 px-2 py-1 rounded border border-zinc-800/60">
                        {profile.peak_time_start.slice(0, 5)} –{" "}
                        {profile.peak_time_end.slice(0, 5)}
                      </span>
                    </div>
                  )}

                  {profile.dip_time_start && profile.dip_time_end && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-rose-500 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        😴 Dip (ตกต่ำสุด)
                      </span>
                      <span className="font-semibold text-zinc-300 bg-zinc-900 px-2 py-1 rounded border border-zinc-800/60">
                        {profile.dip_time_start.slice(0, 5)} –{" "}
                        {profile.dip_time_end.slice(0, 5)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI Smart Tips */}
            <div className="sh-card p-5 flex flex-col">
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                Smart Tips
              </div>
              <ul className="text-xs text-zinc-500 font-medium leading-relaxed list-none flex flex-col gap-2">
                <li className="flex gap-1.5 items-start">
                  <span className="text-indigo-400 font-bold mt-0.5">•</span>
                  <span>
                    เลือกวันที่มีสัญลักษณ์จุด purple glow
                    ใต้เลขปฏิทินเพื่อดูงานวันนั้นๆ
                  </span>
                </li>
                <li className="flex gap-1.5 items-start">
                  <span className="text-indigo-400 font-bold mt-0.5">•</span>
                  <span>
                    ลากเครื่องหมาย ⠿ ในตาราง Timeline
                    เพื่อทำการปรับสลับเวลาตามที่ชอบ
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
