import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import NotificationBar from "@/components/NotificationBar";
import { Toaster } from "sonner";

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
    <html lang="th" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;700&amp;display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="relative overflow-x-hidden min-h-screen bg-white antialiased">
        {/* Ambient Gradient Blobs for Glassmorphism (Disabled for pure white background) */}
        {/*
        <div className="absolute top-[-10%] left-[-15%] w-[60vw] h-[60vw] max-w-[650px] max-h-[650px] rounded-full bg-indigo-400/20 blur-[130px] pointer-events-none animate-blob-1 -z-10" />
        <div className="absolute bottom-[-10%] right-[-15%] w-[60vw] h-[60vw] max-w-[650px] max-h-[650px] rounded-full bg-violet-400/20 blur-[130px] pointer-events-none animate-blob-2 -z-10" />
        <div className="absolute top-[35%] right-[5%] w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] rounded-full bg-rose-300/15 blur-[110px] pointer-events-none animate-blob-3 -z-10" />
        <div className="absolute top-[60%] left-[-10%] w-[40vw] h-[40vw] max-w-[450px] max-h-[450px] rounded-full bg-emerald-300/10 blur-[100px] pointer-events-none -z-10" />
        */}

        <AuthProvider>
          <NotificationBar />
          {children}
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
