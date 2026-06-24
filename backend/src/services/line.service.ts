import crypto from 'crypto';
import { env } from '../config/env';

const PUSH_API  = 'https://api.line.me/v2/bot/message/push';
const REPLY_API = 'https://api.line.me/v2/bot/message/reply';

function authHeader() {
  return `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`;
}

/** ส่ง push message ไปยัง LINE user */
export async function sendPushMessage(lineUserId: string, text: string): Promise<void> {
  if (!env.LINE_CHANNEL_ACCESS_TOKEN) throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not set');

  const res = await fetch(PUSH_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: authHeader() },
    body: JSON.stringify({ to: lineUserId, messages: [{ type: 'text', text }] }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`LINE Push API ${res.status}: ${body}`);
  }
}

/** ตอบกลับ message ผ่าน reply token */
export async function replyMessage(replyToken: string, text: string): Promise<void> {
  if (!env.LINE_CHANNEL_ACCESS_TOKEN) return;

  await fetch(REPLY_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: authHeader() },
    body: JSON.stringify({ replyToken, messages: [{ type: 'text', text }] }),
  }).catch(console.error);
}

/** ตรวจสอบ X-Line-Signature จาก LINE platform */
export function verifyLineSignature(rawBody: string, signature: string): boolean {
  if (!env.LINE_CHANNEL_SECRET) return false;
  const hash = crypto
    .createHmac('sha256', env.LINE_CHANNEL_SECRET)
    .update(rawBody)
    .digest('base64');
  return hash === signature;
}
