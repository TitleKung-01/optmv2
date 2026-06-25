import React from "react";

interface TimeIntervalCardProps {
  title: string;
  description: string;
  startValue: string;
  endValue: string;
  onStartChange: (val: string) => void;
  onEndChange: (val: string) => void;
  themeColorClass: string; // e.g. "text-emerald-400" or "text-amber-500"
}

export default function TimeIntervalCard({
  title,
  description,
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  themeColorClass,
}: TimeIntervalCardProps) {
  return (
    <div className="sh-card p-6">
      <div className={`text-sm font-bold ${themeColorClass} mb-1 flex items-center gap-1.5`}>
        {title}
      </div>
      <div className="text-xs text-zinc-500 mb-5 font-medium">
        {description}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-zinc-400 tracking-wider uppercase mb-1.5 block">
            เริ่ม
          </label>
          <input
            type="time"
            className="sh-input bg-zinc-900/40 border-zinc-800 text-zinc-100"
            value={startValue}
            onChange={(e) => onStartChange(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-zinc-400 tracking-wider uppercase mb-1.5 block">
            สิ้นสุด
          </label>
          <input
            type="time"
            className="sh-input bg-zinc-900/40 border-zinc-800 text-zinc-100"
            value={endValue}
            onChange={(e) => onEndChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
