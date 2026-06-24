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
  const [deadline, setDeadline] = useState(
    initial?.deadline ? initial.deadline.slice(0, 16) : "",
  );
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
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[540px] max-h-[90vh] overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl flex flex-col sh-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h2 className="text-base font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
            {!isEdit && <Sparkles className="w-4 h-4 text-indigo-400" />}
            {isEdit ? "แก้ไขรายละเอียดงาน" : "สร้างงานชิ้นใหม่"}
          </h2>
          <button
            className="sh-btn sh-btn-ghost p-1.5 text-zinc-500 hover:text-zinc-300"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-5 overflow-y-auto">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">
              ชื่องาน *
            </label>
            <div className="flex gap-2">
              <input
                className="sh-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น ร่างเนื้อหารายงาน, วิ่งจ็อกกิ้ง..."
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
              {onBreakdown && (
                <button
                  className="sh-btn sh-btn-secondary px-3 py-2 text-xs flex-shrink-0 flex items-center gap-1.5 border border-zinc-800 bg-zinc-900"
                  onClick={handleBreakdown}
                  disabled={!title.trim() || aiLoading}
                >
                  {aiLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-zinc-600 border-t-zinc-200 rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  )}
                  AI Breakdown
                </button>
              )}
            </div>
          </div>

          {/* AI Subtasks result */}
          {subtasks.length > 0 && (
            <div className="border border-indigo-500/20 bg-indigo-950/10 rounded-md p-4">
              <div className="text-xs font-semibold text-indigo-400 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI วิเคราะห์แตกเป็น {subtasks.length} งานย่อยที่ทำได้จริง:
              </div>
              <div className="flex flex-col gap-2.5 mb-4">
                {subtasks.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-4 text-xs py-1 border-b border-zinc-800/40 last:border-0"
                  >
                    <span className="text-zinc-300 font-medium">{s.title}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`sh-badge text-[10px] ${s.difficulty === "High" ? "sh-badge-destructive" : s.difficulty === "Medium" ? "sh-badge-secondary" : "sh-badge-outline"}`}
                      >
                        {s.difficulty === "High"
                          ? "ยาก"
                          : s.difficulty === "Medium"
                            ? "ปานกลาง"
                            : "ง่าย"}
                      </span>
                      <span className="text-zinc-500 font-semibold">
                        {s.duration} น.
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="sh-btn sh-btn-default w-full py-2.5 text-xs font-semibold shadow-md bg-indigo-600 text-white hover:bg-indigo-500"
                onClick={handleAddAllSubtasks}
                disabled={addingSubtasks}
              >
                {addingSubtasks
                  ? "กำลังนำเข้าแบบกลุ่ม..."
                  : `✓ เพิ่ม subtasks ทั้งหมด (${subtasks.length} งาน)`}
              </button>
            </div>
          )}

          {/* Difficulty + Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">
                ระดับความยาก
              </label>
              <select
                className="sh-input bg-zinc-950"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              >
                <option value="Low">Low (ง่าย - ใช้พลังงานต่ำ)</option>
                <option value="Medium">Medium (ปานกลาง)</option>
                <option value="High">High (ยาก - ใช้สมาธิสูง)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">
                เวลาโดยประมาณ (นาที)
              </label>
              <input
                type="number"
                className="sh-input"
                value={duration}
                min={5}
                max={480}
                step={5}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">
              ความสำคัญ (Priority)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`w-9 h-9 rounded-md border flex items-center justify-center cursor-pointer transition-all ${
                    priority >= p
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                      : "border-zinc-800 bg-transparent text-zinc-600 hover:border-zinc-700"
                  }`}
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
              ))}
            </div>
          </div>

          {/* Deadline + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 tracking-wider uppercase flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                Deadline
              </label>
              <input
                type="datetime-local"
                className="sh-input text-zinc-300"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 tracking-wider uppercase flex items-center gap-1">
                <Folder className="w-3.5 h-3.5 text-zinc-500" />
                หมวดหมู่
              </label>
              <input
                className="sh-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="เช่น งานเขียน, สุขภาพ"
              />
            </div>
          </div>

          {/* Recurrence */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400 tracking-wider uppercase flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
              การจัดตารางงานซ้ำ
            </label>
            <div className="flex gap-2 flex-wrap">
              {(["none", "daily", "weekly", "custom"] as Recurrence[]).map(
                (r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRecurrence(r)}
                    className={`sh-btn px-3 py-1.5 text-xs font-semibold transition-all ${
                      recurrence === r ? "sh-btn-default" : "sh-btn-outline"
                    }`}
                  >
                    {r === "none"
                      ? "ไม่ซ้ำ"
                      : r === "daily"
                        ? "ทุกวัน"
                        : r === "weekly"
                          ? "ทุกสัปดาห์"
                          : "กำหนดวันเอง"}
                  </button>
                ),
              )}
            </div>
            {recurrence === "custom" && (
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {DAYS.map((d, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className={`w-8 h-8 rounded-md border text-xs font-semibold cursor-pointer transition-all ${
                      recurrenceDays.includes(i)
                        ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                        : "border-zinc-800 bg-transparent text-zinc-500 hover:border-zinc-700"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end p-5 border-t border-zinc-800 bg-zinc-950">
          <button className="sh-btn sh-btn-outline px-4 py-2" onClick={onClose}>
            ยกเลิก
          </button>
          <button
            className="sh-btn sh-btn-default px-5 py-2 font-semibold"
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
