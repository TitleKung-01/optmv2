import Groq from 'groq-sdk';
import { env } from '../config/env';

export interface AISubtask {
  title: string;
  duration: number;
  difficulty: 'Low' | 'Medium' | 'High';
}

const groq = new Groq({ apiKey: env.GROQ_API_KEY ?? undefined });

export async function breakdownTaskWithAI(taskTitle: string): Promise<AISubtask[]> {
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
  `.trim();

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.5,
  });

  const raw = completion.choices[0]?.message?.content ?? '';
  const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(clean) as AISubtask[];
}
