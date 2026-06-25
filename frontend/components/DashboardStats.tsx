"use client";

import type { Task } from "@/lib/types";
import { TrendingUp, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface Props {
  tasks: Task[];
}

export default function DashboardStats({ tasks }: Props) {
  const [selectedWeek, setSelectedWeek] = useState("This Week");

  // Compute weekly statistics
  const completedCounts: number[] = Array(7).fill(0);
  const totalCounts: number[] = Array(7).fill(0);
  const today = new Date();

  tasks.forEach((t) => {
    // Days ago calculation based on created_at date
    const daysAgo = Math.floor(
      (today.getTime() - new Date(t.created_at).getTime()) / 86_400_000,
    );
    if (daysAgo >= 0 && daysAgo < 7) {
      const index = 6 - daysAgo;
      totalCounts[index]++;
      if (t.status === "Completed") {
        completedCounts[index]++;
      }
    }
  });

  const maxVal = Math.max(...totalCounts, 4); // Min scale height of 4 tasks
  const step = Math.ceil(maxVal / 4);
  const scaleMax = step * 4;
  const yAxisLabels = [scaleMax, step * 3, step * 2, step * 1, 0];

  // Generate weekday letters dynamically (M, T, W, T, F, S, S)
  const dayData = Array(7)
    .fill(0)
    .map((_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - (6 - i));
      const label = d.toLocaleDateString("en-US", { weekday: "narrow" });
      const isToday = i === 6;
      return {
        label,
        isToday,
        total: totalCounts[i],
        completed: completedCounts[i],
      };
    });

  const totalCompletedThisWeek = completedCounts.reduce((a, b) => a + b, 0);

  return (
    <div className="w-full flex flex-col gap-6 p-6 bg-transparent">
      {/* Chart Header */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 border border-indigo-100/30 flex items-center justify-center shadow-[0_4px_12px_rgba(79,70,229,0.04)]">
            <CheckCircle2 className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h4 className="text-base font-extrabold text-zinc-100 leading-snug">Weekly Progress</h4>
            <p className="text-xs text-zinc-300 font-medium">Tasks completed vs planned</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Total badge */}
          <span className="bg-emerald-50/80 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100/60 flex items-center gap-1 shadow-sm">
            <TrendingUp className="w-3.5 h-3.5" /> Total {totalCompletedThisWeek} Completed
          </span>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="bg-white/40 backdrop-blur-md border border-white/60 text-xs font-bold text-zinc-100 rounded-xl py-1.5 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-sm hover:bg-white/70 transition-all"
          >
            <option>This Week</option>
            <option>Last Week</option>
          </select>
        </div>
      </div>

      {/* Faux Chart Container */}
      <div className="relative min-h-[260px] flex items-end gap-4 mt-6">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-xs font-extrabold text-zinc-300 pb-2.5">
          {yAxisLabels.map((val, idx) => (
            <span key={idx}>{val}</span>
          ))}
        </div>

        {/* Grid lines */}
        <div className="absolute left-8 right-0 top-2 bottom-9 flex flex-col justify-between pointer-events-none">
          {Array(5)
            .fill(0)
            .map((_, idx) => (
              <div key={idx} className="w-full border-t border-zinc-200/20" />
            ))}
        </div>

        {/* Bars */}
        <div className="flex-1 flex justify-around items-end h-full pl-8 pb-9 relative z-10">
          {dayData.map((day, i) => {
            const hasTasks = day.total > 0;
            // Planned/total height is percentage of the scaleMax
            const plannedHeight = hasTasks ? (day.total / scaleMax) * 100 : 5;
            // Completed is percentage of planned/total tasks
            const completedHeight = hasTasks ? (day.completed / day.total) * 100 : 0;

            return (
              <div key={i} className="w-full max-w-[32px] flex flex-col items-center gap-3 group select-none">
                {/* Bar Stack */}
                <div
                  style={{ height: `${plannedHeight}%` }}
                  className={`w-full bg-white/40 border border-white/50 rounded-t-md relative group-hover:bg-white/60 transition-colors duration-200 min-h-[12px]`}
                >
                  {/* Completed Fill */}
                  {day.completed > 0 && (
                    <div
                      style={{ height: `${completedHeight}%` }}
                      className={`absolute bottom-0 w-full bg-gradient-to-t from-indigo-600 via-indigo-500 to-violet-400 rounded-t-md group-hover:brightness-105 transition-all duration-300 ${
                        day.isToday ? 'shadow-[0_2px_12px_rgba(79,70,229,0.35)]' : 'shadow-[0_2px_8px_rgba(79,70,229,0.15)]'
                      }`}
                    />
                  )}
                  {/* Floating tooltip on hover */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900/90 backdrop-blur-md text-white text-[10px] font-bold py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30 shadow-md">
                    {day.completed} / {day.total} Done
                  </div>
                </div>

                {/* Day label */}
                <span
                  className={`text-xs font-bold tracking-wide transition-colors ${
                    day.isToday ? "text-indigo-600 font-black scale-105" : "text-zinc-300 group-hover:text-zinc-100"
                  }`}
                >
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
