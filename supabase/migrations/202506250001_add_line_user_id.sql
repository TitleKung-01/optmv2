-- เพิ่ม line_user_id สำหรับ LINE Messaging API notifications
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS line_user_id text;
