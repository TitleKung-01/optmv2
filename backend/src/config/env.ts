import dotenv from "dotenv";

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const env = {
  PORT: process.env.PORT ?? "5000",
  SUPABASE_URL: requireEnv("SUPABASE_URL"),
  SUPABASE_ANON_KEY: requireEnv("SUPABASE_ANON_KEY"),
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? null,
  GROQ_API_KEY: process.env.GROQ_API_KEY ?? null,
  CORS_ORIGINS:
    process.env.CORS_ORIGINS ??
    process.env.CORS_ORIGIN ??
    "http://localhost:3000",
  LINE_CHANNEL_ACCESS_TOKEN: process.env.LINE_CHANNEL_ACCESS_TOKEN ?? null,
  LINE_CHANNEL_SECRET: process.env.LINE_CHANNEL_SECRET ?? null,
} as const;

if (!env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    "⚠️  แนะนำตั้ง SUPABASE_SERVICE_ROLE_KEY ใน .env หลังเปิด RLS — API จะใช้ anon key และอาจถูกบล็อก",
  );
}
if (!env.GROQ_API_KEY) {
  console.error("⚠️  คำเตือน: อย่าลืมใส่ GROQ_API_KEY ในไฟล์ .env");
}
