"use client";

import { Clock } from "lucide-react";
import type { UserProfile } from "@/lib/types";

interface EnergyIntervalsCardProps {
  profile: UserProfile | null | undefined;
}

export default function EnergyIntervalsCard({
  profile,
}: EnergyIntervalsCardProps) {
  if (!profile?.peak_time_start) return null;

  return (
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
  );
}
