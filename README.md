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

## Database Overview

### ER Diagram (conceptual)

```
auth.users (Supabase Auth)
    │ 1
    │ (trigger: handle_new_user)
    ▼ 1
public.users ──────────────────────────────────────────────── id (PK = auth.users.id)
    │ 1                                                        email, chronotype
    │                                                          peak_time_start/end
    ▼ N                                                        dip_time_start/end
public.tasks ──────────────────────────────────────────────── id (PK)
    │ 1                                                        user_id (FK → users)
    │                                                          title, description
    ▼ N                                                        difficulty, priority
public.schedules ──────────────────────────────────────────── id (PK)
                                                               user_id (FK → users)
                                                               task_id (FK → tasks, nullable)
                                                               start_time, end_time
                                                               event_type
```

### Table: `users`

| Column | Type | Default | คำอธิบาย |
|---|---|---|---|
| `id` | `uuid` | PK | ผูกกับ `auth.users.id` |
| `email` | `text` | — | อีเมลของผู้ใช้ |
| `chronotype` | `text` | `NULL` | `Morning Lark` / `Third Bird` / `Night Owl` |
| `peak_time_start` | `time` | `NULL` | เวลาเริ่มช่วงพลังงานสูงสุด |
| `peak_time_end` | `time` | `NULL` | เวลาสิ้นสุดช่วงพลังงานสูงสุด |
| `dip_time_start` | `time` | `NULL` | เวลาเริ่มช่วงพลังงานต่ำ |
| `dip_time_end` | `time` | `NULL` | เวลาสิ้นสุดช่วงพลังงานต่ำ |
| `created_at` | `timestamptz` | `now()` | วันที่สร้าง |

### Table: `tasks`

| Column | Type | Default | คำอธิบาย |
|---|---|---|---|
| `id` | `uuid` | `gen_random_uuid()` | PK |
| `user_id` | `uuid` | — | FK → `users.id` |
| `title` | `text` | — | ชื่องาน (required) |
| `description` | `text` | `NULL` | รายละเอียดงาน |
| `difficulty` | `text` | `Medium` | `Low` / `Medium` / `High` |
| `estimated_duration` | `integer` | `30` | ระยะเวลา (นาที) |
| `status` | `text` | `Pending` | `Pending` / `Scheduled` / `Completed` |
| `priority` | `integer` | `3` | 1 (ต่ำ) – 5 (สูง) |
| `deadline` | `timestamptz` | `NULL` | กำหนดส่ง |
| `recurrence` | `text` | `none` | `none` / `daily` / `weekly` / `custom` |
| `recurrence_days` | `jsonb` | `NULL` | วันในสัปดาห์ เช่น `[1,3,5]` (Mon/Wed/Fri) |
| `category` | `text` | `NULL` | หมวดหมู่งาน |
| `created_at` | `timestamptz` | `now()` | วันที่สร้าง |

### Table: `schedules`

| Column | Type | Default | คำอธิบาย |
|---|---|---|---|
| `id` | `uuid` | `gen_random_uuid()` | PK |
| `user_id` | `uuid` | — | FK → `users.id` |
| `task_id` | `uuid` | `NULL` | FK → `tasks.id` (null = break/fixed) |
| `start_time` | `timestamptz` | — | เวลาเริ่ม |
| `end_time` | `timestamptz` | — | เวลาสิ้นสุด (> start_time) |
| `event_type` | `text` | — | `Task` / `Mandatory_Break` / `Fixed` |
| `created_at` | `timestamptz` | `now()` | วันที่สร้าง |

### Row Level Security (RLS)

ทุกตารางเปิด RLS — ผู้ใช้เข้าถึงได้เฉพาะข้อมูลตัวเอง (`auth.uid() = user_id`)

| ตาราง | SELECT | INSERT | UPDATE | DELETE |
|---|:---:|:---:|:---:|:---:|
| `users` | ✅ | ✅ | ✅ | — |
| `tasks` | ✅ | ✅ | ✅ | ✅ |
| `schedules` | ✅ | ✅ | ✅ | ✅ |

> **หมายเหตุ:** Backend API ใช้ `SUPABASE_SERVICE_ROLE_KEY` เพื่อ bypass RLS สำหรับ server-side operations

### Indexes

```sql
tasks_user_id_idx        ON tasks(user_id)
tasks_user_status_idx    ON tasks(user_id, status)
schedules_user_start_idx ON schedules(user_id, start_time)
```

### Database Trigger

`on_auth_user_created` — เมื่อมี user ใหม่ใน `auth.users` จะ INSERT เข้า `public.users` อัตโนมัติ (ON CONFLICT → UPDATE email)

---

## Components

### Pages (`frontend/app/`)

| Page | Path | คำอธิบาย |
|---|---|---|
| Landing | `/` | Redirect ไป dashboard หรือ login |
| Login | `/(auth)/login` | หน้า login ด้วย Supabase Auth |
| Register | `/(auth)/register` | หน้าสมัครสมาชิก |
| Onboarding | `/onboarding` | ตั้งค่า chronotype + peak/dip ครั้งแรก |
| Dashboard | `/dashboard` | ภาพรวม, stats, streak, กราฟ 7 วัน |
| Tasks | `/tasks` | รายการงาน, filter, เพิ่ม/ลบ/แก้ไข |
| Schedule | `/schedule` | ตารางเวลา + drag & drop |
| Profile | `/profile` | ตั้งค่า chronotype, peak/dip, ข้อมูลส่วนตัว |

