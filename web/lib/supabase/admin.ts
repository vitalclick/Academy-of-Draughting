import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, hasSupabaseAdmin } from "@/lib/env";
import type { Database } from "@/lib/database.types";

let cached: SupabaseClient<Database> | null = null;

export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (cached) return cached;
  const e = env();
  if (!hasSupabaseAdmin(e)) {
    throw new Error("Supabase admin not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }
  cached = createClient<Database>(e.SUPABASE_URL, e.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  return cached;
}
