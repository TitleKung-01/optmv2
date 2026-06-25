"use client";

import { Sparkles, Trash2 } from "lucide-react";

interface ScheduleHeaderProps {
  generating: boolean;
  clearing: boolean;
  onGenerate: () => void;
  onClear: () => void;
  hasSchedules: boolean;
}

export default function ScheduleHeader({
  generating,
  clearing,
  onGenerate,
  onClear,
  hasSchedules,
}: ScheduleHeaderProps) {
  return (
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
          onClick={onGenerate}
          disabled={generating || clearing}
        >
          <Sparkles className="w-4 h-4 text-indigo-200" />
          {generating ? "กำลังวิเคราะห์จัดตาราง..." : "จัดตารางงานอัจฉริยะ"}
        </button>
        <button
          type="button"
          className="sh-btn sh-btn-outline px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 text-zinc-400 border-zinc-800 hover:text-rose-400 hover:bg-rose-500/5 hover:border-rose-500/20"
          onClick={onClear}
          disabled={clearing || generating || !hasSchedules}
        >
          <Trash2 className="w-4 h-4" />
          {clearing ? "กำลังล้างตาราง..." : "ล้างตาราง"}
        </button>
      </div>
    </div>
  );
}
