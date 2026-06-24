"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTasks } from "@/hooks/useTasks";
import { spawnRecurring } from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import TaskCard from "@/components/TaskCard";
import TaskForm from "@/components/TaskForm";
import type { Task, TaskStatus } from "@/lib/types";
import {
  Plus,
  Trash2,
  Search,
  Filter as FilterIcon,
  Loader2,
  Sparkles,
} from "lucide-react";

type Filter = "All" | TaskStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "All", label: "ทั้งหมด" },
  { key: "Pending", label: "รอดำเนินการ" },
  { key: "Scheduled", label: "จัดตารางแล้ว" },
  { key: "Completed", label: "เสร็จแล้ว" },
];

export default function TasksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const {
    tasks,
    loading,
    fetchTasks,
    addTask,
    editTask,
    removeTask,
    breakdownWithAI,
    clearAllTasks,
  } = useTasks();

  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchTasks();
      const today = new Date().toISOString().slice(0, 10);
      spawnRecurring(today).catch(() => {});
    }
  }, [user, fetchTasks]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-zinc-800 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const filtered = tasks.filter((t) => {
    if (filter !== "All" && t.status !== filter) return false;
    if (
      search &&
      !t.title.toLowerCase().includes(search.toLowerCase()) &&
      !t.category?.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const handleComplete = async (task: Task) => {
    const newStatus = task.status === "Completed" ? "Pending" : "Completed";
    await editTask(task.id, { status: newStatus });
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleSave = async (
    data: Omit<Task, "id" | "user_id" | "created_at" | "status">,
  ) => {
    if (editingTask) {
      await editTask(editingTask.id, data);
    } else {
      await addTask(data);
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const handleClearAll = async () => {
    if (tasks.length === 0) return;
    const ok = window.confirm(
      "ล้างงานทั้งหมดและตารางที่เกี่ยวข้อง?\nการกระทำนี้ไม่สามารถย้อนกลับได้",
    );
    if (!ok) return;

    setClearing(true);
    try {
      await clearAllTasks();
    } catch (error) {
      console.error("Clear tasks error:", error);
      alert("ล้างข้อมูลไม่สำเร็จ");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar />
      <main className="flex-1 min-w-0 p-8 overflow-y-auto max-w-7xl mx-auto sh-fade-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-900">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 flex items-center gap-2">
              Tasks
            </h1>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              คลังงานและภารกิจส่วนตัวทั้งหมดของคุณ
            </p>
          </div>
          <div className="flex gap-2.5 items-center">
            <button
              id="add-task-btn"
              className="sh-btn sh-btn-default px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10"
              onClick={() => {
                setEditingTask(null);
                setShowForm(true);
              }}
            >
              <Plus className="w-4 h-4" />
              สร้างงานใหม่
            </button>
            <button
              type="button"
              className="sh-btn sh-btn-outline px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 text-zinc-400 border-zinc-800 hover:text-rose-400 hover:bg-rose-500/5 hover:border-rose-500/20"
              onClick={handleClearAll}
              disabled={clearing || tasks.length === 0}
            >
              <Trash2 className="w-4 h-4" />
              {clearing ? "กำลังล้าง..." : "ล้างคลังงาน"}
            </button>
          </div>
        </div>

        {/* Filters and Search Control Grid */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-6">
          {/* Filter Tabs */}
          <div className="flex p-1 bg-zinc-900/60 border border-zinc-800 rounded-lg max-w-fit">
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-zinc-800 text-zinc-100 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {f.label}
                  {f.key === "All" && (
                    <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">
                      {tasks.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative max-w-full md:max-w-[280px] w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              className="sh-input pl-9 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่องาน หรือหมวดหมู่..."
            />
          </div>
        </div>

        {/* Task List Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="sh-card h-32 sh-skeleton" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="sh-card flex flex-col items-center justify-center py-20 text-center border-dashed border-zinc-800">
            <FilterIcon className="w-10 h-10 text-zinc-700 mb-3 stroke-[1.5]" />
            <h3 className="text-sm font-semibold text-zinc-300 mb-1">
              {search
                ? "ไม่พบคู่ผลลัพธ์ที่ค้นหา"
                : "ยังไม่มีงานที่ตรงกับหมวดหมู่"}
            </h3>
            <p className="text-xs text-zinc-500 max-w-[280px]">
              {search
                ? "ลองใช้คีย์เวิร์ดอื่นในการค้นหา หรือล้างคำค้นหา"
                : 'เริ่มสร้างงานชิ้นแรกด้วยปุ่ม "+ สร้างงานใหม่" ด้านบน'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEdit}
                onDelete={removeTask}
                onComplete={() => handleComplete(task)}
              />
            ))}
          </div>
        )}

        {/* Task Form Modal */}
        {showForm && (
          <TaskForm
            initial={editingTask ?? undefined}
            onSave={handleSave}
            onClose={handleClose}
            onBreakdown={breakdownWithAI}
            onAddSubtask={async (sub) => {
              await addTask(sub);
            }}
          />
        )}
      </main>
    </div>
  );
}
