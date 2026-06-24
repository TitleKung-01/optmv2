"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";

interface Props {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
}

const MONTHS_TH = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const WEEKDAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

export default function MiniCalendar({ selectedDate, onSelectDate }: Props) {
  const { user } = useAuth();

  // วันปัจจุบันจริงๆ
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => today.toISOString().slice(0, 10), [today]);

  // เดือนที่กำลังแสดงบนหน้าปฏิทิน
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date(selectedDate);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // วันที่มีงานเก็บใน Set (รูปแบบ YYYY-MM-DD)
  const [taskDates, setTaskDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // ดึงข้อมูลวันที่มีงานในเดือนนั้นๆ จาก Supabase
  useEffect(() => {
    if (!user) return;

    async function fetchMonthTaskDates() {
      if (!user?.id) return;
      setLoading(true);
      try {
        // หาช่วงเวลาเริ่มและสิ้นสุดของเดือนปัจจุบันบนปฏิทิน
        const startOfMonth = new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth(),
          1,
        );
        const endOfMonth = new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        );

        const { data, error } = await supabase
          .from("schedules")
          .select("start_time")
          .eq("user_id", user.id)
          .gte("start_time", startOfMonth.toISOString())
          .lte("start_time", endOfMonth.toISOString());

        if (error) throw error;

        // นำ start_time มาแปลงเป็น YYYY-MM-DD แล้วเก็บลง Set เพื่อเช็คความเร็วสูง
        const datesSet = new Set<string>();
        data?.forEach((s: { start_time: string }) => {
          const dateStr = s.start_time.slice(0, 10);
          datesSet.add(dateStr);
        });

        setTaskDates(datesSet);
      } catch (err) {
        console.error("Error fetching calendar task dates:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMonthTaskDates();
  }, [user, currentMonth]);

  // คำนวณวันในหน้าปฏิทิน
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // หาวันแรกของเดือน (0 = อาทิตย์, 1 = จันทร์...)
    const firstDayIndex = new Date(year, month, 1).getDay();

    // หาจำนวนวันทั้งหมดในเดือนนี้
    const totalDays = new Date(year, month + 1, 0).getDate();

    // หาจำนวนวันทั้งหมดในเดือนก่อนหน้า (สำหรับเอามาปูส่วนหัว)
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] =
      [];

    // 1. ปูหัวด้วยวันจากเดือนก่อนหน้า
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthTotalDays - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      days.push({ dateStr, dayNum, isCurrentMonth: false });
    }

    // 2. วันในเดือนปัจจุบัน
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      days.push({ dateStr, dayNum: i, isCurrentMonth: true });
    }

    // 3. วันจากเดือนถัดไปมาปูท้ายให้เต็ม Grid 42 ช่อง
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      days.push({ dateStr, dayNum: i, isCurrentMonth: false });
    }

    return days;
  }, [currentMonth]);

  // เปลี่ยนเดือน
  const prevMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  };

  return (
    <div className="sh-card p-5 sh-fade-up">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-semibold text-zinc-200">
            {MONTHS_TH[currentMonth.getMonth()]}{" "}
            {currentMonth.getFullYear() + 543}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="sh-btn sh-btn-ghost p-1.5 rounded text-zinc-500 hover:text-zinc-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              setCurrentMonth(
                new Date(today.getFullYear(), today.getMonth(), 1),
              )
            }
            className="sh-btn sh-btn-outline px-2.5 py-1 text-[10px] font-bold border-zinc-800 text-zinc-400 hover:text-zinc-200 uppercase tracking-wider"
          >
            วันนี้
          </button>
          <button
            onClick={nextMonth}
            className="sh-btn sh-btn-ghost p-1.5 rounded text-zinc-500 hover:text-zinc-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 text-center mb-3">
        {WEEKDAYS.map((day) => (
          <span
            key={day}
            className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest"
          >
            {day}
          </span>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-2.5 gap-x-1.5 text-center">
        {calendarDays.map((day, idx) => {
          const isSelected = day.dateStr === selectedDate;
          const isToday = day.dateStr === todayStr;
          const hasTasks = taskDates.has(day.dateStr);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectDate(day.dateStr)}
              className={`relative flex flex-col items-center justify-center h-9 w-9 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-105"
                  : isToday
                    ? "border border-indigo-500/30 text-indigo-400 bg-indigo-500/5"
                    : day.isCurrentMonth
                      ? "text-zinc-300 hover:bg-zinc-900"
                      : "text-zinc-600 hover:bg-zinc-900/50"
              }`}
            >
              <span>{day.dayNum}</span>
              {/* Task Indicator Dot */}
              {hasTasks && (
                <span
                  className={`absolute bottom-1 w-1 h-1 rounded-full ${
                    isSelected
                      ? "bg-white"
                      : "bg-indigo-400 shadow-[0_0_4px_rgba(99,102,241,0.6)]"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
