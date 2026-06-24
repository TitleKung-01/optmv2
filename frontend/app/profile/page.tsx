"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import Sidebar from "@/components/Sidebar";
import type { Chronotype } from "@/lib/types";

const CHRONOTYPES: {
  key: Chronotype;
  label: string;
  icon: string;
  desc: string;
}[] = [
  {
    key: "Morning Lark",
    label: "Morning Lark",
    icon: "🐦",
    desc: "ตื่นเช้า มีพลังสูงสุดช่วงเช้า",
  },
  {
    key: "Third Bird",
    label: "Third Bird",
    icon: "🦅",
    desc: "กลางๆ ระหว่างเช้าและเย็น",
  },
  {
    key: "Night Owl",
    label: "Night Owl",
    icon: "🦉",
    desc: "มีพลังสูงสุดช่วงกลางคืน",
  },
];

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { profile, loading, fetchProfile, saveProfile } = useProfile();

  const [chronotype, setChronotype] = useState<Chronotype | "">("");
  const [peakStart, setPeakStart] = useState("");
  const [peakEnd, setPeakEnd] = useState("");
  const [dipStart, setDipStart] = useState("");
  const [dipEnd, setDipEnd] = useState("");
  const [saved, setSaved] = useState(false);
  const [lineUserId, setLineUserId] = useState("");
  const [lineSaved, setLineSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user, fetchProfile]);

  useEffect(() => {
    if (profile) {
      setChronotype(profile.chronotype ?? "");
      setPeakStart(profile.peak_time_start?.slice(0, 5) ?? "");
      setPeakEnd(profile.peak_time_end?.slice(0, 5) ?? "");
      setDipStart(profile.dip_time_start?.slice(0, 5) ?? "");
      setDipEnd(profile.dip_time_end?.slice(0, 5) ?? "");
      setLineUserId(profile.line_user_id ?? "");
    }
  }, [profile]);

  // Auto-fill defaults when chronotype selected
  const handleChronotype = (c: Chronotype) => {
    setChronotype(c);
    if (c === "Morning Lark") {
      if (!peakStart) setPeakStart("07:00");
      if (!peakEnd) setPeakEnd("11:00");
      if (!dipStart) setDipStart("14:00");
      if (!dipEnd) setDipEnd("16:00");
    } else if (c === "Third Bird") {
      if (!peakStart) setPeakStart("09:00");
      if (!peakEnd) setPeakEnd("12:00");
      if (!dipStart) setDipStart("15:00");
      if (!dipEnd) setDipEnd("17:00");
    } else {
      if (!peakStart) setPeakStart("20:00");
      if (!peakEnd) setPeakEnd("00:00");
      if (!dipStart) setDipStart("09:00");
      if (!dipEnd) setDipEnd("11:00");
    }
  };

  const handleSaveLine = async () => {
    const ok = await saveProfile({ line_user_id: lineUserId.trim() || null });
    if (ok) {
      setLineSaved(true);
      setTimeout(() => setLineSaved(false), 3000);
    }
  };

  const handleSave = async () => {
    setError("");
    if (!chronotype) {
      setError("กรุณาเลือก Chronotype");
      return;
    }
    if (!peakStart || !peakEnd) {
      setError("กรุณากรอกช่วง Peak Time");
      return;
    }

    const ok = await saveProfile({
      chronotype,
      peak_time_start: peakStart,
      peak_time_end: peakEnd,
      dip_time_start: dipStart || null,
      dip_time_end: dipEnd || null,
    });

    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError("บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง");
    }
  };

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

  return (
    <div className="page-shell">
      <Sidebar />
      <main className="page-content">
        <div className="page-header">
          <h1 className="page-title">◉ Profile</h1>
          <p className="page-subtitle">
            ตั้งค่า Chronotype และช่วงเวลา Peak/Dip
          </p>
        </div>

        <div
          style={{
            maxWidth: 640,
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {/* User info */}
          <div
            className="glass"
            style={{
              padding: "20px 24px",
              display: "flex",
              gap: 16,
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                flexShrink: 0,
                background:
                  "linear-gradient(135deg, var(--indigo), var(--violet))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              {user.email?.[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{user.email}</div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  marginTop: 2,
                }}
              >
                สมาชิกตั้งแต่{" "}
                {new Date(user.created_at).toLocaleDateString("th-TH")}
              </div>
            </div>
          </div>

          {/* Chronotype */}
          <div className="glass" style={{ padding: "24px" }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
              🦅 Chronotype
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                marginBottom: 18,
              }}
            >
              เลือกประเภทนาฬิกาชีวภาพของคุณ เพื่อให้ระบบจัดตารางได้เหมาะสม
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {CHRONOTYPES.map((c) => {
                const active = chronotype === c.key;
                return (
                  <button
                    key={c.key}
                    onClick={() => handleChronotype(c.key)}
                    style={{
                      flex: 1,
                      minWidth: 160,
                      padding: "16px",
                      borderRadius: "var(--radius-md)",
                      border: `2px solid ${active ? "var(--indigo)" : "var(--border)"}`,
                      background: active
                        ? "rgba(99,102,241,0.1)"
                        : "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 8 }}>
                      {c.icon}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: active
                          ? "var(--indigo-light)"
                          : "var(--text-primary)",
                        marginBottom: 4,
                      }}
                    >
                      {c.label}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        lineHeight: 1.4,
                      }}
                    >
                      {c.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Peak Time */}
          <div className="glass" style={{ padding: "24px" }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                marginBottom: 4,
                color: "var(--success)",
              }}
            >
              🔥 Peak Time
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                marginBottom: 18,
              }}
            >
              ช่วงเวลาที่มีพลังงานและสมาธิสูงสุด — งานยากจะถูกจัดในช่วงนี้
            </div>
            <div className="grid-2">
              <div>
                <label className="input-label">เริ่ม</label>
                <input
                  type="time"
                  className="input"
                  value={peakStart}
                  onChange={(e) => setPeakStart(e.target.value)}
                />
              </div>
              <div>
                <label className="input-label">สิ้นสุด</label>
                <input
                  type="time"
                  className="input"
                  value={peakEnd}
                  onChange={(e) => setPeakEnd(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Dip Time */}
          <div className="glass" style={{ padding: "24px" }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                marginBottom: 4,
                color: "var(--danger)",
              }}
            >
              😴 Dip Time
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                marginBottom: 18,
              }}
            >
              ช่วงที่พลังงานต่ำ — งานง่ายหรือพักเบรกจะถูกจัดในช่วงนี้
              (ไม่บังคับ)
            </div>
            <div className="grid-2">
              <div>
                <label className="input-label">เริ่ม</label>
                <input
                  type="time"
                  className="input"
                  value={dipStart}
                  onChange={(e) => setDipStart(e.target.value)}
                />
              </div>
              <div>
                <label className="input-label">สิ้นสุด</label>
                <input
                  type="time"
                  className="input"
                  value={dipEnd}
                  onChange={(e) => setDipEnd(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* LINE Notification */}
          <div className="glass" style={{ padding: "24px" }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                marginBottom: 4,
                color: "#06c755",
              }}
            >
              💬 LINE Notification
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                marginBottom: 18,
                lineHeight: 1.6,
              }}
            >
              รับแจ้งเตือนงานผ่าน LINE เมื่องานจะเริ่มใน 5 นาที
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="input-label">LINE User ID</label>
              <input
                type="text"
                className="input"
                placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={lineUserId}
                onChange={(e) => setLineUserId(e.target.value)}
              />
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginTop: 6,
                  lineHeight: 1.5,
                }}
              >
                วิธีหา LINE User ID: ส่งข้อความใดก็ได้ไปที่บอทของเรา
                แล้วบอทจะตอบกลับ ID ให้ทันที
              </div>
            </div>

            {lineSaved && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  marginBottom: 12,
                  background: "rgba(6,199,85,0.1)",
                  border: "1px solid rgba(6,199,85,0.25)",
                  fontSize: 13,
                  color: "#06c755",
                }}
              >
                ✓ บันทึก LINE User ID แล้ว
              </div>
            )}

            <button
              className="btn btn-primary"
              onClick={handleSaveLine}
              disabled={loading}
              style={{ padding: "10px 22px", fontSize: 14 }}
            >
              💬 บันทึก LINE User ID
            </button>
          </div>

          {/* Error / Success */}
          {error && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "var(--radius-sm)",
                background: "rgba(244,63,94,0.1)",
                border: "1px solid rgba(244,63,94,0.2)",
                fontSize: 13,
                color: "var(--danger)",
              }}
            >
              ⚠ {error}
            </div>
          )}
          {saved && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "var(--radius-sm)",
                background: "rgba(34,211,164,0.1)",
                border: "1px solid rgba(34,211,164,0.2)",
                fontSize: 13,
                color: "var(--success)",
              }}
            >
              ✓ บันทึกเรียบร้อยแล้ว
            </div>
          )}

          <button
            id="save-profile-btn"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={loading}
            style={{
              alignSelf: "flex-start",
              padding: "12px 28px",
              fontSize: 15,
            }}
          >
            {loading ? (
              <>
                <span className="spinner" /> กำลังบันทึก...
              </>
            ) : (
              "✓ บันทึกโปรไฟล์"
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
