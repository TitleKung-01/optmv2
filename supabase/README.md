# Supabase — Smart Scheduler

## ไฟล์

| ไฟล์ | ใช้เมื่อ |
|------|---------|
| `schema.sql` | โปรเจกต์ใหม่ — สร้างตาราง + RLS ครบในขั้นตอนเดียว |
| `migrations/202605300001_enable_rls.sql` | มีตารางอยู่แล้ว — เปิด RLS + policies เพิ่มเติม |

## ตาราง

| ตาราง | คำอธิบาย |
|--------|----------|
| `users` | profile (`id` = `auth.users.id`), chronotype, peak/dip time |
| `tasks` | งานของผู้ใช้ |
| `schedules` | ช่วงเวลาในตาราง (`Task` / `Mandatory_Break`) |

## หลังเปิด RLS

1. **Frontend** — ใช้ anon key + session ของผู้ใช้ (RLS ตรวจด้วย `auth.uid()`)
2. **Backend** — ตั้ง `SUPABASE_SERVICE_ROLE_KEY` ใน `backend/.env`  
   (Supabase Dashboard → Settings → API → service_role) — อย่า commit key นี้

## ทดสอบ

```bash
# เพิ่มใน frontend/.env.local
# SUPABASE_TEST_EMAIL=you@example.com
# SUPABASE_TEST_PASSWORD=your-password

bun run scripts/test-supabase.ts
```
