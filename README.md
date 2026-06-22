# Smart Scheduler

แอปจัดตารางงานอัจฉริยะ — ใช้ Supabase เก็บข้อมูล, Groq AI แตกงานใหญ่เป็นงานย่อย, และจัดลำดับงานตามช่วงพลังงาน (peak/dip time) ของผู้ใช้

## ฟีเจอร์หลัก

- **จัดการงาน** — เพิ่ม/ลบ/กรองงาน, ตั้ง priority, deadline, หมวดหมู่, งานซ้ำ (daily / weekly / custom)
- **AI แตกงาน** — แปลงงานใหญ่เป็น subtasks ด้วย Groq (`llama-3.3-70b-versatile`)
- **Smart Schedule** — จัดตารางอัตโนมัติตาม difficulty, urgency, deadline และ peak/dip time จาก profile
- **Drag & Drop** — ลากเรียงลำดับในตาราง, เวลาปรับตามลำดับใหม่
- **Energy Gauge** — แสดงระดับพลังงานตาม chronotype และเวลาปัจจุบัน
- **Dashboard & Analytics** — สรุปงาน, overdue, streak, กราฟ 7 วัน
- **แจ้งเตือน** — reminder ก่อนงานเริ่ม 5 นาที, deadline ใกล้ถึง
- **งานซ้ำ** — spawn งาน recurring อัตโนมัติเมื่อเปิดหน้าแอปหรือเปลี่ยนวันที่

## โครงสร้างโปรเจกต์

```
smart-scheduler-project/
├── frontend/                 # Next.js 16 (App Router) + React 19
│   ├── app/
│   │   ├── lib/              # supabase, api, types
│   │   ├── components/
│   │   ├── context/
│   │   └── hooks/
│   └── .env.example
├── smart-scheduler-backend/  # Express 5 + Bun
│   ├── index.ts              # API routes
│   └── .env.example
└── README.md
```

## สิ่งที่ต้องมี

- [Bun](https://bun.sh) (แนะนำ) หรือ Node.js 20+
- บัญชี [Supabase](https://supabase.com) (PostgreSQL + Auth)
- API key จาก [Groq Console](https://console.groq.com) (สำหรับ AI breakdown)

## ติดตั้ง

### 1. Clone และติดตั้ง dependencies

```bash
cd frontend
bun install

cd ../smart-scheduler-backend
bun install
```

### 2. ตั้งค่า environment

**Frontend** — copy แล้วแก้ค่า:

```bash
cd frontend
cp .env.example .env.local
```

**Backend** — copy แล้วแก้ค่า:

```bash
cd smart-scheduler-backend
cp .env.example .env
```

| ตัวแปร | ที่ใช้ | คำอธิบาย |
|--------|--------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | frontend | URL โปรเจกต Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | frontend | anon/public key |
| `NEXT_PUBLIC_API_URL` | frontend | URL backend (default: `http://localhost:5000`) |
| `SUPABASE_URL` | backend | URL เดียวกับ frontend |
| `SUPABASE_ANON_KEY` | backend | anon key (fallback ถ้าไม่มี service role) |
| `SUPABASE_SERVICE_ROLE_KEY` | backend | **จำเป็นหลังเปิด RLS** — สำหรับ API ฝั่ง server |
| `CORS_ORIGINS` | backend | whitelist domain (คั่นหลายโดเมนด้วย `,`) |
| `GROQ_API_KEY` | backend | สำหรับ AI แตกงาน |
| `PORT` | backend | พอร์ต API (default: `5000`) |

### 3. Supabase — schema + RLS

**โปรเจกตใหม่:** รัน `supabase/schema.sql` ใน [SQL Editor](https://supabase.com/dashboard/project/_/sql)

**โปรเจกตที่มีตารางแล้ว:** รัน `supabase/migrations/202605300001_enable_rls.sql` (เปิด RLS + policies + trigger สร้าง `public.users` ตอน signup)

| ตาราง | คำอธิบาย |
|--------|----------|
| `users` | profile (`id` = `auth.users.id`), chronotype, peak/dip time |
| `tasks` | งานของผู้ใช้ |
| `schedules` | ช่วงเวลาในตาราง (`Task` / `Mandatory_Break`) |

หลังเปิด RLS ให้ backend ใช้ **`SUPABASE_SERVICE_ROLE_KEY`** (ดู `smart-scheduler-backend/.env.example`) — อย่าใส่ key นี้ใน frontend

**ทดสอบอัตโนมัติ** (ต้องมีบัญชีทดสอบในแอป):

```bash
# เพิ่มใน frontend/.env.local
# SUPABASE_TEST_EMAIL=you@example.com
# SUPABASE_TEST_PASSWORD=your-password

cd frontend
bun run ../scripts/test-supabase.ts
```

### 4. รัน development

เปิด **สอง terminal**:

```bash
# Terminal 1 — Backend (port 5000)
cd smart-scheduler-backend
bun run dev

# Terminal 2 — Frontend (port 3000)
cd frontend
bun dev
```

เปิด [http://localhost:3000](http://localhost:3000) → Register → ตั้ง Profile (chronotype / peak-dip) → เพิ่มงาน → จัดตาราง

## API (Backend)

Base URL: `NEXT_PUBLIC_API_URL` หรือ `http://localhost:5000`

| Method | Path | คำอธิบาย |
|--------|------|----------|
| `POST` | `/api/ai-breakdown` | แตกงานใหญ่เป็น subtasks (Groq) |
| `POST` | `/api/schedule` | จัดตารางงาน Pending สำหรับวันที่กำหนด |
| `GET` | `/api/tasks?status=` | ดึงรายการงานของผู้ใช้ที่ login |
| `POST` | `/api/tasks` | สร้างงาน |
| `PUT` | `/api/tasks/:id` | อัปเดตงาน |
| `DELETE` | `/api/tasks/:id` | ลบงาน |
| `POST` | `/api/tasks/spawn-recurring` | สร้างงานซ้ำตาม recurrence สำหรับวันที่กำหนด |

## Scripts

### Frontend

```bash
bun dev      # development server
bun run build
bun run start
bun run lint
```

### Backend

```bash
bun run dev  # watch mode
```

## Deploy หมายเหตุ

- ตั้ง `NEXT_PUBLIC_API_URL` บน frontend ให้ชี้ไป backend จริง
- ตั้ง `CORS_ORIGINS` ให้ตรงกับโดเมน production
- อย่า commit ไฟล์ `.env` / `.env.local` — ใช้ `.env.example` เป็น template เท่านั้น

## License

Private project — ใช้งานภายในทีม