### Shared Components (`frontend/components/`)

#### Auth
| Component | คำอธิบาย |
|---|---|
| `auth/AuthHeader.tsx` | Header สำหรับหน้า login/register |

#### Layout & Navigation
| Component | คำอธิบาย |
|---|---|
| `Sidebar.tsx` | Navigation sidebar หลัก พร้อม active state + energy indicator |
| `NotificationBar.tsx` | แจ้งเตือน deadline ใกล้ถึง / reminder ก่อนงาน 5 นาที |

#### Dashboard
| Component | คำอธิบาย |
|---|---|
| `DashboardStats.tsx` | สรุปงาน (total/completed/overdue), streak counter, กราฟ 7 วัน |
| `BurnoutWidget.tsx` | วิเคราะห์ workload เตือนความเสี่ยง burnout |
| `SmartTipsCard.tsx` | เคล็ดลับอัจฉริยะตาม chronotype และเวลาปัจจุบัน |

#### Energy & Profile
| Component | คำอธิบาย |
|---|---|
| `EnergyGauge.tsx` | แสดงระดับพลังงาน (peak/normal/dip) แบบ real-time ตาม chronotype |
| `EnergyIntervalsCard.tsx` | แสดงช่วงเวลา peak/dip ของผู้ใช้ |
| `ChronotypeSelector.tsx` | UI เลือก Morning Lark / Third Bird / Night Owl |
| `UserInfoCard.tsx` | แสดงข้อมูล user (email, chronotype) |
| `LineConfigCard.tsx` | การตั้งค่า LINE Notification (line_user_id) |

#### Schedule & Calendar
| Component | คำอธิบาย |
|---|---|
| `ScheduleTimeline.tsx` | Timeline แสดงงานรายวัน + Drag & Drop เรียงลำดับ |
| `ScheduleHeader.tsx` | Header ของหน้า schedule (วันที่, ปุ่ม generate) |
| `MiniCalendar.tsx` | ปฏิทินขนาดย่อ เลือกวันที่ดูตาราง |
| `DayStatusCard.tsx` | สรุปสถานะงานของวันที่เลือก |
| `TimeIntervalCard.tsx` | แสดงช่วงเวลาในตาราง |
| `EditScheduleModal.tsx` | Modal แก้ไข schedule entry (เวลาเริ่ม/สิ้นสุด) |
| `ConfirmClearScheduleModal.tsx` | Modal ยืนยันการล้างตาราง |

#### Tasks
| Component | คำอธิบาย |
|---|---|
| `TaskCard.tsx` | Card แสดงงาน 1 รายการ (priority badge, deadline, status) |
| `TaskForm.tsx` | Form เพิ่ม/แก้ไขงาน (difficulty, duration, recurrence, AI breakdown) |
| `ConfirmClearTasksModal.tsx` | Modal ยืนยันการลบงานทั้งหมด |

#### Onboarding
| Component | คำอธิบาย |
|---|---|
| `OnboardingModal.tsx` | Multi-step modal ตั้งค่า chronotype + peak/dip time ครั้งแรก |

### Custom Hooks (`frontend/hooks/`)

| Hook | คำอธิบาย |
|---|---|
| `useTasks.ts` | จัดการ state งาน: fetch, create, update, delete, filter |
| `useSchedule.ts` | จัดการ schedule: generate, fetch by date, clear, reorder |
| `useEnergy.ts` | คำนวณระดับพลังงาน real-time จาก profile + เวลาปัจจุบัน |
| `useBurnout.ts` | ประเมิน burnout risk จาก workload + completed tasks ratio |
| `useProfile.ts` | ดึงและอัปเดต user profile (chronotype, peak/dip time) |

### Context (`frontend/context/`)

| Context | คำอธิบาย |
|---|---|
| `AuthContext.tsx` | Global auth state: session, user, signIn, signOut, loading |

### API Layer (`frontend/lib/api/`)

| File | คำอธิบาย |
|---|---|
| `http.ts` | `apiFetch` wrapper — inject JWT token จาก Supabase session อัตโนมัติ |
| `tasks.ts` | getTasks, createTask, updateTask, deleteTask |
| `schedule.ts` | generateSchedule, getSchedulesByDate, clearSchedulesForDate, updateSchedule |
| `ai.ts` | aiBreakdown — ส่ง task title ไป Groq รับ subtasks กลับมา |
| `profile.ts` | getUserProfile, updateUserProfile, clearAllTasks |
| `notify.ts` | ฟังก์ชันจัดการ browser notification / LINE notify |

---

## REST API Endpoints

Base URL: `http://localhost:5000`

> ทุก endpoint ต้องการ Header: `Authorization: Bearer <supabase_jwt_token>`

