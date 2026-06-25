"use client";

import { Lightbulb } from "lucide-react";

export default function SmartTipsCard() {
  return (
    <div className="sh-card p-5 flex flex-col">
      <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
        Smart Tips
      </div>
      <ul className="text-xs text-zinc-500 font-medium leading-relaxed list-none flex flex-col gap-2">
        <li className="flex gap-1.5 items-start">
          <span className="text-indigo-400 font-bold mt-0.5">•</span>
          <span>
            เลือกวันที่มีสัญลักษณ์จุด purple glow ใต้เลขปฏิทินเพื่อดูงานวันนั้นๆ
          </span>
        </li>
        <li className="flex gap-1.5 items-start">
          <span className="text-indigo-400 font-bold mt-0.5">•</span>
          <span>
            ลากเครื่องหมาย ⠿ ในตาราง Timeline เพื่อทำการปรับสลับเวลาตามที่ชอบ
          </span>
        </li>
      </ul>
    </div>
  );
}
