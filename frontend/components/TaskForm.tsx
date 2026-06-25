"use client";

import { useState } from "react";
import type { Task, AISubtask, Difficulty, Recurrence } from "@/lib/types";
import {
  X,
  Sparkles,
  AlertTriangle,
  Calendar,
  Folder,
  RefreshCw,
  Star,
} from "lucide-react";

interface Props {
  initial?: Partial<Task>;
  onSave: (
    data: Omit<Task, "id" | "user_id" | "created_at" | "status">,
  ) => Promise<void>;
  onClose: () => void;
  onBreakdown?: (title: string) => Promise<AISubtask[]>;
  onAddSubtask?: (
    subtask: Omit<Task, "id" | "user_id" | "created_at" | "status">,
  ) => Promise<void>;
}

const DAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

export default function TaskForm({
  initial,
  onSave,
  onClose,
  onBreakdown,
  onAddSubtask,
}: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [difficulty, setDifficulty] = useState<Difficulty>(
    initial?.difficulty ?? "Medium",
  );
  const [duration, setDuration] = useState(initial?.estimated_duration ?? 30);
  const [priority, setPriority] = useState(initial?.priority ?? 3);
  const [deadline, setDeadline] = useState(() => {
    if (initial?.deadline) {
      const date = new Date(initial.deadline);
      const tzOffset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    }
    if (initial?.id) {
      return "";
    }
    const date = new Date();
    date.setHours(date.getHours() + 6);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  });
  const [category, setCategory] = useState(initial?.category ?? "");
  const [recurrence, setRecurrence] = useState<Recurrence>(
    initial?.recurrence ?? "none",
  );
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>(
    initial?.recurrence_days ?? [],
  );

  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [subtasks, setSubtasks] = useState<AISubtask[]>([]);
  const [addingSubtasks, setAddingSubtasks] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await onSave({
      title: title.trim(),
      difficulty,
      estimated_duration: duration,
      priority,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      category: category.trim() || null,
      recurrence,
      recurrence_days: recurrence === "custom" ? recurrenceDays : null,
    });
    setSaving(false);
    onClose();
  };

  const handleBreakdown = async () => {
    if (!title.trim() || !onBreakdown) return;
    setAiLoading(true);
    const result = await onBreakdown(title.trim());
    setSubtasks(result);
    setAiLoading(false);
  };

  const handleAddAllSubtasks = async () => {
    if (!onAddSubtask) return;
    setAddingSubtasks(true);
    for (const sub of subtasks) {
      await onAddSubtask({
        title: sub.title,
        difficulty: sub.difficulty,
        estimated_duration: sub.duration,
        priority,
        deadline: null,
        category: category.trim() || null,
        recurrence: "none",
        recurrence_days: null,
      });
    }
    setAddingSubtasks(false);
    setSubtasks([]);
    onClose();
  };

  const toggleDay = (d: number) => {
    setRecurrenceDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  };

  const isEdit = !!initial?.id;

  return (
    <div
      className="fixed inset-0 bg-black/35 backdrop-blur-sm z-50 flex justify-end"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[500px] h-screen bg-white border-l border-zinc-800 shadow-2xl flex flex-col animate-slide-in-right [transform:translateZ(0)] [backface-visibility:hidden]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 shrink-0 bg-zinc-50/50">
          <h2 className="text-base font-extrabold tracking-tight text-zinc-100 flex items-center gap-2">
            {!isEdit ? (
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-zinc-800 text-indigo-600">
                <Folder className="w-3.5 h-3.5 text-indigo-600" />
              </div>
            )}
            <span>{isEdit ? "แก้ไขรายละเอียดงาน" : "สร้างงานชิ้นใหม่"}</span>
          </h2>
          <button
            className="h-8 w-8 shrink-0 flex items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-100 hover:text-zinc-100 border border-transparent hover:border-zinc-800 transition-all duration-200 cursor-pointer"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto min-h-0 bg-transparent">
          
          {/* Section 1: Core Details */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              ชื่องาน / ภารกิจ *
            </label>
            <div className="flex gap-2">
              <input
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-800 focus:bg-white focus:border-indigo-500/50 rounded-xl text-xs font-semibold text-zinc-100 placeholder:text-zinc-350 outline-none transition-all duration-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น ร่างเนื้อหารายงาน, สัมภาษณ์นักพัฒนา..."
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
              {onBreakdown && (
                <button
                  className="px-4 py-3 text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-550/15 transition-all duration-200 disabled:opacity-50 shrink-0 cursor-pointer"
                  onClick={handleBreakdown}
                  disabled={!title.trim() || aiLoading}
                >
                  {aiLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                  )}
                  <span>AI Breakdown</span>
                </button>
              )}
            </div>
          </div>

          {/* AI Subtasks result */}
          {subtasks.length > 0 && (
            <div className="border border-indigo-100/30 bg-indigo-50/40 rounded-2xl p-4.5 shadow-xs sh-fade-up">
              <div className="text-xs font-bold text-indigo-600 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500 fill-indigo-500/10" />
                <span>AI แตกงานย่อยอัตโนมัติ ({subtasks.length} งานย่อย)</span>
              </div>
              <div className="flex flex-col gap-2.5 mb-4">
                {subtasks.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-4 text-xs py-2 border-b border-zinc-800/60 last:border-0"
                  >
                    <span className="text-zinc-100 font-bold">{s.title}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`sh-badge text-[10px] font-bold ${
                          s.difficulty === "High"
                            ? "sh-badge-destructive"
                            : s.difficulty === "Medium"
                              ? "bg-amber-50 border-amber-100 text-amber-600"
                              : "bg-emerald-50 border-emerald-100 text-emerald-600"
                        }`}
                      >
                        {s.difficulty === "High"
                          ? "ยาก"
                          : s.difficulty === "Medium"
                            ? "ปานกลาง"
                            : "ง่าย"}
                      </span>
                      <span className="text-zinc-400 font-bold">
                        {s.duration} นาที
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="w-full py-3 text-xs font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-md cursor-pointer transition-all duration-200"
                onClick={handleAddAllSubtasks}
                disabled={addingSubtasks}
              >
                {addingSubtasks
                  ? "กำลังนำเข้างานย่อย..."
                  : `✓ เพิ่มงานย่อยทั้งหมดเข้าคลังงาน`}
              </button>
            </div>
          )}

          <div className="w-full h-px bg-zinc-800/60" />

          {/* Section 2: Metadata Configs */}
          <div className="flex flex-col gap-5">
            {/* Difficulty & Duration Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  ระดับความยาก
                </label>
                <div className="flex gap-1.5 p-1 bg-zinc-50 rounded-xl border border-zinc-800">
                  {(["Low", "Medium", "High"] as Difficulty[]).map((d) => {
                    const active = difficulty === d;
                    const label = d === "Low" ? "ง่าย" : d === "Medium" ? "ปานกลาง" : "ยาก";
                    const activeStyle =
                      d === "Low"
                        ? "bg-emerald-500 text-white shadow-[0_2px_8px_rgba(16,185,129,0.2)]"
                        : d === "Medium"
                          ? "bg-amber-500 text-white shadow-[0_2px_8px_rgba(245,158,11,0.2)]"
                          : "bg-rose-500 text-white shadow-[0_2px_8px_rgba(239,68,68,0.2)]";
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDifficulty(d)}
                        className={`flex-1 py-2 text-[10px] font-extrabold rounded-lg transition-all duration-200 cursor-pointer ${
                          active
                            ? activeStyle
                            : "text-zinc-400 hover:text-zinc-100 hover:bg-white"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  เวลาที่ต้องใช้ (นาที)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    className="w-full pl-4 pr-12 py-2.5 bg-zinc-50 border border-zinc-800 focus:bg-white focus:border-indigo-500/50 rounded-xl text-xs font-semibold text-zinc-100 outline-none transition-all duration-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                    value={duration}
                    min={5}
                    max={480}
                    step={5}
                    onChange={(e) => setDuration(Number(e.target.value))}
                  />
                  <span className="absolute right-4 text-[10px] font-bold text-zinc-400">นาที</span>
                </div>
              </div>
            </div>

            {/* Priority Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                ความสำคัญ (Priority)
              </label>
              <div className="flex gap-2.5">
                {[1, 2, 3, 4, 5].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center cursor-pointer transition-all duration-200 ${
                      priority >= p
                        ? "border-amber-400/50 bg-amber-500/10 text-amber-500 shadow-xs scale-102"
                        : "border-zinc-800 bg-zinc-50 text-zinc-400 hover:border-zinc-700 hover:bg-white"
                    }`}
                  >
                    <Star className="w-4.5 h-4.5 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            {/* Deadline & Category Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>กำหนดส่ง (Deadline)</span>
                </label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-800 focus:bg-white focus:border-indigo-500/50 rounded-xl text-xs font-semibold text-zinc-200 outline-none transition-all duration-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-zinc-400" />
                  <span>หมวดหมู่</span>
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-800 focus:bg-white focus:border-indigo-500/50 rounded-xl text-xs font-semibold text-zinc-100 placeholder:text-zinc-350 outline-none transition-all duration-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="เช่น งานวิจัย, ไลฟ์สไตล์"
                />
              </div>
            </div>

            <div className="w-full h-px bg-zinc-800/60" />

            {/* Section 3: Recurrence Setup */}
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
                <span>การทำซ้ำ (Recurrence)</span>
              </label>
              
              <div className="flex p-1 bg-zinc-50 rounded-xl border border-zinc-800">
                {(["none", "daily", "weekly", "custom"] as Recurrence[]).map((r) => {
                  const active = recurrence === r;
                  const label =
                    r === "none"
                      ? "ไม่ซ้ำ"
                      : r === "daily"
                        ? "ทุกวัน"
                        : r === "weekly"
                          ? "ทุกสัปดาห์"
                          : "กำหนดเอง";
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRecurrence(r)}
                      className={`flex-1 py-2.5 text-[10px] font-extrabold rounded-lg transition-all duration-200 cursor-pointer ${
                        active
                          ? "bg-white text-indigo-600 shadow-[0_2px_8px_rgba(99,102,241,0.06)] border border-indigo-100/30"
                          : "text-zinc-400 hover:text-zinc-150"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {recurrence === "custom" && (
                <div className="flex gap-1.5 mt-1.5 flex-wrap sh-fade-up">
                  {DAYS.map((d, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleDay(i)}
                      className={`w-9 h-9 rounded-xl border text-xs font-extrabold cursor-pointer transition-all duration-200 ${
                        recurrenceDays.includes(i)
                          ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-600 shadow-xs"
                          : "border-zinc-800 bg-zinc-50 text-zinc-400 hover:border-zinc-700 hover:bg-white"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end p-5 border-t border-zinc-800 bg-zinc-50/50 shrink-0">
          <button
            type="button"
            className="sh-btn sh-btn-outline px-5 py-2.5 rounded-xl text-xs font-bold border-zinc-800 text-zinc-450 hover:text-zinc-100 hover:bg-zinc-100 transition-all duration-200"
            onClick={onClose}
          >
            ยกเลิก
          </button>
          <button
            type="button"
            className="sh-btn sh-btn-default px-6 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/15 transition-all duration-200"
            onClick={handleSave}
            disabled={!title.trim() || saving}
          >
            {saving
              ? "กำลังบันทึก..."
              : isEdit
                ? "บันทึกการแก้ไข"
                : "ยืนยันสร้างงาน"}
          </button>
        </div>
      </div>
    </div>
  );
}
