"use client";

import type { EnergyState } from "@/lib/types";

interface Props {
  energy: EnergyState;
  compact?: boolean;
}

export default function EnergyGauge({ energy, compact = false }: Props) {
  const { level, percentage, label } = energy;

  const colorClass =
    level === "peak"
      ? "text-emerald-400"
      : level === "dip"
        ? "text-rose-500"
        : "text-indigo-400";

  const strokeColor =
    level === "peak"
      ? "rgba(16,185,129,1)"
      : level === "dip"
        ? "rgba(244,63,94,1)"
        : "rgba(99,102,241,1)";

  const glowColor =
    level === "peak"
      ? "rgba(16,185,129,0.3)"
      : level === "dip"
        ? "rgba(244,63,94,0.3)"
        : "rgba(99,102,241,0.3)";

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {/* Mini arc */}
        <div className="relative w-10 h-10 flex-shrink-0">
          <svg viewBox="0 0 40 40" width="40" height="40">
            <circle
              cx="20"
              cy="20"
              r="15"
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="3"
            />
            <circle
              cx="20"
              cy="20"
              r="15"
              fill="none"
              stroke={strokeColor}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={`${(percentage / 100) * 94.2} 94.2`}
              strokeDashoffset="23.55"
              style={{
                transition:
                  "stroke-dasharray 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                filter: `drop-shadow(0 0 2px ${glowColor})`,
              }}
            />
          </svg>
          <div
            className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${colorClass}`}
          >
            {percentage}%
          </div>
        </div>
        <div className="min-w-0">
          <div className={`text-xs font-semibold truncate ${colorClass}`}>
            {label}
          </div>
          <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
            Energy Level
          </div>
        </div>
      </div>
    );
  }

  // Full gauge
  const r = 54;
  const circ = 2 * Math.PI * r;
  const arcLength = circ * 0.75;
  const filled = arcLength * (percentage / 100);
  const gap = arcLength - filled;

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg
          viewBox="0 0 140 140"
          width="160"
          height="160"
          className="overflow-visible"
        >
          {/* Track */}
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circ - arcLength}`}
            strokeDashoffset={circ * 0.125}
          />
          {/* Fill */}
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke={strokeColor}
            strokeWidth="9.5"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${gap + circ * 0.25}`}
            strokeDashoffset={circ * 0.125}
            style={{
              transition: "stroke-dasharray 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
              filter: `drop-shadow(0 0 6px ${glowColor})`,
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className={`text-3xl font-extrabold tracking-tight leading-none ${colorClass}`}
          >
            {percentage}
          </div>
          <div className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider mt-1">
            %
          </div>
        </div>
      </div>

      <div className="text-center">
        <div className={`text-base font-bold tracking-tight ${colorClass}`}>
          {label}
        </div>
        <div className="text-xs text-zinc-400 mt-0.5">
          ระดับพลังงานชีวภาพขณะนี้
        </div>
      </div>

      {/* Level bar */}
      <div className="w-full max-w-[200px]">
        <div className="h-1.5 rounded-full bg-zinc-800/80 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1)"
            style={{
              width: `${percentage}%`,
              backgroundColor: strokeColor,
              boxShadow: `0 0 8px ${glowColor}`,
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
          <span>ต่ำ</span>
          <span>ปกติ</span>
          <span>Peak</span>
        </div>
      </div>
    </div>
  );
}
