"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import OnboardingModal from "@/components/OnboardingModal";

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { profile, loading: profileLoading, fetchProfile, saveProfile } = useProfile();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    if (profile && (
      profile.chronotype === 'Morning Lark' ||
      profile.chronotype === 'Third Bird' ||
      profile.chronotype === 'Night Owl'
    )) {
      router.replace("/dashboard");
    }
  }, [profile, router]);

  const hasCompletedOnboarding = profile && (
    profile.chronotype === 'Morning Lark' ||
    profile.chronotype === 'Third Bird' ||
    profile.chronotype === 'Night Owl'
  );

  if (authLoading || profileLoading || !user || profile === undefined || hasCompletedOnboarding) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-zinc-800 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium ambient glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[380px] h-[380px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[380px] h-[380px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      <OnboardingModal
        onSave={saveProfile}
        onComplete={() => router.replace("/dashboard")}
        mode="page"
      />
    </div>
  );
}
