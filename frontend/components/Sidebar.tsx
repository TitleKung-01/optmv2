"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEnergy } from "@/hooks/useEnergy";
import { useProfile } from "@/hooks/useProfile";
import EnergyGauge from "./EnergyGauge";
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
  const { profile, fetchProfile } = useProfile();
  const energy = useEnergy(profile);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const initial = user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <aside
      className={`sticky top-0 z-10 flex h-screen shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-200 transition-all duration-300 ease-in-out ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* ── Logo / collapse ─────────────────────────────── */}
      <div
        className={`flex items-center border-b border-zinc-800 p-4 min-h-16 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0 sh-fade-up">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <Zap className="h-4 w-4 fill-indigo-400/20" />
            </div>
            <span className="font-semibold tracking-tight text-zinc-100 truncate">
              SmartSched
            </span>
          </div>
        )}

        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "ขยาย" : "ย่อ"}
          className="sh-btn-ghost flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-400 hover:text-zinc-100 transition-colors duration-200"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* ── Energy gauge ────────────────────────────────── */}
      <div
        className={`border-b border-zinc-800 py-4 transition-all duration-300 ${
          collapsed ? "px-3 flex justify-center" : "px-4"
        }`}
      >
        <div
          className={`overflow-hidden transition-all duration-300 ${
            collapsed ? "w-10 h-10" : "w-full"
          }`}
        >
          <EnergyGauge energy={energy} compact />
        </div>
      </div>

      {/* ── Navigation ──────────────────────────────────── */}
      <nav className="flex-1 flex flex-col gap-1 p-2">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 rounded-md py-2.5 transition-colors duration-200 ${
                active
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
              } ${collapsed ? "justify-center px-0" : "px-3 text-sm font-medium"}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ── User row ────────────────────────────────────── */}
      <div className="mt-auto border-t border-zinc-800 p-3">
        <div
          className={`flex gap-3 transition-all duration-300 ${
            collapsed ? "flex-col items-center" : "items-center justify-between"
          }`}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-200">
              {initial}
            </div>
            {!collapsed && (
              <div className="min-w-0 sh-fade-up">
                <p className="truncate text-xs font-medium text-zinc-200">
                  {user?.email}
                </p>
                <p className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active
                </p>
              </div>
            )}
          </div>

          <button
            onClick={signOut}
            title="ออกจากระบบ"
            className="sh-btn-ghost flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-400 hover:bg-rose-950/30 hover:text-rose-400 border border-transparent hover:border-rose-900/30 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
