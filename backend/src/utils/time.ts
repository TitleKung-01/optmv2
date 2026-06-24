/** แปลงเวลา "HH:mm" เป็นนาทีของวัน */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** ตั้งเวลาบน Date object จากนาทีของวัน */
export function setTimeFromMinutes(baseDate: Date, minutes: number): Date {
  const result = new Date(baseDate);
  result.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return result;
}
