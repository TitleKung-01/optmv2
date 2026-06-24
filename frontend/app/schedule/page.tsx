"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSchedule } from "@/hooks/useSchedule";
import { useProfile } from "@/hooks/useProfile";
import { useEnergy } from "@/hooks/useEnergy";
import Sidebar from "@/components/Sidebar";
import ScheduleTimeline from "@/components/ScheduleTimeline";
import EnergyGauge from "@/components/EnergyGauge";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function SchedulePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const {
    schedules,
    loading,
    fetchSchedules,
    triggerSchedule,
    reorderSchedules,
    clearDay,
  } = useSchedule();
  const { profile, fetchProfile } = useProfile();
  const energy = useEnergy(profile);

  const [date, setDate] = useState(todayISO());
  const [generating, setGenerating] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchSchedules(date);
      fetchProfile();
    }
  }, [user, date, fetchSchedules, fetchProfile]);

  if (authLoading || !user)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );

  const handleGenerate = async () => {
    setGenerating(true);
    setMessage("");
    const msg = await triggerSchedule(date);
    setMessage(msg);
    setGenerating(false);
  };

  const handleClearDay = async () => {
    if (schedules.length === 0) return;
    const ok = window.confirm(
      `ล้างตารางของวันที่ ${date}?\nงานที่จัดแล้วจะกลับเป็นสถานะ "รอดำเนินการ"`,
    );
    if (!ok) return;

    setClearing(true);
    setMessage("");
    try {
      await clearDay(date);
      setMessage("ล้างตารางเรียบร้อย");
    } catch (error) {
      console.error("Clear schedule error:", error);
      setMessage("ล้างตารางไม่สำเร็จ");
    } finally {
      setClearing(false);
    }
  };

  const totalDuration = schedules
    .filter((s) => s.event_type === "Task")
    .reduce((acc, s) => {
      const mins =
        (new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) /
        60000;
      return acc + mins;
    }, 0);

  return (
    <div className="page-shell">
      <Sidebar />
      <main className="page-content">
        {/* Header */}
        <div
          className="page-header"
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 className="page-title">◷ Schedule</h1>
            <p className="page-subtitle">ตารางงานรายวัน</p>
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <input
              type="date"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ width: 160 }}
            />
            <button
              id="generate-schedule-btn"
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={generating || clearing}
            >
              {generating ? (
                <>
                  <span className="spinner" /> กำลังจัดตาราง...
                </>
              ) : (
                "🧠 จัดตารางอัตโนมัติ"
              )}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleClearDay}
              disabled={clearing || generating || schedules.length === 0}
            >
              {clearing ? "กำลังล้าง..." : "ล้างข้อมูล"}
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              marginBottom: 20,
              background: "rgba(34,211,164,0.08)",
              border: "1px solid rgba(34,211,164,0.2)",
              fontSize: 13,
              color: "var(--success)",
            }}
          >
            ✓ {message}
          </div>
        )}

        {/* 2-column layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 280px",
            gap: 20,
            alignItems: "start",
          }}
        >
          {/* Timeline */}
          <div className="glass" style={{ padding: "20px 24px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                }}
              >
                {schedules.length > 0
                  ? `${schedules.length} ช่วงเวลา`
                  : "ไม่มีตาราง"}
              </div>
              {totalDuration > 0 && (
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  รวม {Math.floor(totalDuration / 60)}ชม {totalDuration % 60}น.
                </div>
              )}
            </div>

            {loading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: 40,
                }}
              >
                <div className="spinner" style={{ width: 28, height: 28 }} />
              </div>
            ) : (
              <ScheduleTimeline
                schedules={schedules}
                onReorder={reorderSchedules}
              />
            )}
          </div>

          {/* Sidebar: Energy + Tips */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Energy gauge */}
            <div
              className="glass"
              style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: 16,
                  alignSelf: "flex-start",
                }}
              >
                ⚡ พลังงาน
              </div>
              <EnergyGauge energy={energy} />
            </div>

            {/* Profile summary */}
            {profile?.peak_time_start && (
              <div className="glass" style={{ padding: "16px 18px" }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: 12,
                  }}
                >
                  🕐 ช่วงเวลาของคุณ
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                    }}
                  >
                    <span style={{ color: "var(--success)" }}>🔥 Peak</span>
                    <span style={{ color: "var(--text-secondary)" }}>
                      {profile.peak_time_start} – {profile.peak_time_end}
                    </span>
                  </div>
                  {profile.dip_time_start && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: "var(--danger)" }}>😴 Dip</span>
                      <span style={{ color: "var(--text-secondary)" }}>
                        {profile.dip_time_start} – {profile.dip_time_end}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="glass" style={{ padding: "16px 18px" }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: 10,
                }}
              >
                💡 Tips
              </div>
              <ul
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  lineHeight: 1.8,
                  paddingLeft: 14,
                }}
              >
                <li>ลาก ⠿ เพื่อจัดลำดับใหม่</li>
                <li>งานยาก → จัดช่วง Peak</li>
                <li>พัก 15 นาทีทุก 2 ชั่วโมง</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
