import dotenv from "dotenv";
import express, { type Request, type Response } from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import Groq from "groq-sdk";

// โหลดค่าจากไฟล์ .env
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

function parseCorsOrigins(): string[] {
    const raw = process.env.CORS_ORIGINS ?? process.env.CORS_ORIGIN ?? "http://localhost:3000";
    return raw
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);
}

const allowedOrigins = parseCorsOrigins();

// 🟢 Middleware
app.use(
    cors({
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "DELETE"],
    })
);
app.use(express.json());

// 🟢 ตั้งค่า Supabase (service role ข้าม RLS สำหรับ API ฝั่ง server)
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey =
    (process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined) ||
    (process.env.SUPABASE_ANON_KEY as string);
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn(
        "⚠️ แนะนำตั้ง SUPABASE_SERVICE_ROLE_KEY ใน .env หลังเปิด RLS — API จะใช้ anon key และอาจถูกบล็อก"
    );
}
const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAuth = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY as string);

interface AuthenticatedRequest extends Request {
    userId?: string;
}

async function requireAuth(req: AuthenticatedRequest, res: Response, next: () => void) {
    if (req.method === "OPTIONS") {
        next();
        return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ success: false, message: "Missing or invalid Authorization header" });
        return;
    }

    const token = authHeader.slice("Bearer ".length).trim();
    const { data, error } = await supabaseAuth.auth.getUser(token);

    if (error || !data.user) {
        res.status(401).json({ success: false, message: "Invalid or expired token" });
        return;
    }

    req.userId = data.user.id;
    next();
}

app.use("/api", requireAuth);

// 🟢 ตั้งค่า Groq AI (สมองกลตัวใหม่ เร็วปรื๊ด!)
if (!process.env.GROQ_API_KEY) {
    console.error("⚠️ คำเตือน: อย่าลืมใส่ GROQ_API_KEY ในไฟล์ .env นะครับ!");
}
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 🌟 สร้าง Interface สำหรับกำหนดรูปร่างของ Request Body
interface AIBreakdownRequest {
    taskTitle: string;
}

interface ScheduleRequest {
    user_id: string;
    start_time: string;
    days?: number; // multi-day: schedule across N days
}

interface TaskRow {
    id: string;
    user_id: string;
    title: string;
    difficulty: "Low" | "Medium" | "High";
    estimated_duration: number;
    status: string;
    priority: number;
    deadline: string | null;
    recurrence: "none" | "daily" | "weekly" | "custom";
    recurrence_days: number[] | null;
    category: string | null;
    created_at: string;
}

interface UserRow {
    id: string;
    email?: string;
    chronotype?: string | null;
    peak_time_start?: string | null;
    peak_time_end?: string | null;
    dip_time_start?: string | null;
    dip_time_end?: string | null;
}

// 🔧 Helper: แปลงเวลา "HH:mm" เป็นนาทีของวัน
function timeToMinutes(time: string): number {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
}

// 🔧 Helper: ตั้งเวลาจากนาทีของวัน
function setTimeFromMinutes(baseDate: Date, minutes: number): Date {
    const result = new Date(baseDate);
    result.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
    return result;
}


