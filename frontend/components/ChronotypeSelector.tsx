import React from "react";
import type { Chronotype } from "@/lib/types";

const CHRONOTYPES: {
  key: Chronotype;
  label: string;
  icon: string;
  desc: string;
}[] = [
  {
    key: "Morning Lark",
    label: "Morning Lark",
    icon: "🐦",
    desc: "ตื่นเช้า มีพลังสูงสุดช่วงเช้า",
  },
  {
    key: "Third Bird",
    label: "Third Bird",
    icon: "🦅",
    desc: "กลางๆ ระหว่างเช้าและเย็น",
  },
  {
    key: "Night Owl",
    label: "Night Owl",
    icon: "🦉",
    desc: "มีพลังสูงสุดช่วงกลางคืน",
  },
];

interface ChronotypeSelectorProps {
  chronotype: Chronotype | "";
  onSelectChronotype: (c: Chronotype) => void;
  onOpenQuiz: () => void;
}

export default function ChronotypeSelector({
  chronotype,
  onSelectChronotype,
  onOpenQuiz,
}: ChronotypeSelectorProps) {
  return (
    <div className="sh-card p-6">
      <div className="flex justify-between items-center mb-1">
        <div className="text-sm font-bold text-zinc-200 flex items-center gap-1.5">
          🦅 Chronotype
        </div>
        <button
          onClick={onOpenQuiz}
          className="px-3 py-1.5 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
        >
          📝 ทำแบบทดสอบค้นหา
        </button>
      </div>
      <div className="text-xs text-zinc-500 mb-5 font-medium">
        เลือกประเภทนาฬิกาชีวภาพของคุณ หรือทำแบบทดสอบเพื่อผลลัพธ์ที่แม่นยำที่สุด
      </div>
      <div className="flex flex-wrap gap-3">
        {CHRONOTYPES.map((c) => {
          const active = chronotype === c.key;
          return (
            <button
              key={c.key}
              onClick={() => onSelectChronotype(c.key)}
              className={`flex-1 min-w-[160px] p-5 rounded-xl border-2 transition-all duration-300 text-left cursor-pointer ${
                active
                  ? "border-indigo-500 bg-indigo-500/10 shadow-md shadow-indigo-500/5"
                  : "border-white/60 bg-white/40 hover:bg-white/70 hover:border-white/85 shadow-xs hover:scale-102"
              }`}
            >
              <div className="text-3xl mb-3">{c.icon}</div>
              <div
                className={`text-sm font-semibold mb-1 ${
                  active ? "text-indigo-400" : "text-zinc-200"
                }`}
              >
                {c.label}
              </div>
              <div className="text-xs text-zinc-500 leading-relaxed">
                {c.desc}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
