"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";

/* ── Nav config ───────────────────────────────────────────────────────────── */
const NAV = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", Icon: CheckSquare },
  { href: "/schedule", label: "Schedule", Icon: Calendar },
  { href: "/profile", label: "Profile", Icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const initial = user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <aside
      className={`z-10 flex h-screen shrink-0 flex-col transition-all duration-300 ease-in-out ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div
        className={`fixed top-0 bottom-0 left-0 z-10 flex flex-col transition-all duration-300 ease-in-out ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Floating Inner Glass Container */}
        <div className="m-4 mr-0 flex flex-1 flex-col rounded-[24px] border border-white/60 bg-white/75 backdrop-blur-md shadow-[0_8px_32px_rgba(31,38,135,0.02)] overflow-hidden [transform:translateZ(0)] [backface-visibility:hidden]">
        
        {/* ── Logo / collapse ─────────────────────────────── */}
        <div
          className={`flex items-center border-b border-white/45 p-4 min-h-16 ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!collapsed ? (
            <div className="flex items-center gap-2.5 min-w-0 sh-fade-up">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/10">
                <Zap className="h-4.5 w-4.5 text-white fill-white/20" />
              </div>
              <div className="flex flex-col">
                <span className="font-black tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent truncate text-base leading-none">
                  SmartSched
                </span>
                <span className="text-[8px] font-extrabold text-zinc-300 tracking-wider mt-0.5 uppercase">
                  AI Productivity
                </span>
              </div>
            </div>
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/10">
              <Zap className="h-4.5 w-4.5 text-white fill-white/20" />
            </div>
          )}

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              title="ย่อแถบข้าง"
              className="sh-btn-ghost flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/40 border border-transparent hover:border-white/50 transition-all duration-200 cursor-pointer"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
          )}
        </div>

        {/* ── Navigation ──────────────────────────────────── */}
        <nav className="flex-1 flex flex-col gap-2 p-3 overflow-y-auto">
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              title="ขยายแถบข้าง"
              className="mb-2 mx-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-white/40 border border-transparent hover:border-white/50 transition-all duration-200 cursor-pointer"
            >
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          )}
          
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={`relative flex items-center gap-3 rounded-2xl py-3 transition-all duration-250 ${
                  active
                    ? "bg-gradient-to-r from-indigo-50/70 to-violet-50/70 text-indigo-600 border border-indigo-100/40 font-black shadow-[0_4px_12px_rgba(99,102,241,0.04)]"
                    : "text-zinc-400 hover:bg-white/40 hover:text-zinc-100 border border-transparent"
                } ${collapsed ? "justify-center px-0" : "px-4 text-sm"}`}
              >
                {active && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-indigo-600 rounded-r-lg" />
                )}
                <Icon className={`h-4.5 w-4.5 shrink-0 transition-transform duration-300 ${active ? "scale-110 text-indigo-600" : "text-zinc-400"}`} />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* ── User row ────────────────────────────────────── */}
        <div className="mt-auto border-t border-white/45 p-3 bg-white/10">
          {!collapsed ? (
            <div className="flex items-center justify-between gap-2.5 p-2 rounded-2xl bg-white/40 border border-white/60 hover:bg-white/60 transition-all duration-300 group">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-black text-white shadow-md shadow-indigo-500/10">
                  {initial}
                </div>
                <div className="min-w-0 sh-fade-up">
                  <p className="truncate text-xs font-black text-zinc-100 leading-snug">
                    {user?.email?.split("@")[0]}
                  </p>
                  <p className="text-[10px] text-zinc-300 font-bold flex items-center gap-1 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Active
                  </p>
                </div>
              </div>
              <button
                onClick={signOut}
                title="ออกจากระบบ"
                className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-rose-500/15 hover:text-rose-600 border border-transparent hover:border-rose-200/30 transition-all duration-200 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-1">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-black text-white shadow-md shadow-indigo-500/10">
                {initial}
              </div>
              <button
                onClick={signOut}
                title="ออกจากระบบ"
                className="h-8 w-8 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-rose-500/15 hover:text-rose-600 border border-transparent hover:border-rose-200/30 transition-all duration-200 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </aside>
  );
}
