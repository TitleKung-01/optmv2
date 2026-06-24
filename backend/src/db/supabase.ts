import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

/** Service-role client — ข้าม RLS สำหรับ server-side operations */
export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_ANON_KEY
);

/** Anon client — ใช้ verify JWT token จาก user */
export const supabaseAuth = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