// ====================================================
// 🤖 API 1: ให้ AI ช่วยแตกงานใหญ่เป็นงานย่อย (ใช้ Groq)
// ====================================================
app.post(
    "/api/ai-breakdown",
    async (req: Request<{}, {}, AIBreakdownRequest>, res: Response): Promise<void> => {
        try {
            const { taskTitle } = req.body;

            if (!taskTitle) {
                res.status(400).json({ success: false, message: "กรุณาส่งชื่องานมาด้วยครับ" });
                return;
            }

            const prompt = `
        คุณคือผู้เชี่ยวชาญด้านการจัดสรรเวลา (Time Management Expert)
        ฉันมีงานใหญ่คือ: "${taskTitle}"
        ช่วยแตกงานนี้ออกเป็นงานย่อยๆ (Subtasks) ที่ทำได้จริงให้หน่อย
        โดยให้เวลาแต่ละงานย่อยอยู่ในช่วง 15 ถึง 120 นาที
        และประเมินความยากเป็นภาษาอังกฤษ (Low, Medium, High)

        🚨 กฎสำคัญ: ตอบกลับมาเป็นโครงสร้าง JSON Array เท่านั้น ห้ามมีคำทักทาย ห้ามมี Markdown (เช่น \`\`\`json)
        ตัวอย่างที่ต้องการเป๊ะๆ:
        [
          { "title": "หาข้อมูลอ้างอิง", "duration": 30, "difficulty": "Low" },
          { "title": "ร่างโครงสร้างเนื้อหา", "duration": 45, "difficulty": "Medium" }
        ]
      `;

            // ส่งคำสั่งไปให้ Groq ประมวลผล
            const chatCompletion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
                temperature: 0.5,
            });

            const responseText = chatCompletion.choices[0]?.message?.content || "";

            // คลีนข้อมูลเผื่อ AI แถม Markdown มาให้
            const cleanText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
            const subtasks = JSON.parse(cleanText);

            res.json({ success: true, subtasks });
        } catch (error) {
            console.error("Groq AI Error:", error);
            res.status(500).json({ success: false, message: "สมองกล AI ทำงานผิดพลาดครับ ลองใหม่อีกครั้ง" });
        }
    }
);


