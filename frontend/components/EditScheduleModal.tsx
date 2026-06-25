"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { Schedule } from "@/lib/types";

interface EditScheduleModalProps {
  isOpen: boolean;
  schedule: Schedule | null;
  onClose: () => void;
  onSave: (startTime: string, endTime: string, title?: string) => Promise<void>;
}

function getLocalHHMM(isoString: string) {
  const d = new Date(isoString);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export default function EditScheduleModal({
  isOpen,
  schedule,
  onClose,
  onSave,
}: EditScheduleModalProps) {
  const [mounted, setMounted] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [title, setTitle] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);

  // States for input focus styles
  const [titleFocused, setTitleFocused] = useState(false);
  const [startFocused, setStartFocused] = useState(false);
  const [endFocused, setEndFocused] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen && schedule) {
      setStartTime(getLocalHHMM(schedule.start_time));
      setEndTime(getLocalHHMM(schedule.end_time));
      setTitle(schedule.tasks?.title ?? "");
      setErrorMsg("");
      setSaving(false);
    }
  }, [isOpen, schedule]);

  if (!isOpen || !schedule) return null;

  const isTask = schedule.event_type === "Task";

  const handleSave = async () => {
    if (isTask && !title.trim()) {
      setErrorMsg("กรุณากรอกชื่องาน / กิจกรรม");
      return;
    }
    if (!startTime || !endTime) {
      setErrorMsg("กรุณากรอกเวลาเริ่มต้นและเวลาสิ้นสุด");
      return;
    }
    if (startTime >= endTime) {
      setErrorMsg("เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มต้น");
      return;
    }
    setErrorMsg("");
    setSaving(true);
    try {
      await onSave(startTime, endTime, isTask ? title.trim() : undefined);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg("ไม่สามารถบันทึกข้อมูลได้");
    } finally {
      setSaving(false);
    }
  };

  const modalContent = (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(9, 9, 11, 0.4)", // dark translucent backdrop overlay
        backdropFilter: "blur(8px)",
        padding: 16,
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          borderTop: "4px solid var(--indigo-light)", // indicator bar top
          borderRadius: 16,
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 40px rgba(99, 102, 241, 0.08)",
          padding: 24,
          width: "100%",
          maxWidth: 380,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          color: "hsl(var(--foreground))",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid hsl(var(--border))",
            paddingBottom: 14,
          }}
        >
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "hsl(var(--foreground))",
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            {schedule.event_type === "Mandatory_Break"
              ? "☕ แก้ไขเวลาพักเบรก"
              : "📝 แก้ไขตารางงาน"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              cursor: "pointer",
              color: "hsl(var(--muted-foreground))",
              background: "none",
              border: "none",
              padding: 6,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.03)",
              transition: "background 0.2s",
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Title input (Only for Tasks) */}
          {isTask && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "hsl(var(--muted-foreground))",
                }}
              >
                ชื่องาน / กิจกรรม
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onFocus={() => setTitleFocused(true)}
                onBlur={() => setTitleFocused(false)}
                style={{
                  backgroundColor: "hsl(var(--background))",
                  border: titleFocused
                    ? "1px solid var(--indigo-light)"
                    : "1px solid hsl(var(--border))",
                  boxShadow: titleFocused
                    ? "0 0 10px rgba(99, 102, 241, 0.15)"
                    : "none",
                  borderRadius: 10,
                  padding: "10px 14px",
                  color: "hsl(var(--foreground))",
                  outline: "none",
                  fontSize: 14,
                  width: "100%",
                  boxSizing: "border-box",
                  transition: "all 0.2s ease-in-out",
                }}
                placeholder="ระบุชื่องานที่ต้องการแก้ไข"
              />
            </div>
          )}

          <div style={{ display: "flex", gap: 12 }}>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "hsl(var(--muted-foreground))",
                }}
              >
                เวลาเริ่มต้น
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                onFocus={() => setStartFocused(true)}
                onBlur={() => setStartFocused(false)}
                style={{
                  backgroundColor: "hsl(var(--background))",
                  border: startFocused
                    ? "1px solid var(--indigo-light)"
                    : "1px solid hsl(var(--border))",
                  boxShadow: startFocused
                    ? "0 0 10px rgba(99, 102, 241, 0.15)"
                    : "none",
                  borderRadius: 10,
                  padding: "10px 14px",
                  color: "hsl(var(--foreground))",
                  outline: "none",
                  fontSize: 14,
                  width: "100%",
                  boxSizing: "border-box",
                  transition: "all 0.2s ease-in-out",
                }}
              />
            </div>

            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "hsl(var(--muted-foreground))",
                }}
              >
                เวลาสิ้นสุด
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                onFocus={() => setEndFocused(true)}
                onBlur={() => setEndFocused(false)}
                style={{
                  backgroundColor: "hsl(var(--background))",
                  border: endFocused
                    ? "1px solid var(--indigo-light)"
                    : "1px solid hsl(var(--border))",
                  boxShadow: endFocused
                    ? "0 0 10px rgba(99, 102, 241, 0.15)"
                    : "none",
                  borderRadius: 10,
                  padding: "10px 14px",
                  color: "hsl(var(--foreground))",
                  outline: "none",
                  fontSize: 14,
                  width: "100%",
                  boxSizing: "border-box",
                  transition: "all 0.2s ease-in-out",
                }}
              />
            </div>
          </div>

          {errorMsg && (
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "#e11d48", // rose-600 readable color for light mode
                marginTop: 2,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              ⚠️ {errorMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "end",
            gap: 8,
            borderTop: "1px solid hsl(var(--border))",
            paddingTop: 16,
            marginTop: 4,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "10px 16px",
              fontSize: 13,
              cursor: "pointer",
              borderRadius: 10,
              backgroundColor: "transparent",
              border: "1px solid hsl(var(--border))",
              color: "hsl(var(--muted-foreground))",
              fontWeight: 600,
              transition: "all 0.2s",
            }}
            disabled={saving}
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: "10px 20px",
              fontSize: 13,
              backgroundColor: "var(--indigo-light)",
              border: "none",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
              borderRadius: 10,
              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.15)",
              transition: "all 0.2s",
            }}
            disabled={saving}
          >
            {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </button>
        </div>
      </div>
    </div>
  );

  return mounted && typeof document !== "undefined" && document.body
    ? createPortal(modalContent, document.body)
    : null;
}
