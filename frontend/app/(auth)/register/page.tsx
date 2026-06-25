"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  AuthLayout,
  AuthFormInput,
  AuthErrorAlert,
  AuthSubmitButton,
} from "@/components/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Password strength
  const strength =
    password.length === 0
      ? 0
      : password.length < 6
        ? 1
        : password.length < 10
          ? 2
          : 3;

  const strengthColors = ["transparent", "#ef4444", "#f59e0b", "#22c55e"];
  const strengthLabels = ["", "อ่อนแอ", "พอใช้", "แข็งแกร่ง"];

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
      setTimeout(() => router.replace("/onboarding"), 2200);
    }
  };

  const passwordToggle = (
    <button
      className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition-colors"
      type="button"
      onClick={() => setShowPassword(!showPassword)}
    >
      <span className="material-symbols-outlined text-[20px]">
        {showPassword ? "visibility" : "visibility_off"}
      </span>
    </button>
  );

  return (
    <AuthLayout
      brandTitle={
        <>
          เริ่มต้นฟรี
          <br />
          <span className="text-primary">ภายใน 30 วินาที</span>
        </>
      }
      brandSubtitle="ไม่ต้องใช้บัตรเครดิต ไม่มีข้อผูกมัด เริ่มจัดตารางงานอัจฉริยะด้วย AI ได้ทันที"
      formIcon="auto_awesome"
      formTitle="สร้างบัญชีใหม่"
      formSubtitle="สมัครใช้งานเพื่อเริ่มจัดการตารางเวลาของคุณ"
      footer={
        <>
          มีบัญชีอยู่แล้ว?{" "}
          <Link
            className="text-primary font-semibold hover:underline"
            href="/login"
          >
            เข้าสู่ระบบ
          </Link>
        </>
      }
    >
      {success ? (
        <SuccessMessage />
      ) : (
        <form onSubmit={handleRegister} className="space-y-5">
          <AuthFormInput
            id="reg-email"
            label="อีเมล"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={setEmail}
            icon="mail"
          />

          <AuthFormInput
            id="reg-password"
            label="รหัสผ่าน"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={setPassword}
            icon="lock"
            rightElement={passwordToggle}
          >
            {/* Password strength indicator */}
            {password.length > 0 && (
              <div className="mt-2">
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(strength / 3) * 100}%`,
                      background: strengthColors[strength],
                      boxShadow: "none",
                    }}
                  />
                </div>
                <div
                  className="text-[11px] mt-1 font-semibold"
                  style={{ color: strengthColors[strength] }}
                >
                  {strengthLabels[strength]}
                </div>
              </div>
            )}
          </AuthFormInput>

          <AuthFormInput
            id="reg-confirm"
            label="ยืนยันรหัสผ่าน"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={confirm}
            onChange={setConfirm}
            icon="lock"
          />

          <AuthErrorAlert message={error} />

          <AuthSubmitButton
            loading={loading}
            loadingText="กำลังสร้างบัญชี..."
            text="สร้างบัญชี"
          />
        </form>
      )}
    </AuthLayout>
  );
}

function SuccessMessage() {
  return (
    <div className="text-center py-8 px-6 rounded-xl bg-[rgba(34,211,164,0.06)] border border-[rgba(34,211,164,0.2)]">
      <div className="text-5xl mb-4">🎉</div>
      <div className="text-lg font-bold text-[#22c55e] mb-2">
        สมัครสำเร็จ!
      </div>
      <div className="text-sm text-secondary">
        กำลังพาไปทำแบบทดสอบค้นหานาฬิกาชีวิต...
      </div>
      <div className="mt-5">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: "70%" }} />
        </div>
      </div>
    </div>
  );
}
