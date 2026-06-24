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
smart-scheduler/
├── backend/                          # Express 5 + Bun
│   ├── src/
│   │   ├── config/env.ts             # Environment validation
│   │   ├── db/supabase.ts            # Supabase client
│   │   ├── middleware/
│   │   │   ├── auth.ts               # JWT auth middleware
│   │   │   └── cors.ts               # CORS configuration
│   │   ├── types/index.ts            # TypeScript interfaces
│   │   ├── utils/time.ts             # Time helper functions
│   │   ├── services/
│   │   │   ├── ai.service.ts         # Groq AI logic
│   │   │   ├── schedule.service.ts   # Smart scheduling algorithm
│   │   │   └── tasks.service.ts      # Task DB operations
│   │   ├── controllers/
│   │   │   ├── ai.controller.ts
│   │   │   ├── schedule.controller.ts
│   │   │   └── tasks.controller.ts
│   │   ├── routes/
│   │   │   ├── ai.routes.ts
│   │   │   ├── schedule.routes.ts
│   │   │   ├── tasks.routes.ts
│   │   │   └── index.ts
│   │   └── app.ts                    # Express app setup
│   ├── index.ts                      # Entry point
│   └── .env.example
│
├── frontend/                         # Next.js 16 (App Router) + React 19
│   ├── app/                          # Pages only
│   │   ├── (auth)/login/
│   │   ├── (auth)/register/
│   │   ├── dashboard/
│   │   ├── tasks/
│   │   ├── schedule/
│   │   └── profile/
│   ├── components/                   # Shared React components
│   ├── hooks/                        # Custom React hooks
│   ├── context/                      # React Context providers
│   ├── lib/
│   │   ├── api/                      # API layer (by domain)
│   │   │   ├── http.ts               # Fetch helper
│   │   │   ├── tasks.ts
│   │   │   ├── ai.ts
│   │   │   ├── schedule.ts
│   │   │   ├── profile.ts
│   │   │   └── index.ts
│   │   ├── supabase.ts
│   │   └── types.ts
│   └── .env.example
│
├── supabase/
│   ├── migrations/
│   └── schema.sql
└── scripts/
    └── test-supabase.ts
```

## สิ่งที่ต้องมี

- [Bun](https://bun.sh) (แนะนำ) หรือ Node.js 20+
- บัญชี [Supabase](https://supabase.com) (PostgreSQL + Auth)
- API key จาก [Groq Console](https://console.groq.com) (สำหรับ AI breakdown)

## ติดตั้ง

### 1. Clone และติดตั้ง dependencies

```bash
# ติดตั้งทั้งหมดพร้อมกัน (root scripts)
bun run install:all

# หรือติดตั้งแยก
cd backend && bun install
cd ../frontend && bun install
```

### 2. ตั้งค่า environment

**Backend:**
```bash
cd backend
cp .env.example .env
# แก้ไขค่าใน .env
```

**Frontend:**
```bash
cd frontend
cp .env.example .env.local
# แก้ไขค่าใน .env.local
```

| ตัวแปร | ที่ใช้ | คำอธิบาย |
|--------|--------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | frontend | URL โปรเจกต์ Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | frontend | anon/public key |
| `NEXT_PUBLIC_API_URL` | frontend | URL backend (default: `http://localhost:5000`) |
| `SUPABASE_URL` | backend | URL เดียวกับ frontend |
| `SUPABASE_ANON_KEY` | backend | anon key (fallback ถ้าไม่มี service role) |
| `SUPABASE_SERVICE_ROLE_KEY` | backend | **จำเป็นหลังเปิด RLS** — สำหรับ API ฝั่ง server |
| `CORS_ORIGINS` | backend | whitelist domain (คั่นหลายโดเมนด้วย `,`) |
| `GROQ_API_KEY` | backend | สำหรับ AI แตกงาน |
| `PORT` | backend | พอร์ต API (default: `5000`) |

### 3. Supabase — schema + RLS

**โปรเจกต์ใหม่:** รัน `supabase/schema.sql` ใน [SQL Editor](https://supabase.com/dashboard/project/_/sql)

**โปรเจกต์ที่มีตารางแล้ว:** รัน `supabase/migrations/202605300001_enable_rls.sql`

| ตาราง | คำอธิบาย |
|--------|----------|
| `users` | profile (`id` = `auth.users.id`), chronotype, peak/dip time |
| `tasks` | งานของผู้ใช้ |
| `schedules` | ช่วงเวลาในตาราง (`Task` / `Mandatory_Break`) |

### 4. รัน development

```bash
# Terminal 1 — Backend (port 5000)
cd backend
bun run dev

# Terminal 2 — Frontend (port 3000)
cd frontend
bun dev
```

เปิด [http://localhost:3000](http://localhost:3000) → Register → ตั้ง Profile (chronotype / peak-dip) → เพิ่มงาน → จัดตาราง

## API (Backend)

Base URL: `http://localhost:5000`

| Method | Path | คำอธิบาย |
|--------|------|----------|
| `POST` | `/api/ai-breakdown` | แตกงานใหญ่เป็น subtasks (Groq) |
| `POST` | `/api/schedule` | จัดตารางงาน Pending สำหรับวันที่กำหนด |
| `GET` | `/api/tasks?status=` | ดึงรายการงานของผู้ใช้ที่ login |
| `POST` | `/api/tasks` | สร้างงาน |
| `PUT` | `/api/tasks/:id` | อัปเดตงาน |
| `DELETE` | `/api/tasks/:id` | ลบงาน |
| `POST` | `/api/tasks/spawn-recurring` | สร้างงานซ้ำตาม recurrence สำหรับวันที่กำหนด |

## Architecture

### Backend (Layered Architecture)

```
Request → Middleware (CORS, Auth) → Route → Controller → Service → Database
```

- **Config** — validate & centralize env vars
- **Middleware** — cross-cutting concerns (auth, cors)
- **Routes** — HTTP method + path definitions only
- **Controllers** — parse req/res, delegate to service, handle errors
- **Services** — business logic + DB operations (pure functions, no Express types)
- **Utils** — stateless helper functions

### Frontend (Feature-based)

```
app/          ← Next.js pages (routing only)
components/   ← Reusable React components
hooks/        ← Custom hooks (encapsulate state + API calls)
context/      ← Global state (Auth)
lib/api/      ← HTTP client + domain-specific API functions
lib/          ← Types, Supabase client
```

## Deploy หมายเหตุ

- ตั้ง `NEXT_PUBLIC_API_URL` บน frontend ให้ชี้ไป backend จริง
- ตั้ง `CORS_ORIGINS` ให้ตรงกับโดเมน production
- อย่า commit ไฟล์ `.env` / `.env.local` — ใช้ `.env.example` เป็น template เท่านั้น

## License

Private project — ใช้งานภายในทีม