// ====================================================
// 📅 API 2: จัดตารางงานอัจฉริยะ (Smart Schedule Generation)
// ใช้ peak/dip time + difficulty ในการจัดลำดับ
// ====================================================
app.post(
    "/api/schedule",
    async (req: AuthenticatedRequest & Request<{}, {}, ScheduleRequest>, res: Response): Promise<void> => {
        try {
            const { start_time } = req.body;
            const user_id = req.userId;

            if (!user_id || !start_time) {
                res.status(400).json({ success: false, message: "ข้อมูลไม่ครบถ้วน" });
                return;
            }

            // 1. ดึงงานที่ยังไม่เสร็จ (Pending)
            const { data: tasks, error: fetchError } = await supabase
                .from("tasks")
                .select("*")
                .eq("user_id", user_id)
                .eq("status", "Pending")
                .order("created_at", { ascending: true });

            if (fetchError) throw fetchError;

            if (!tasks || tasks.length === 0) {
                res.json({ success: false, message: "ไม่มีงานรอคิวให้จัดตาราง" });
                return;
            }

            // 2. ดึง user profile เพื่อใช้ peak/dip time
            const { data: userProfile } = await supabase
                .from("users")
                .select("*")
                .eq("id", user_id)
                .single();

            const profile = userProfile as UserRow | null;

            // 3. ลบตารางงานเก่าของวันที่เลือก (เพื่อจัดใหม่)
            const targetDate = new Date(start_time);
            const dayStart = new Date(targetDate);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(targetDate);
            dayEnd.setHours(23, 59, 59, 999);

            await supabase
                .from("schedules")
                .delete()
                .eq("user_id", user_id)
                .gte("start_time", dayStart.toISOString())
                .lte("start_time", dayEnd.toISOString());

            // 4. Smart Scheduling — จัดงานตาม peak/dip + difficulty
            const typedTasks = tasks as TaskRow[];
            const hasPeakDip =
                profile?.peak_time_start &&
                profile?.peak_time_end &&
                profile?.dip_time_start &&
                profile?.dip_time_end;

            let sortedTasks: TaskRow[];

            if (hasPeakDip) {
                // ===== Smart Mode: จัดตาม difficulty + priority + deadline =====
                // คำนวณ urgency score สำหรับแต่ละ task
                const now = new Date();
                const scoredTasks = typedTasks.map((t) => {
                    let urgencyScore = 0;
                    // priority score (1-5 → 0-40)
                    urgencyScore += (t.priority || 3) * 10;
                    // deadline score (ยิ่งใกล้ยิ่งสูง)
                    if (t.deadline) {
                        const daysLeft = Math.max(0, (new Date(t.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                        if (daysLeft <= 0) urgencyScore += 50; // overdue!
                        else if (daysLeft <= 1) urgencyScore += 40;
                        else if (daysLeft <= 3) urgencyScore += 25;
                        else if (daysLeft <= 7) urgencyScore += 10;
                    }
                    // difficulty bonus for peak time matching
                    const difficultyScore = t.difficulty === "High" ? 3 : t.difficulty === "Medium" ? 2 : 1;
                    return { task: t, urgencyScore, difficultyScore };
                });

                // เรียงตาม urgency สูงสุดก่อน
                scoredTasks.sort((a, b) => b.urgencyScore - a.urgencyScore);

                const highTasks = scoredTasks.filter((s) => s.task.difficulty === "High").map(s => s.task);
                const mediumTasks = scoredTasks.filter((s) => s.task.difficulty === "Medium").map(s => s.task);
                const lowTasks = scoredTasks.filter((s) => s.task.difficulty === "Low").map(s => s.task);

                const peakS = timeToMinutes(profile!.peak_time_start!);
                const peakE = timeToMinutes(profile!.peak_time_end!);
                const dipS = timeToMinutes(profile!.dip_time_start!);
                const dipE = timeToMinutes(profile!.dip_time_end!);

                // สร้าง time slots แบ่ง 3 ช่วง
                interface TimeSlot {
                    startMin: number;
                    endMin: number;
                    label: "peak" | "normal" | "dip";
                }

                // สร้างช่วงเวลาเรียงตามลำดับในวัน (6:00 - 23:00)
                const dayStartMin = 360;  // 6:00
                const dayEndMin = 1380;   // 23:00

                const slots: TimeSlot[] = [];

                // สร้าง slot จากเวลาจริง เรียงตาม start time
                const rawSlots = [
                    { startMin: peakS, endMin: peakE, label: "peak" as const },
                    { startMin: dipS, endMin: dipE, label: "dip" as const },
                ];

                // เรียงตามเวลาเริ่ม
                rawSlots.sort((a, b) => a.startMin - b.startMin);

                // เติม normal slots ระหว่าง peak/dip
                let cursor = dayStartMin;
                for (const slot of rawSlots) {
                    if (cursor < slot.startMin) {
                        slots.push({ startMin: cursor, endMin: slot.startMin, label: "normal" });
                    }
                    slots.push(slot);
                    cursor = Math.max(cursor, slot.endMin);
                }
                if (cursor < dayEndMin) {
                    slots.push({ startMin: cursor, endMin: dayEndMin, label: "normal" });
                }

                // จัดงานลง slots ตาม priority: peak→High, normal→Medium, dip→Low
                // ถ้าช่วงไหนเต็ม → overflow ไปช่วงถัดไป
                const taskQueues: Record<string, TaskRow[]> = {
                    peak: [...highTasks, ...mediumTasks, ...lowTasks],
                    normal: [...mediumTasks, ...highTasks, ...lowTasks],
                    dip: [...lowTasks, ...mediumTasks, ...highTasks],
                };

                const assignedTaskIds = new Set<string>();
                sortedTasks = [];

                for (const slot of slots) {
                    const queue = taskQueues[slot.label];
                    for (const task of queue) {
                        if (!assignedTaskIds.has(task.id)) {
                            assignedTaskIds.add(task.id);
                            sortedTasks.push(task);
                        }
                    }
                }

                // เพิ่มงานที่อาจยังไม่ได้จัด (safety net)
                for (const task of typedTasks) {
                    if (!assignedTaskIds.has(task.id)) {
                        sortedTasks.push(task);
                    }
                }

                console.log(`🧠 Smart scheduling: ${highTasks.length} High → Peak (${profile!.peak_time_start}-${profile!.peak_time_end}), ${lowTasks.length} Low → Dip (${profile!.dip_time_start}-${profile!.dip_time_end})`);
            } else {
                // ===== Fallback: เรียงตาม created_at =====
                sortedTasks = typedTasks;
                console.log("📋 Fallback scheduling: เรียงตาม created_at (ไม่มี peak/dip data)");
            }

            // 5. สร้างตารางงานจากลำดับที่จัดแล้ว
            let currentTime = new Date(start_time);

            // ถ้าเวลาเริ่มเป็น 00:00 → เลื่อนไปเริ่มที่ช่วงแรก
            if (currentTime.getHours() === 0 && currentTime.getMinutes() === 0) {
                if (hasPeakDip) {
                    // เริ่มที่ slot แรกของวัน
                    const firstSlotMin = Math.min(
                        timeToMinutes(profile!.peak_time_start!),
                        timeToMinutes(profile!.dip_time_start!),
                        360 // ไม่เร็วกว่า 6:00
                    );
                    currentTime = setTimeFromMinutes(currentTime, Math.max(firstSlotMin, 360));
                } else {
                    currentTime.setHours(9, 0, 0, 0);
                }
            }

            const newSchedules: {
                user_id: string;
                task_id: string | null;
                start_time: string;
                end_time: string;
                event_type: string;
            }[] = [];
            let workDuration = 0;

            for (const task of sortedTasks) {
                // เพิ่มพักเบรกทุก 120 นาที
                if (workDuration >= 120) {
                    const breakEndTime = new Date(currentTime.getTime() + 15 * 60000);
                    newSchedules.push({
                        user_id,
                        task_id: null,
                        start_time: currentTime.toISOString(),
                        end_time: breakEndTime.toISOString(),
                        event_type: "Mandatory_Break",
                    });
                    currentTime = breakEndTime;
                    workDuration = 0;
                }

                const taskEndTime = new Date(currentTime.getTime() + task.estimated_duration * 60000);

                newSchedules.push({
                    user_id,
                    task_id: task.id,
                    start_time: currentTime.toISOString(),
                    end_time: taskEndTime.toISOString(),
                    event_type: "Task",
                });

                await supabase.from("tasks").update({ status: "Scheduled" }).eq("id", task.id);

                currentTime = taskEndTime;
                workDuration += task.estimated_duration;
            }

            const { error: insertError } = await supabase.from("schedules").insert(newSchedules);
            if (insertError) throw insertError;

            const mode = hasPeakDip ? "🧠 Smart" : "📋 Basic";
            res.json({ success: true, message: `${mode} จัดตารางงานเรียบร้อย (${sortedTasks.length} งาน)` });
        } catch (error) {
            console.error("Schedule Error:", error);
            res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการจัดตาราง" });
        }
    }
);

// ====================================================
// 📋 API 3: Task CRUD — จัดการงาน (GET/POST/PUT/DELETE)
// ====================================================

// GET /api/tasks?user_id=xxx&status=Pending
app.get("/api/tasks", async (req: Request, res: Response): Promise<void> => {
    try {
        const { status } = req.query;
        const userId = (req as AuthenticatedRequest).userId;

        let query = supabase
            .from("tasks")
            .select("*")
            .eq("user_id", userId as string)
            .order("created_at", { ascending: true });

        if (status) {
            query = query.eq("status", status as string);
        }

        const { data, error } = await query;
        if (error) throw error;

        res.json({ success: true, tasks: data || [] });
    } catch (error) {
        console.error("GET Tasks Error:", error);
        res.status(500).json({ success: false, message: "ดึงข้อมูลงานล้มเหลว" });
    }
});

// POST /api/tasks — สร้าง task ใหม่
app.post("/api/tasks", async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, difficulty, estimated_duration, priority, deadline, recurrence, recurrence_days, category } = req.body;
        const user_id = (req as AuthenticatedRequest).userId;

        if (!user_id || !title) {
            res.status(400).json({ success: false, message: "กรุณาส่ง title" });
            return;
        }

        const newTask = {
            user_id,
            title: title.trim(),
            difficulty: difficulty || "Medium",
            estimated_duration: estimated_duration || 30,
            priority: Math.min(5, Math.max(1, priority || 3)),
            deadline: deadline || null,
            recurrence: recurrence || "none",
            recurrence_days: recurrence_days || null,
            category: category?.trim() || null,
            status: "Pending",
        };

        const { data, error } = await supabase.from("tasks").insert([newTask]).select().single();
        if (error) throw error;

        res.status(201).json({ success: true, task: data });
    } catch (error) {
        console.error("POST Task Error:", error);
        res.status(500).json({ success: false, message: "สร้างงานล้มเหลว" });
    }
});

