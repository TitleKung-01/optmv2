import React from "react";
import type { User } from "@supabase/supabase-js";

interface UserInfoCardProps {
  user: User;
}

export default function UserInfoCard({ user }: UserInfoCardProps) {
  const initial = user.email?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="sh-card p-6 flex gap-4 items-center">
      <div
        className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center text-xl font-bold text-white"
        style={{
          background: "linear-gradient(135deg, hsl(var(--indigo-accent)), hsl(265 89% 65%))",
        }}
      >
        {initial}
      </div>
      <div>
        <div className="text-base font-semibold text-zinc-100">{user.email}</div>
        <div className="text-xs text-zinc-500 mt-1">
          สมาชิกตั้งแต่{" "}
          {user.created_at
            ? new Date(user.created_at).toLocaleDateString("th-TH")
            : "-"}
        </div>
      </div>
    </div>
  );
}
