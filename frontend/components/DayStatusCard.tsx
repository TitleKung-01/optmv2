"use client";

import { CalendarCheck } from "lucide-react";

interface DayStatusCardProps {
  date: string;
  todayTasksCount: number;
  totalDuration: number;
}

export default function DayStatusCard({
  date,
  todayTasksCount,
  totalDuration,
}: DayStatusCardProps) {
  return (
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
              todayTasksCount > 0 ? "text-indigo-400 font-bold" : "text-zinc-500"
            }
          >
            {todayTasksCount} งาน
          </span>
        </div>
        <div className="flex justify-between py-1.5 text-zinc-400">
          <span>รวมชั่วโมงงาน</span>
          <span
            className={
              totalDuration > 0 ? "text-emerald-400 font-bold" : "text-zinc-500"
            }
          >
            {totalDuration > 0
              ? `${Math.floor(totalDuration / 60)} ชม. ${totalDuration % 60} น.`
              : "0 นาที"}
          </span>
        </div>
      </div>
    </div>
  );
}
