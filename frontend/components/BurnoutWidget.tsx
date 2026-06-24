"use client";

import { useBurnout } from "@/hooks/useBurnout";
import {
  AlertCircle,
  Flame,
  ShieldAlert,
  Heart,
  TrendingUp,
} from "lucide-react";

export default function BurnoutWidget() {
  const { data, loading } = useBurnout();

  if (loading || !data) {
    return (
      <div className="sh-card flex items-center justify-center h-[260px]">
        <div className="sh-skeleton w-full h-full" />
      </div>
    );
  }

  const { score, level, factors } = data;

  let colorClass = "text-emerald-400";
  let strokeColor = "rgba(16,185,129,1)";
  let message = "พลังงานดีเยี่ยม ตารางงานสมดุลดีมาก";
  let Icon = Heart;

  if (level === "Warning") {
    colorClass = "text-amber-500";
    strokeColor = "rgba(245,158,11,1)";
    message = "เริ่มมีความตึงเครียด แนะนำกระจายงาน";
    Icon = ShieldAlert;
  } else if (level === "Critical") {
    colorClass = "text-rose-500";
    strokeColor = "rgba(244,63,94,1)";
    message = "เสี่ยงภาวะหมดไฟ แนะนำพักเต็มวัน";
    Icon = Flame;
  }

  // Semi-circle gauge math
  const r = 120;
  const circumference = Math.PI * r;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="sh-card p-5 flex flex-col h-full sh-fade-up">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2 tracking-tight">
          <Icon className={`w-4 h-4 ${colorClass}`} />
          Burnout Risk Indicator
        </h3>
      </div>

      {/* Gauge */}
      <div className="relative w-[280px] h-[140px] mx-auto flex justify-center mb-2">
        <svg
          width="280"
          height="140"
          viewBox="0 0 280 140"
          className="overflow-visible"
        >
          {/* Background Arc */}
          <path
            d="M 20 140 A 120 120 0 0 1 260 140"
            fill="none"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Progress Arc */}
          <path
            d="M 20 140 A 120 120 0 0 1 260 140"
            fill="none"
            stroke={strokeColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition:
                "stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.5s ease",
              filter: `drop-shadow(0 0 4px ${strokeColor}44)`,
            }}
          />
        </svg>

        {/* Text inside gauge */}
        <div className="absolute bottom-4 flex flex-col items-center">
          <div className="text-4xl font-extrabold tracking-tight leading-none text-zinc-100 flex items-baseline">
            {score}
            <span className="text-sm font-semibold text-zinc-500 ml-1">%</span>
          </div>
          <div
            className={`text-[10px] font-bold tracking-widest uppercase mt-2 ${colorClass}`}
          >
            {level}
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-zinc-400 font-medium leading-relaxed mb-6">
        {message}
      </div>

      {/* Factors Breakdown */}
      <div className="flex flex-col gap-4 mt-auto">
        <FactorRow
          label={factors.overdue.label}
          val={`${factors.overdue.score}/${factors.overdue.max}`}
          pct={(factors.overdue.score / factors.overdue.max) * 100}
          desc={`${factors.overdue.count} งาน`}
        />
        <FactorRow
          label={factors.intensity.label}
          val={`${factors.intensity.score}/${factors.intensity.max}`}
          pct={(factors.intensity.score / factors.intensity.max) * 100}
          desc={`${factors.intensity.count} งาน`}
        />
        <FactorRow
          label={factors.overwork.label}
          val={`${factors.overwork.score}/${factors.overwork.max}`}
          pct={(factors.overwork.score / factors.overwork.max) * 100}
          desc={`${factors.overwork.hours} ชม.`}
        />
        <FactorRow
          label={factors.noRest.label}
          val={`${factors.noRest.score}/${factors.noRest.max}`}
          pct={(factors.noRest.score / factors.noRest.max) * 100}
          desc={`${factors.noRest.days} วัน`}
        />
      </div>
    </div>
  );
}

function FactorRow({
  label,
  val,
  pct,
  desc,
}: {
  label: string;
  val: string;
  pct: number;
  desc: string;
}) {
  const barColor =
    pct > 75 ? "bg-rose-500" : pct > 40 ? "bg-amber-500" : "bg-emerald-500";
  const glowColor =
    pct > 75
      ? "shadow-[0_0_8px_rgba(244,63,94,0.3)]"
      : pct > 40
        ? "shadow-[0_0_8px_rgba(245,158,11,0.3)]"
        : "shadow-[0_0_8px_rgba(16,185,129,0.3)]";

  return (
    <div className="group">
      <div className="flex justify-between items-baseline text-xs mb-1.5">
        <span className="text-zinc-400 font-medium group-hover:text-zinc-300 transition-colors">
          {label}{" "}
          <span className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase ml-1">
            ({desc})
          </span>
        </span>
        <span className="font-semibold text-zinc-300">{val}</span>
      </div>
      <div className="w-full h-1.5 bg-zinc-800/60 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} ${glowColor} transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1)`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