// PUT /api/tasks/:id — อัปเดต task
app.put("/api/tasks/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const userId = (req as AuthenticatedRequest).userId;

        // ลบ field ที่ไม่ให้แก้
        delete updates.id;
        delete updates.user_id;
        delete updates.created_at;

        // Validate priority range
        if (updates.priority !== undefined) {
            updates.priority = Math.min(5, Math.max(1, updates.priority));
        }

        const { data, error } = await supabase
            .from("tasks")
            .update(updates)
            .eq("id", id)
            .eq("user_id", userId as string)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, task: data });
    } catch (error) {
        console.error("PUT Task Error:", error);
        res.status(500).json({ success: false, message: "อัปเดตงานล้มเหลว" });
    }
});

// DELETE /api/tasks/:id — ลบ task
app.delete("/api/tasks/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = (req as AuthenticatedRequest).userId;

        const { error } = await supabase.from("tasks").delete().eq("id", id).eq("user_id", userId as string);
        if (error) throw error;

        res.json({ success: true, message: "ลบงานสำเร็จ" });
    } catch (error) {
        console.error("DELETE Task Error:", error);
        res.status(500).json({ success: false, message: "ลบงานล้มเหลว" });
    }
});


// ====================================================
// 🔄 API 4: Spawn Recurring Tasks for a given date
// POST /api/tasks/spawn-recurring
// ====================================================
app.post("/api/tasks/spawn-recurring", async (req: Request, res: Response): Promise<void> => {
    try {
        const { date } = req.body; // date = "YYYY-MM-DD"
        const user_id = (req as AuthenticatedRequest).userId;
        if (!user_id || !date) {
            res.status(400).json({ success: false, message: "กรุณาส่ง date" });
            return;
        }

        const targetDate = new Date(date);
        const dayOfWeek = targetDate.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

        // Get all recurring task templates for this user
        const { data: recurringTasks, error } = await supabase
            .from("tasks")
            .select("*")
            .eq("user_id", user_id)
            .neq("recurrence", "none");

        if (error) throw error;
        if (!recurringTasks || recurringTasks.length === 0) {
            res.json({ success: true, spawned: 0, message: "ไม่มีงานซ้ำ" });
            return;
        }

        const tasksToSpawn: any[] = [];

        for (const task of recurringTasks as TaskRow[]) {
            let shouldSpawn = false;

            if (task.recurrence === "daily") {
                shouldSpawn = true;
            } else if (task.recurrence === "weekly") {
                const createdDay = new Date(task.created_at).getDay();
                shouldSpawn = dayOfWeek === createdDay;
            } else if (task.recurrence === "custom" && task.recurrence_days) {
                shouldSpawn = task.recurrence_days.includes(dayOfWeek);
            }

            if (shouldSpawn) {
                tasksToSpawn.push({
                    user_id: task.user_id,
                    title: task.title,
                    difficulty: task.difficulty,
                    estimated_duration: task.estimated_duration,
                    priority: task.priority,
                    deadline: null,
                    recurrence: "none",
                    recurrence_days: null,
                    category: task.category,
                    status: "Pending",
                });
            }
        }

        if (tasksToSpawn.length > 0) {
            const { error: insertError } = await supabase.from("tasks").insert(tasksToSpawn);
            if (insertError) throw insertError;
        }

        res.json({ success: true, spawned: tasksToSpawn.length, message: `สร้าง ${tasksToSpawn.length} งานซ้ำสำเร็จ` });
    } catch (error) {
        console.error("Spawn Recurring Error:", error);
        res.status(500).json({ success: false, message: "สร้างงานซ้ำล้มเหลว" });
    }
});

// 🟢 รันเซิร์ฟเวอร์
app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
    console.log(`🤖 AI (Groq) Endpoint ready at POST /api/ai-breakdown`);
    console.log(`📅 Schedule Endpoint ready at POST /api/schedule`);
    console.log(`📋 Task CRUD ready at /api/tasks (GET/POST/PUT/DELETE)`);
    console.log(`🔄 Recurring spawn ready at POST /api/tasks/spawn-recurring`);
});