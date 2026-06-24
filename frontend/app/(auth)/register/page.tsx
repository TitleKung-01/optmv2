"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const features = [
  {
    icon: "🧠",
    title: "AI แตกงานอัตโนมัติ",
    desc: "Groq AI วิเคราะห์และแตกงานใหญ่เป็น subtasks",
  },
  {
    icon: "⚡",
    title: "Smart Scheduling",
    desc: "จัดตารางตาม peak/dip energy time ของคุณ",
  },
  {
    icon: "💬",
    title: "LINE Notification",
    desc: "แจ้งเตือนผ่าน LINE ก่อนงานเริ่ม 5 นาที",
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const strength =
    password.length === 0
      ? 0
      : password.length < 6
        ? 1
        : password.length < 10
          ? 2
          : 3;
  const strengthColor = [
    "transparent",
    "var(--danger)",
    "var(--warning)",
    "var(--success)",
  ][strength];
  const strengthLabel = ["", "อ่อนแอ", "พอใช้", "แข็งแกร่ง"][strength];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => router.replace("/profile"), 2200);
    }
  };

  return (
    <div className="auth-page">
      {/* ── Left brand panel ─────────────────────────────── */}
      <div className="auth-brand">
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 48,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background:
                  "linear-gradient(135deg, var(--indigo), var(--violet))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                boxShadow: "var(--shadow-glow)",
              }}
            >
              ⚡
            </div>
            <span
              className="grad-text"
              style={{
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              Smart Scheduler
            </span>
          </div>

          <div style={{ marginBottom: 40 }}>
            <h1
              style={{
                fontSize: 36,
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: "-0.03em",
                marginBottom: 12,
              }}
            >
              เริ่มต้นฟรี
              <br />
              <span className="grad-text">ภายใน 30 วินาที</span>
            </h1>
            <p
              style={{
                fontSize: 15,
                color: "var(--text-secondary)",
                lineHeight: 1.7,
              }}
            >
              ไม่ต้องใช้บัตรเครดิต ไม่มีข้อผูกมัด
              <br />
              เริ่มจัดตารางงานอัจฉริยะได้ทันที
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {features.map((f) => (
              <div key={f.title} className="feature-item">
                <div className="feature-icon">
                  <span style={{ fontSize: 18 }}>{f.icon}</span>
                </div>
                <div>
                  <div
                    style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}
                  >
                    {f.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      lineHeight: 1.5,
                    }}
                  >
                    {f.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p
          style={{
            position: "relative",
            zIndex: 1,
            fontSize: 12,
            color: "var(--text-muted)",
          }}
        >
          © 2025 Smart Scheduler — Private project
        </p>
      </div>

      {/* ── Right form panel ─────────────────────────────── */}
      <div className="auth-form-panel">
        <div className="auth-form-inner anim-fade-up">
          <div style={{ marginBottom: 32 }}>
            <div className="section-label" style={{ marginBottom: 8 }}>
              Get started
            </div>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              สร้างบัญชีใหม่
            </h2>
            <p
              style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}
            >
              มีบัญชีแล้ว?{" "}
              <Link
                href="/login"
                style={{
                  color: "var(--indigo-light)",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>

          {success ? (
            <div
              style={{
                textAlign: "center",
                padding: "32px 24px",
                background: "rgba(34,211,164,0.06)",
                border: "1px solid rgba(34,211,164,0.2)",
                borderRadius: "var(--radius-lg)",
              }}
            >
              <div style={{ fontSize: 44, marginBottom: 16 }}>🎉</div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--success)",
                  marginBottom: 8,
                }}
              >
                สมัครสำเร็จ!
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                กำลังพาไปตั้งค่าโปรไฟล์...
              </div>
              <div style={{ marginTop: 20 }}>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: "70%" }} />
                </div>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleRegister}
              style={{ display: "flex", flexDirection: "column", gap: 18 }}
            >
              <div>
                <label className="input-label">อีเมล</label>
                <div className="input-group">
                  <span className="input-icon">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="input-label">รหัสผ่าน</label>
                <div className="input-group">
                  <span className="input-icon">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type="password"
                    className="input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    required
                  />
                </div>
                {/* Password strength */}
                {password.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${(strength / 3) * 100}%`,
                          background: strengthColor,
                          boxShadow: "none",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: strengthColor,
                        marginTop: 4,
                        fontWeight: 600,
                      }}
                    >
                      {strengthLabel}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="input-label">ยืนยันรหัสผ่าน</label>
                <div className="input-group">
                  <span className="input-icon">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <input
                    type="password"
                    className="input"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(244,63,94,0.08)",
                    border: "1px solid rgba(244,63,94,0.2)",
                    fontSize: 13,
                    color: "var(--danger)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ padding: "13px", fontSize: 15, marginTop: 4 }}
              >
                {loading ? (
                  <>
                    <span className="spinner" /> กำลังสร้างบัญชี...
                  </>
                ) : (
                  "สร้างบัญชี →"
                )}
              </button>

              <p
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  textAlign: "center",
                  lineHeight: 1.6,
                }}
              >
                การสมัครถือว่าคุณยอมรับ{" "}
                <span style={{ color: "var(--text-secondary)" }}>
                  Terms of Service
                </span>{" "}
                และ{" "}
                <span style={{ color: "var(--text-secondary)" }}>
                  Privacy Policy
                </span>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
