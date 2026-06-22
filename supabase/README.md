# Supabase — Smart Scheduler

## ไฟล์

| ไฟล์ | ใช้เมื่อ |
|------|---------|
| `schema.sql` | โปรเจกตใหม่ — สร้างตาราง + RLS ครบ |
| `migrations/202605300001_enable_rls.sql` | มีตารางแล้ว — เปิด RLS + policies เท่านั้น |

## โปรเจกต `opti_time` (ryjyixhhzzwgpjmyvawu)

Migration `enable_rls` ถูก apply แล้ว — ทั้ง 3 ตารางมี `rls_enabled: true` และ policies สำหรับ role `authenticated`

## หลังเปิด RLS

1. **Frontend** — ใช้ anon key + session ของผู้ใช้ (RLS ใช้ `auth.uid()`)
2. **Backend** — ตั้ง `SUPABASE_SERVICE_ROLE_KEY` ใน `smart-scheduler-backend/.env` (Settings → API → service_role)  
   อย่า commit key นี้

## ทดสอบ

```bash
# frontend/.env.local
SUPABASE_TEST_EMAIL=...
SUPABASE_TEST_PASSWORD=...

cd frontend
bun run ../scripts/test-supabase.ts
```

หรือทดสอบมือ: Register/Login → Profile → เพิ่มงาน → จัดตาราง
