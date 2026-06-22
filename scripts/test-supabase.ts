/**
 * ทดสอบ Auth + RLS + tasks/schedules
 *
 * ใช้:
 *   cd frontend && bun run ../scripts/test-supabase.ts
 *
 * ตั้งใน frontend/.env.local (หรือ export):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   SUPABASE_TEST_EMAIL
 *   SUPABASE_TEST_PASSWORD
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  const path = resolve(import.meta.dir, "../frontend/.env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const key = t.slice(0, i).trim();
    const val = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const email = process.env.SUPABASE_TEST_EMAIL;
const password = process.env.SUPABASE_TEST_PASSWORD;

function fail(msg: string): never {
  console.error("❌", msg);
  process.exit(1);
}

if (!url || !anonKey) {
  fail("ต้องมี NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY ใน frontend/.env.local");
}
if (!email || !password) {
  fail(
    "ต้องมี SUPABASE_TEST_EMAIL และ SUPABASE_TEST_PASSWORD (ผู้ใช้ที่ลงทะเบียนแล้วในแอป)"
  );
}

const supabase = createClient(url, anonKey);

async function main() {
  console.log("🔐 Login...");
  const { data: auth, error: signInErr } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signInErr || !auth.user) fail(`Login: ${signInErr?.message ?? "no user"}`);
  const userId = auth.user.id;
  console.log("   OK — user", userId);

  console.log("👤 users (RLS)...");
  const { data: profile, error: userErr } = await supabase
    .from("users")
    .upsert([{ id: userId, email: auth.user.email }], { onConflict: "id" })
    .select()
    .single();
  if (userErr) fail(`users: ${userErr.message}`);
  console.log("   OK —", profile?.email ?? profile?.id);

  const taskTitle = `[test] ${new Date().toISOString()}`;
  console.log("📋 tasks insert...");
  const { data: task, error: taskErr } = await supabase
    .from("tasks")
    .insert([
      {
        user_id: userId,
        title: taskTitle,
        difficulty: "Medium",
        estimated_duration: 25,
        priority: 3,
        recurrence: "none",
      },
    ])
    .select()
    .single();
  if (taskErr) fail(`tasks insert: ${taskErr.message}`);
  console.log("   OK — task", task.id);

  const start = new Date();
  start.setMinutes(0, 0, 0);
  const end = new Date(start.getTime() + 25 * 60 * 1000);

  console.log("📅 schedules insert...");
  const { data: schedule, error: schedErr } = await supabase
    .from("schedules")
    .insert([
      {
        user_id: userId,
        task_id: task.id,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        event_type: "Task",
      },
    ])
    .select("*, tasks(id, title)")
    .single();
  if (schedErr) fail(`schedules insert: ${schedErr.message}`);
  console.log("   OK — schedule", schedule.id);

  console.log("🔒 RLS block (wrong user_id)...");
  const fakeId = "00000000-0000-4000-8000-000000000001";
  const { error: rlsErr } = await supabase.from("tasks").insert([
    { user_id: fakeId, title: "should fail", difficulty: "Low", estimated_duration: 5 },
  ]);
  if (!rlsErr) {
    console.warn("   ⚠️ insert ด้วย user_id ปลอมไม่ถูกบล็อก — ตรวจ policy อีกครั้ง");
  } else {
    console.log("   OK — blocked:", rlsErr.message);
  }

  console.log("🧹 cleanup...");
  await supabase.from("schedules").delete().eq("id", schedule.id);
  await supabase.from("tasks").delete().eq("id", task.id);

  console.log("\n✅ ทดสอบครบ: login, users, tasks, schedules, RLS");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
