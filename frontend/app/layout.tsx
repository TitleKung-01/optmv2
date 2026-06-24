import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import NotificationBar from "@/components/NotificationBar";

export const metadata: Metadata = {
  title: "Smart Scheduler — จัดตารางงานอัจฉริยะ",
  description:
    "จัดตารางงานอัจฉริยะด้วย AI แตกงาน, peak/dip time scheduling และ drag & drop",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>
        <AuthProvider>
          <NotificationBar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
