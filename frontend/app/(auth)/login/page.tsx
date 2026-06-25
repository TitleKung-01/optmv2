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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    <AuthLayout
      brandTitle={
        <>
          เพิ่มประสิทธิภาพ
          <br />
          <span className="text-primary">ด้วยตารางเวลาอัจฉริยะ</span>
        </>
      }
      brandSubtitle="ให้ AI ช่วยวิเคราะห์และจัดสรรเวลาทำงานตามจังหวะพลังงานของคุณ เพื่อผลลัพธ์ที่ดีที่สุดโดยไม่เหนื่อยล้า"
      formIcon="waving_hand"
      formTitle="ยินดีต้อนรับกลับมา"
      formSubtitle="เข้าสู่ระบบเพื่อจัดการตารางเวลาของคุณ"
      footer={
        <>
          ยังไม่มีบัญชี?{" "}
          <Link
            className="text-primary font-semibold hover:underline"
            href="/register"
          >
            สมัครใช้งานฟรี
          </Link>
        </>
      }
    >
      <form onSubmit={handleLogin} className="space-y-5">
        <AuthFormInput
          id="email"
          label="อีเมล"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={setEmail}
          icon="mail"
        />

        <AuthFormInput
          id="password"
          label="รหัสผ่าน"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={password}
          onChange={setPassword}
          icon="lock"
          labelRight={
            <Link
              className="text-body-sm text-primary hover:text-primary-container font-medium transition-colors"
              href="/forgot-password"
            >
              ลืมรหัสผ่าน?
            </Link>
          }
          rightElement={
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition-colors"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? "visibility" : "visibility_off"}
              </span>
            </button>
          }
        />

        <div className="flex items-center">
          <input
            className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary-container"
            id="remember"
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <label className="ml-2 text-body-sm text-secondary" htmlFor="remember">
            จดจำฉันไว้ในระบบ
          </label>
        </div>

        <AuthErrorAlert message={error} />

        <AuthSubmitButton
          loading={loading}
          loadingText="กำลังเข้าสู่ระบบ..."
          text="เข้าสู่ระบบ"
        />
      </form>
    </AuthLayout>
  );
}
