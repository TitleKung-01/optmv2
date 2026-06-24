"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const features = [
  {
    icon: "🧠",
    title: "AI แตกงานอัตโนมัติ",
    desc: "ให้ AI วิเคราะห์และแตกงานใหญ่เป็น subtasks ที่ทำได้จริง",
  },
  {
    icon: "⚡",
    title: "Smart Scheduling",
    desc: "จัดตารางตาม peak/dip time และ deadline อัตโนมัติ",
  },
  {
    icon: "💬",
    title: "LINE Notification",
    desc: "แจ้งเตือนงานผ่าน LINE ก่อนเริ่ม 5 นาที ไม่พลาดทุกงาน",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      setLoading(false);
    } else {
      router.replace("/dashboard");
    }
  };

  return (
    <div className="auth-page">
      {/* ── Left brand panel ─────────────────────────────── */}
      <div className="auth-brand">
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Logo */}
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
              style={{
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
              className="grad-text"
            >
              Smart Scheduler
            </span>
          </div>

          {/* Headline */}
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
              จัดเวลาให้ฉลาด
              <br />
              <span className="grad-text">ด้วยพลัง AI</span>
            </h1>
            <p
              style={{
                fontSize: 15,
                color: "var(--text-secondary)",
                lineHeight: 1.7,
              }}
            >
              ระบบจัดตารางงานที่เข้าใจจังหวะพลังงานของคุณ
              <br />
              ทำงานได้มากขึ้น เหนื่อยน้อยลง
            </p>
          </div>

          {/* Feature list */}
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

        {/* Footer */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            © 2025 Smart Scheduler — Private project
          </p>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────── */}
      <div className="auth-form-panel">
        <div className="auth-form-inner anim-fade-up">
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div className="section-label" style={{ marginBottom: 8 }}>
              Welcome back
            </div>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              เข้าสู่ระบบ
            </h2>
            <p
              style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}
            >
              ยังไม่มีบัญชี?{" "}
              <Link
                href="/register"
                style={{
                  color: "var(--indigo-light)",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                สมัครฟรี
              </Link>
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleLogin}
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <label className="input-label" style={{ margin: 0 }}>
                  รหัสผ่าน
                </label>
              </div>
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
                  <span className="spinner" /> กำลังเข้าสู่ระบบ...
                </>
              ) : (
                "เข้าสู่ระบบ →"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