---

### Tasks

#### `GET /api/tasks`

ดึงรายการงานของผู้ใช้ที่ login อยู่

**Query Parameters:**
| Parameter | Type | คำอธิบาย |
|---|---|---|
| `status` | `string` (optional) | `Pending` / `Scheduled` / `Completed` |

**Response `200`:**
```json
{
  "success": true,
  "tasks": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "title": "ทำรายงาน",
      "description": "รายงานประจำเดือน",
      "difficulty": "High",
      "estimated_duration": 60,
      "status": "Pending",
      "priority": 4,
      "deadline": "2026-06-30T17:00:00Z",
      "recurrence": "none",
      "recurrence_days": null,
      "category": "Work",
      "created_at": "2026-06-25T10:00:00Z"
    }
  ]
}
```

---

#### `POST /api/tasks`

สร้างงานใหม่

**Request Body:**
```json
{
  "title": "ทำรายงาน",
  "description": "รายงานประจำเดือน",
  "difficulty": "High",
  "estimated_duration": 60,
  "priority": 4,
  "deadline": "2026-06-30T17:00:00Z",
  "recurrence": "none",
  "recurrence_days": null,
  "category": "Work"
}
```

**Response `201`:**
```json
{
  "success": true,
  "task": { ...task object }
}
```

---

#### `PUT /api/tasks/:id`

อัปเดตงาน (partial update)

**Request Body:** (ส่งเฉพาะ field ที่ต้องการเปลี่ยน)
```json
{
  "status": "Completed",
  "priority": 5
}
```

**Response `200`:**
```json
{
  "success": true,
  "task": { ...updated task object }
}
```

---

#### `DELETE /api/tasks/:id`

ลบงาน

**Response `200`:**
```json
{
  "success": true,
  "message": "Task deleted"
}
```

---

#### `POST /api/tasks/spawn-recurring`

สร้างงานซ้ำ (recurring) สำหรับวันที่กำหนด — เรียกอัตโนมัติเมื่อเปิดแอปหรือเปลี่ยนวัน

**Request Body:**
```json
{
  "date": "2026-06-26"
}
```

**Response `200`:**
```json
{
  "success": true,
  "spawned": 3
}
```

---

### Schedule

#### `POST /api/schedule`

จัดตารางงาน Pending ทั้งหมดให้อัตโนมัติสำหรับวันที่กำหนด

**Algorithm:**
1. ดึงงานทั้งหมดที่ `status = Pending`
2. ดึง user profile (peak/dip time)
3. ลบ schedule เก่าของวันนั้นออก
4. Sort งานตาม urgency score (priority + deadline proximity)
5. จัดงาน High difficulty → peak time, Low difficulty → dip time
6. แทรก `Mandatory_Break` 15 นาที ทุก 2 ชั่วโมงทำงาน
7. อัปเดต task status เป็น `Scheduled`

**Request Body:**
```json
{
  "start_time": "2026-06-26T09:00:00+07:00"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "🧠 Smart schedule สร้างเสร็จ: 5 งาน"
}
```

> หาก `peak_time` / `dip_time` ไม่ได้ตั้งค่า จะใช้ mode `📋 Basic` (จัดตามลำดับ priority อย่างเดียว)

**Error `400` (ไม่มีงาน):**
```json
{
  "success": false,
  "error": "ไม่มีงานรอคิวให้จัดตาราง"
}
```

---

### AI

#### `POST /api/ai-breakdown`

ส่งชื่องานไปให้ Groq AI (`llama-3.3-70b-versatile`) แตกเป็น subtasks

**Request Body:**
```json
{
  "taskTitle": "เขียนรายงานวิจัยฉบับสมบูรณ์"
}
```

**Response `200`:**
```json
{
  "success": true,
  "subtasks": [
    { "title": "รวบรวมข้อมูลและแหล่งอ้างอิง", "duration": 60, "difficulty": "Medium" },
    { "title": "เขียน outline", "duration": 30, "difficulty": "Low" },
    { "title": "เขียนเนื้อหาบทที่ 1", "duration": 90, "difficulty": "High" },
    { "title": "ตรวจสอบและแก้ไข", "duration": 45, "difficulty": "Medium" }
  ]
}
```

**Fields ของ subtask:**
| Field | Type | คำอธิบาย |
|---|---|---|
| `title` | `string` | ชื่องานย่อย |
| `duration` | `integer` | ระยะเวลา (นาที) |
| `difficulty` | `string` | `Low` / `Medium` / `High` |

---

### Error Responses

รูปแบบ error response มาตรฐาน:

```json
{
  "success": false,
  "error": "ข้อความอธิบายข้อผิดพลาด"
}
```

| Status Code | ความหมาย |
|---|---|
| `400` | Bad Request — ข้อมูลไม่ครบหรือไม่ถูกต้อง |
| `401` | Unauthorized — ไม่มี token หรือ token หมดอายุ |
| `404` | Not Found — ไม่พบ resource |
| `500` | Internal Server Error — ข้อผิดพลาดจาก server หรือ Supabase |

---

## License

Private project — ใช้งานภายในทีม
