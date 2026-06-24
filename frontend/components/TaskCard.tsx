"use client";

import type { Task } from "@/lib/types";
import {
  Check,
  Clock,
  Calendar,
  Repeat,
  Trash2,
  Edit,
  AlertTriangle,
} from "lucide-react";

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
}

const DIFFICULTY_MAP = {
  Low: { label: "ง่าย", color: "bg-emerald-500" },
  Medium: { label: "ปานกลาง", color: "bg-amber-500" },
  High: { label: "ยาก", color: "bg-rose-500" },
} as const;

const STATUS_MAP = {
  Pending: { label: "รอดำเนินการ", color: "bg-zinc-500" },
  Scheduled: { label: "จัดตาราง", color: "bg-indigo-500" },
  Completed: { label: "เสร็จแล้ว", color: "bg-emerald-500" },
} as const;

function DeadlineBadge({ deadline }: { deadline: string }) {
  const diff = new Date(deadline).getTime() - Date.now();
  const days = Math.ceil(diff / 86_400_000);

  if (days < 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-red-900/30 bg-red-950/20 px-2 py-0.5 text-xs font-semibold text-red-400">
        <AlertTriangle className="h-3 w-3 shrink-0" />
        เกิน {Math.abs(days)} วัน
      </span>
    );
  }
  if (days === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-amber-900/30 bg-amber-950/20 px-2 py-0.5 text-xs font-semibold text-amber-400 animate-pulse">
        <Clock className="h-3 w-3 shrink-0" />
        วันนี้
      </span>
    );
  }
  if (days <= 3) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-400">
        <Clock className="h-3 w-3 shrink-0" />
        อีก {days} วัน
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
      <Calendar className="h-3 w-3 shrink-0" />
      อีก {days} วัน
    </span>
  );
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onComplete,
}: Props) {
  const diff = DIFFICULTY_MAP[task.difficulty];
  const status = STATUS_MAP[task.status as keyof typeof STATUS_MAP];
  const done = task.status === "Completed";

  return (
    <div
      className={`sh-card relative p-4 flex flex-col gap-3.5 overflow-hidden transition-all duration-200 anim-fade-up ${
        done
          ? "opacity-55 hover:opacity-85"
          : "hover:border-zinc-700/80 hover:shadow-md"
      }`}
    >
      {/* Subtle left-side border priority indicator */}
      {task.priority > 1 && (
        <div
          className={`absolute left-0 top-0 bottom-0 w-0.75 rounded-l-(--radius) ${
            task.priority >= 5
              ? "bg-linear-to-b from-rose-500 to-orange-500"
              : task.priority === 4
                ? "bg-linear-to-b from-orange-500 to-amber-500"
                : task.priority === 3
                  ? "bg-linear-to-b from-indigo-500 to-purple-500"
                  : "bg-zinc-700"
          }`}
        />
      )}

      {/* Row 1: checkbox + title & badges + action buttons */}
      <div className="flex items-start gap-3">
        {/* Polished Checkbox button */}
        <button
          onClick={() => onComplete(task.id)}
          title={done ? "ยกเลิกทำเสร็จ" : "ทำเสร็จแล้ว"}
          className={`h-5 w-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200 cursor-pointer ${
            done
              ? "bg-zinc-100 border-zinc-100 text-zinc-900"
              : "border-zinc-700 hover:border-zinc-500 bg-transparent text-transparent"
          }`}
        >
          <Check
            className={`h-3.5 w-3.5 stroke-[3px] ${done ? "block" : "hidden"}`}
          />
        </button>

        {/* Title and Badges container */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <h3
            className={`text-sm font-semibold leading-snug transition-all ${
              done ? "text-zinc-500 line-through" : "text-zinc-100"
            }`}
          >
            {task.title}
          </h3>

          {/* Badges Layout */}
          <div className="flex flex-wrap gap-1.5 items-center mt-1">
            {/* Difficulty Badge */}
            <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-950/40 px-2 py-0.5 text-[11px] text-zinc-300 font-medium">
              <span className={`h-1.5 w-1.5 rounded-full ${diff.color}`} />
              {diff.label}
            </span>

            {/* Status Badge */}
            <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-950/40 px-2 py-0.5 text-[11px] text-zinc-300 font-medium">
              <span className={`h-1.5 w-1.5 rounded-full ${status.color}`} />
              {status.label}
            </span>

            {/* Category Badge */}
            {task.category && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-indigo-950/20 px-2 py-0.5 text-[11px] text-indigo-300 font-medium">
                {task.category}
              </span>
            )}

            {/* Priority Numeric Badge */}
            {task.priority > 1 && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-950/40 px-2 py-0.5 text-[11px] font-medium ${
                  task.priority >= 4
                    ? "text-rose-400"
                    : task.priority === 3
                      ? "text-amber-400"
                      : "text-zinc-400"
                }`}
              >
                ความสำคัญ: {task.priority}
              </span>
            )}

            {/* Recurrence Badge */}
            {task.recurrence !== "none" && (
              <span
                className="inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-indigo-950/10 px-2 py-0.5 text-[11px] text-indigo-400 font-medium"
                title={`ซ้ำ: ${task.recurrence}`}
              >
                <Repeat className="h-3 w-3 shrink-0" />
                <span className="capitalize">{task.recurrence}</span>
              </span>
            )}
          </div>
        </div>

        {/* Actions Button container */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="h-7 w-7 inline-flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors cursor-pointer"
            title="แก้ไข"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="h-7 w-7 inline-flex items-center justify-center rounded-md text-zinc-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
            title="ลบ"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Row 2: duration & deadline meta */}
      <div className="flex items-center justify-between pl-8 border-t border-zinc-800/40 pt-2.5 mt-0.5">
        <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
          <Clock className="h-3.5 w-3.5" />
          {task.estimated_duration} นาที
        </span>
        {task.deadline && <DeadlineBadge deadline={task.deadline} />}
      </div>
    </div>
  );
}
