"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import Sidebar from "@/components/Sidebar";
import OnboardingModal from "@/components/OnboardingModal";
import UserInfoCard from "@/components/UserInfoCard";
import ChronotypeSelector from "@/components/ChronotypeSelector";
import TimeIntervalCard from "@/components/TimeIntervalCard";
import LineConfigCard from "@/components/LineConfigCard";
import type { Chronotype } from "@/lib/types";

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
  const [showQuizModal, setShowQuizModal] = useState(false);

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
    <>
      <div className="flex min-h-screen bg-transparent">
        <Sidebar />
        <main className="flex-1 min-w-0 p-8 overflow-y-auto max-w-4xl mx-auto sh-fade-up">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/45">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 flex items-center gap-2">
                Profile
              </h1>
              <p className="text-sm text-zinc-300 font-semibold mt-1">
                ตั้งค่า Chronotype และช่วงเวลา Peak/Dip
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 max-w-2xl">
            {/* User info */}
            <UserInfoCard user={user} />

            {/* Chronotype */}
            <ChronotypeSelector
              chronotype={chronotype}
              onSelectChronotype={handleChronotype}
              onOpenQuiz={() => setShowQuizModal(true)}
            />

            {/* Peak Time */}
            <TimeIntervalCard
              title="🔥 Peak Time"
              description="ช่วงเวลาที่มีพลังงานและสมาธิสูงสุด — งานยากจะถูกจัดในช่วงนี้"
              startValue={peakStart}
              endValue={peakEnd}
              onStartChange={setPeakStart}
              onEndChange={setPeakEnd}
              themeColorClass="text-emerald-400"
            />

            {/* Dip Time */}
            <TimeIntervalCard
              title="😴 Dip Time"
              description="ช่วงที่พลังงานต่ำ — งานง่ายหรือพักเบรกจะถูกจัดในช่วงนี้ (ไม่บังคับ)"
              startValue={dipStart}
              endValue={dipEnd}
              onStartChange={setDipStart}
              onEndChange={setDipEnd}
              themeColorClass="text-amber-500"
            />

            {/* LINE Notification */}
            <LineConfigCard
              lineUserId={lineUserId}
              onLineUserIdChange={setLineUserId}
              onSave={handleSaveLine}
              isSaving={loading}
              isSavedSuccess={lineSaved}
            />

            {/* Error / Success */}
            {error && (
              <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm font-semibold text-rose-400">
                ⚠ {error}
              </div>
            )}
            {saved && (
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm font-semibold text-emerald-400">
                ✓ บันทึกเรียบร้อยแล้ว
              </div>
            )}

            <button
              id="save-profile-btn"
              className="sh-btn sh-btn-default px-8 py-3 text-sm self-start"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-1.5" />
                  กำลังบันทึก...
                </>
              ) : (
                "✓ บันทึกโปรไฟล์"
              )}
            </button>
          </div>
        </main>
      </div>

      {showQuizModal && (
        <OnboardingModal
          onSave={saveProfile}
          onComplete={() => {
            fetchProfile();
            setShowQuizModal(false);
          }}
          mode="profile"
          onClose={() => setShowQuizModal(false)}
        />
      )}
    </>
  );
}
