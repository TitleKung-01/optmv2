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
import ConfirmClearTasksModal from "@/components/ConfirmClearTasksModal";
import {
  Plus,
  Trash2,
  Search,
  Filter as FilterIcon,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

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
  const [showConfirmClearModal, setShowConfirmClearModal] = useState(false);

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

  const handleClearAll = () => {
    if (tasks.length === 0) return;
    setShowConfirmClearModal(true);
  };

  const executeClearAll = async () => {
    setShowConfirmClearModal(false);
    setClearing(true);
    const promise = clearAllTasks();
    toast.promise(promise, {
      loading: "กำลังล้างคลังงานและตารางที่เกี่ยวข้อง...",
      success: "ล้างคลังงานและตารางเรียบร้อยแล้ว",
      error: "ล้างข้อมูลไม่สำเร็จ",
    });
    try {
      await promise;
    } catch (error) {
      console.error("Clear tasks error:", error);
    } finally {
      setClearing(false);
    }
  };

  return (
    <>
      <div className="flex min-h-screen bg-transparent">
      <Sidebar />
      <main className="flex-1 min-w-0 p-8 overflow-y-auto max-w-7xl mx-auto sh-fade-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/45">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 flex items-center gap-2">
              Tasks
            </h1>
            <p className="text-sm text-zinc-300 font-semibold mt-1">
              คลังงานและภารกิจส่วนตัวทั้งหมดของคุณ
            </p>
          </div>
          <div className="flex gap-2.5 items-center">
            <button
              id="add-task-btn"
              className="sh-btn sh-btn-default px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10 rounded-xl"
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
              className="sh-btn sh-btn-outline px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 text-zinc-400 border-zinc-800 hover:text-rose-500 hover:bg-rose-500/5 hover:border-rose-500/20 rounded-xl"
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
          <div className="flex p-1 bg-white/40 backdrop-blur-md border border-white/55 rounded-xl max-w-fit shadow-xs gap-1">
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? "bg-white/70 text-indigo-600 shadow-xs border border-white/70"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/20 border border-transparent"
                  }`}
                >
                  {f.label}
                  {f.key === "All" && (
                    <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      active 
                        ? "bg-indigo-600/10 text-indigo-600 border border-indigo-500/10" 
                        : "bg-white/60 text-zinc-400 border border-white/50"
                    }`}>
                      {tasks.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative max-w-full md:max-w-[280px] w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              className="sh-input pl-9 text-xs bg-white/40 border-white/65 focus:bg-white/75 transition-all duration-200 rounded-xl"
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
          <div className="sh-card flex flex-col items-center justify-center py-20 text-center border-dashed border-white/55">
            <FilterIcon className="w-10 h-10 text-zinc-300 mb-3 stroke-[1.5]" />
            <h3 className="text-sm font-bold text-zinc-100 mb-1">
              {search
                ? "ไม่พบคู่ผลลัพธ์ที่ค้นหา"
                : "ยังไม่มีงานที่ตรงกับหมวดหมู่"}
            </h3>
            <p className="text-xs text-zinc-300 max-w-[280px] font-medium">
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

      </main>
    </div>

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

    {/* Beautiful Custom Confirm Clear Modal */}
    <ConfirmClearTasksModal
      isOpen={showConfirmClearModal}
      clearing={clearing}
      onClose={() => setShowConfirmClearModal(false)}
      onConfirm={executeClearAll}
    />
  </>
);
}
