import { apiFetch } from './http';

/** ส่ง LINE push notification ผ่าน backend */
export async function sendLineNotification(message: string): Promise<void> {
  await apiFetch('/api/notify/line', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}
