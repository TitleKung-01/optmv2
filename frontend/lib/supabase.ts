import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables.\n" +
      "Create frontend/.env.local and set:\n" +
      "  NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co\n" +
      "  NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
