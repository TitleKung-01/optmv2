"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTasks } from "@/hooks/useTasks";
import { useSchedule } from "@/hooks/useSchedule";
import { useProfile } from "@/hooks/useProfile";
import { useEnergy } from "@/hooks/useEnergy";
import { useBurnout } from "@/hooks/useBurnout";
import Sidebar from "@/components/Sidebar";
import DashboardStats from "@/components/DashboardStats";
import {
  Calendar,
  User,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  MoreHorizontal,
  Search,
  Bell,
  HelpCircle,
  Plus,
  Check,
  ListTodo,
} from "lucide-react";

function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { tasks, fetchTasks, editTask } = useTasks();
  const { schedules, fetchSchedules } = useSchedule();
  const { profile, fetchProfile } = useProfile();
  const energy = useEnergy(profile);
  const { data: burnoutData } = useBurnout();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchSchedules(getTodayISO());
      fetchProfile();
    }
  }, [user, fetchTasks, fetchSchedules, fetchProfile]);

  useEffect(() => {
    if (profile !== undefined) {
      const hasCompletedOnboarding = profile && (
        profile.chronotype === 'Morning Lark' ||
        profile.chronotype === 'Third Bird' ||
        profile.chronotype === 'Night Owl'
      );
      if (!hasCompletedOnboarding) {
        router.replace("/onboarding");
      }
    }
  }, [profile, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-zinc-800 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const now = new Date();
  const greeting =
    now.getHours() < 12
      ? "Good morning"
      : now.getHours() < 17
        ? "Good afternoon"
        : "Good evening";

  // Compute stats
  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter((t) => t.status === "Pending" || t.status === "Scheduled").length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;

  // Wellbeing computations
  const energyPercent = energy?.percentage ?? 0;
  const energyCircumference = 2 * Math.PI * 40;
  const energyStrokeDash = (energyPercent / 100) * energyCircumference;

  const burnoutScore = burnoutData?.score ?? 0;
  const burnoutLevel = burnoutData?.level ?? "Safe";
  const isBurnoutCritical = burnoutLevel === "Critical";
  const isBurnoutWarning = burnoutLevel === "Warning";
  const burnoutColor = isBurnoutCritical ? "text-rose-500" : isBurnoutWarning ? "text-amber-500" : "text-emerald-600";
  const burnoutBg = isBurnoutCritical ? "bg-rose-500" : isBurnoutWarning ? "bg-amber-500" : "bg-emerald-500";
  const burnoutText = isBurnoutCritical ? "High" : isBurnoutWarning ? "Medium" : "Low";

  // List top 4 tasks (pending first, then completed)
  const pendingList = tasks.filter((t) => t.status !== "Completed");
  const completedList = tasks.filter((t) => t.status === "Completed");
  const displayTasks = [...pendingList, ...completedList].slice(0, 4);

  const handleToggleTask = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "Completed" ? "Pending" : "Completed";
    await editTask(id, { status: newStatus });
  };

  return (
    <div className="flex min-h-screen bg-transparent">
      <Sidebar />
      <main className="flex-1 min-w-0 bg-transparent text-on-background h-screen overflow-y-auto flex flex-col relative">
        {/* Dashboard Canvas */}
        <div className="p-10 max-w-7xl w-full mx-auto space-y-8 flex-1 pb-24 relative z-10">
          {/* Greeting & Date */}
          <section className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h3 className="text-2xl font-black text-zinc-100 mb-1.5 tracking-tight flex items-center gap-2">
                {greeting}, <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent font-black">{user.email?.split("@")[0]}</span> 👋
              </h3>
              <p className="text-sm text-zinc-300 font-semibold tracking-wide">
                Here's your productivity overview for today.
              </p>
            </div>
            <div className="bg-white/40 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/60 shadow-[0_2px_10px_rgba(31,38,135,0.02)] flex items-center gap-2.5 transition-all hover:bg-white/60 hover:border-white/80 cursor-pointer">
              <Calendar className="w-4 h-4 text-indigo-600 stroke-[2]" />
              <span className="text-xs font-extrabold text-zinc-100 tracking-wide">
                {now.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </section>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Quick Stats (Spans 8 columns on desktop) */}
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Stat Card 1: Total Tasks */}
              <div className="glass rounded-2xl p-6 hover:scale-102 hover:shadow-[0_15px_35px_rgba(99,102,241,0.08)] hover:border-indigo-500/25 relative overflow-hidden group cursor-pointer flex flex-col justify-between">
                <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-indigo-500/15 transition-all duration-300" />
                
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 border border-indigo-100/30 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-300">
                      <ListTodo className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <span className="bg-indigo-50/80 text-indigo-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-indigo-100/60 flex items-center gap-0.5 shadow-sm">
                      <TrendingUp className="w-3 h-3 text-indigo-500" /> 12%
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Tasks</p>
                  <h4 className="text-4xl font-black text-zinc-100 mt-1 tracking-tight group-hover:text-indigo-600 transition-colors duration-300">{totalTasks}</h4>
                </div>

                <div className="mt-4 pt-4 border-t border-white/50 w-full">
                  <div className="flex justify-between text-[10px] font-bold text-zinc-300 mb-1.5 uppercase tracking-wide">
                    <span>Completion Rate</span>
                    <span>{totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/50 rounded-full overflow-hidden border border-white/60">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%`, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              </div>

              {/* Stat Card 2: In Progress */}
              <div className="glass rounded-2xl p-6 hover:scale-102 hover:shadow-[0_15px_35px_rgba(245,158,11,0.08)] hover:border-amber-500/25 relative overflow-hidden group cursor-pointer flex flex-col justify-between">
                <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/15 transition-all duration-300" />

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-100/30 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-300">
                      <Clock className="w-5 h-5 stroke-[2.5]" />
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">In Progress</p>
                  <h4 className="text-4xl font-black text-zinc-100 mt-1 tracking-tight group-hover:text-amber-500 transition-colors duration-300">{inProgressTasks}</h4>
                </div>

                <div className="mt-4 pt-4 border-t border-white/50 w-full">
                  <div className="flex justify-between text-[10px] font-bold text-zinc-300 mb-1.5 uppercase tracking-wide">
                    <span>Active Focus</span>
                    <span>{inProgressTasks} task{inProgressTasks !== 1 ? 's' : ''}</span>
                  </div>
                  <p className="text-[10px] text-zinc-300 font-semibold leading-relaxed truncate">Waiting for action or scheduled</p>
                </div>
              </div>

              {/* Stat Card 3: Completed */}
              <div className="glass rounded-2xl p-6 hover:scale-102 hover:shadow-[0_15px_35px_rgba(16,185,129,0.08)] hover:border-emerald-500/25 relative overflow-hidden group cursor-pointer flex flex-col justify-between">
                <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/15 transition-all duration-300" />

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-100/30 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-300">
                      <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Completed</p>
                  <h4 className="text-4xl font-black text-zinc-100 mt-1 tracking-tight group-hover:text-emerald-600 transition-colors duration-300">{completedTasks}</h4>
                </div>

                <div className="mt-4 pt-4 border-t border-white/50 w-full">
                  <div className="flex justify-between text-[10px] font-bold text-zinc-300 mb-1.5 uppercase tracking-wide">
                    <span>Performance</span>
                    <span>{totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100}%</span>
                  </div>
                  <p className="text-[10px] text-emerald-600 font-bold leading-relaxed flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" /> Keep up the great work!
                  </p>
                </div>
              </div>
            </div>

            {/* Wellbeing (Spans 4 columns) */}
            <div className="md:col-span-4 glass rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group">
              <div className="relative z-10 w-full flex flex-col gap-6">
                <div className="flex justify-between items-center pb-3 border-b border-white/45">
                  <h4 className="text-sm font-extrabold text-zinc-100 uppercase tracking-wider">Wellbeing</h4>
                  <button className="text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
                {/* Circular Energy Gauge and Info */}
                <div className="flex items-center gap-6">
                  <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle className="text-zinc-800" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="8" />
                      <circle className="text-indigo-600" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray={`${energyStrokeDash} ${energyCircumference}`} strokeLinecap="round" strokeWidth="8" style={{ transition: 'stroke-dasharray 0.6s ease' }} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-black text-zinc-100">{energyPercent}<span className="text-[10px] font-semibold">%</span></span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-100 mb-0.5 flex items-center gap-1.5">
                      Energy Level 
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${
                        energy?.level === 'peak' ? 'bg-emerald-50/80 text-emerald-600 border border-emerald-100' : energy?.level === 'dip' ? 'bg-rose-50/80 text-rose-500 border border-rose-100' : 'bg-indigo-50/80 text-indigo-600 border border-indigo-100'
                      }`}>
                        {energy?.label}
                      </span>
                    </p>
                    <p className="text-xs text-zinc-300 font-medium">Optimum focus zone.</p>
                  </div>
                </div>
                {/* Horizontal Burnout Risk Gauge */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Burnout Risk</p>
                    <span className={`text-xs font-extrabold ${burnoutColor}`}>{burnoutText}</span>
                  </div>
                  <div className="w-full h-2.5 bg-white/50 border border-white/60 rounded-full overflow-hidden">
                    <div className={`h-full ${burnoutBg} rounded-full shadow-[0_0_8px_rgba(99,102,241,0.2)]`} style={{ width: `${burnoutScore || 25}%`, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
                {/* Chronotype Badge */}
                {profile?.chronotype && (
                  <div className="py-2.5 px-3.5 rounded-xl bg-white/50 border border-indigo-500/10 text-[10px] font-bold text-indigo-600 text-center flex items-center justify-center gap-2 uppercase tracking-wider shadow-sm">
                    <User className="w-3.5 h-3.5 stroke-[2]" />
                    Chronotype: {profile.chronotype}
                  </div>
                )}
              </div>
            </div>

            {/* Main Chart Area (Spans 8 columns) */}
            <div className="md:col-span-8 glass rounded-2xl overflow-hidden">
              <DashboardStats tasks={tasks} />
            </div>

            {/* Upcoming Tasks List (Spans 4 columns) */}
            <div className="md:col-span-4 glass rounded-2xl p-6 flex flex-col justify-between group">
              <div className="w-full flex flex-col h-full gap-5">
                <div className="flex justify-between items-center pb-3 border-b border-white/45">
                  <h4 className="text-xs font-extrabold text-zinc-100 uppercase tracking-wider">Upcoming Tasks</h4>
                  <button
                    onClick={() => router.push("/tasks")}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
                  {displayTasks.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-zinc-300">
                      <CheckCircle2 className="w-8 h-8 text-zinc-300 mb-2 stroke-[1.5]" />
                      <p className="text-xs font-semibold text-zinc-300">No tasks created yet.</p>
                    </div>
                  ) : (
                    displayTasks.map((task) => {
                      const isCompleted = task.status === "Completed";
                      const isHigh = task.difficulty === "High";
                      const isMedium = task.difficulty === "Medium";
                      const borderLeftAccent = isHigh ? "border-l-rose-500" : isMedium ? "border-l-amber-500" : "border-l-emerald-500";
                      return (
                        <div
                          key={task.id}
                          className={`flex items-start gap-3 p-3 rounded-xl bg-white/40 border border-white/55 border-l-4 ${borderLeftAccent} hover:bg-white/80 hover:translate-x-1 transition-all duration-200 group cursor-pointer ${
                            isCompleted ? "opacity-60" : ""
                          }`}
                        >
                          <button
                            onClick={() => handleToggleTask(task.id, task.status)}
                            className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                              isCompleted
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                                : "border-zinc-300 hover:border-indigo-600 bg-white"
                            }`}
                          >
                            {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-semibold text-zinc-100 truncate transition-colors ${
                                isCompleted ? "line-through text-zinc-300" : "group-hover:text-indigo-600"
                              }`}
                            >
                              {task.title}
                            </p>
                            <p className="text-[10px] text-zinc-300 font-bold mt-1.5 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-zinc-300 stroke-[2]" />
                              {task.deadline
                                ? new Date(task.deadline).toLocaleDateString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : `${task.estimated_duration} min`}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wide border ${
                              isHigh
                                ? "bg-rose-50/80 text-rose-700 border-rose-100"
                                : isMedium
                                  ? "bg-amber-50/80 text-amber-700 border-amber-100"
                                  : "bg-emerald-50/80 text-emerald-700 border-emerald-100"
                            }`}
                          >
                            {task.difficulty}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
