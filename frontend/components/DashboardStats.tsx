"use client";

import type { Task } from "@/lib/types";
import {
  LayoutDashboard,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Flame,
} from "lucide-react";

interface Props {
  tasks: Task[];
}

function computeStats(tasks: Task[]) {
  const now = Date.now();
  const pending = tasks.filter((t) => t.status === "Pending").length;
  const scheduled = tasks.filter((t) => t.status === "Scheduled").length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const overdue = tasks.filter(
    (t) =>
      t.status !== "Completed" &&
      t.deadline &&
      new Date(t.deadline).getTime() < now,
  ).length;

  const weekly: number[] = Array(7).fill(0);
  const today = new Date();
  tasks.forEach((t) => {
    if (t.status !== "Completed") return;
    const daysAgo = Math.floor(
      (today.getTime() - new Date(t.created_at).getTime()) / 86_400_000,
    );
    if (daysAgo >= 0 && daysAgo < 7) weekly[6 - daysAgo]++;
  });

  let streak = 0;
  for (let i = 6; i >= 0; i--) {
    if (weekly[i] > 0) streak++;
    else break;
  }

  return {
    total: tasks.length,
    pending,
    scheduled,
    completed,
    overdue,
    streak,
    weekly,
  };
}

const DAY_LABELS = ["6d", "5d", "4d", "3d", "2d", "เมื่อวาน", "วันนี้"];

export default function DashboardStats({ tasks }: Props) {
  const s = computeStats(tasks);
  const maxBar = Math.max(...s.weekly, 1);

  const cards = [
    {
      label: "ทั้งหมด",
      value: s.total,
      icon: LayoutDashboard,
      color: "text-indigo-400",
      glowBg: "bg-indigo-500/10 border-indigo-500/20",
    },
    {
      label: "รอดำเนินการ",
      value: s.pending,
      icon: Clock,
      color: "text-amber-400",
      glowBg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "จัดตาราง",
      value: s.scheduled,
      icon: Calendar,
      color: "text-sky-400",
      glowBg: "bg-sky-500/10 border-sky-500/20",
    },
    {
      label: "เสร็จแล้ว",
      value: s.completed,
      icon: CheckCircle2,
      color: "text-emerald-400",
      glowBg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "เกินกำหนด",
      value: s.overdue,
      icon: AlertCircle,
      color: s.overdue > 0 ? "text-rose-400" : "text-zinc-500",
      glowBg:
        s.overdue > 0
          ? "bg-rose-500/10 border-rose-500/20"
          : "bg-zinc-800/20 border-zinc-800/10",
    },
    {
      label: "Streak",
      value: s.streak,
      icon: Flame,
      color: s.streak > 0 ? "text-orange-500" : "text-zinc-500",
      glowBg:
        s.streak > 0
          ? "bg-orange-500/10 border-orange-500/20"
          : "bg-zinc-800/20 border-zinc-800/10",
    },
  ];

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className="sh-card rounded-xl p-4 bg-zinc-950/45 border border-zinc-800/70 shadow-sm flex items-center gap-3.5 hover:bg-zinc-900/40 transition-all duration-300 group sh-fade-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${c.glowBg}`}
              >
                <Icon className={`w-5 h-5 ${c.color}`} />
              </div>
              <div className="min-w-0">
                <div
                  className={`text-2xl font-extrabold tracking-tight ${c.color} leading-none mb-1`}
                >
                  {c.value}
                </div>
                <div className="text-xs font-semibold text-zinc-400 truncate">
                  {c.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Completed Chart */}
      <div
        className="sh-card rounded-xl p-5 bg-zinc-950/45 border border-zinc-800/70 shadow-md flex flex-col gap-5 sh-fade-up"
        style={{ animationDelay: "300ms" }}
      >
        {/* Chart Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-200">
                งานที่เสร็จ 7 วันที่ผ่านมา
              </h3>
              <p className="text-[11px] text-zinc-500 font-medium">
                สถิติความคืบหน้าการทำงานรายวัน
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            รวม {s.weekly.reduce((a, b) => a + b, 0)} งาน
          </div>
        </div>

        {/* Chart Bars */}
        <div className="flex items-end justify-between gap-3 h-32 md:h-36 mt-4 px-2">
          {s.weekly.map((count, i) => {
            const isToday = i === 6;
            const heightPercent = count === 0 ? 5 : (count / maxBar) * 100;

            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-2.5 group/bar cursor-pointer animate-[fadeUp_300ms_ease_both]"
                style={{ animationDelay: `${400 + i * 40}ms` }}
              >
                {/* Value Label above Bar */}
                <span
                  className={`text-xs font-bold tracking-tight select-none transition-all duration-300 ${
                    count > 0
                      ? isToday
                        ? "text-indigo-400 font-extrabold scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                        : "text-zinc-400 group-hover/bar:text-zinc-200"
                      : "text-transparent group-hover/bar:text-zinc-600 text-[10px]"
                  }`}
                >
                  {count > 0 ? count : "0"}
                </span>

                {/* Bar Track & Fill */}
                <div className="w-full flex-1 flex items-end justify-center min-h-10">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-9 rounded-t-md transition-all duration-500 ease-out relative ${
                      isToday
                        ? "bg-linear-to-t from-violet-600 via-indigo-500 to-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)] border-t border-indigo-300/30 group-hover/bar:brightness-110"
                        : count > 0
                          ? "bg-indigo-500/20 group-hover/bar:bg-indigo-500/40 border-t border-indigo-500/10 group-hover/bar:scale-y-[1.03]"
                          : "bg-zinc-800/30 group-hover/bar:bg-zinc-800/60 border-t border-zinc-700/20"
                    }`}
                  >
                    {/* Glowing today indicator dot at the top of the bar */}
                    {isToday && (
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#fff,0_0_15px_rgba(99,102,241,1)] animate-pulse" />
                    )}
                  </div>
                </div>

                {/* Day Label underneath */}
                <div
                  className={`text-xs font-semibold tracking-wide transition-all ${
                    isToday
                      ? "text-indigo-400 scale-105 font-bold"
                      : "text-zinc-500 group-hover/bar:text-zinc-300"
                  }`}
                >
                  {DAY_LABELS[i]}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
