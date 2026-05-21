import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, hasSupabaseAdmin } from "@/lib/env";

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;
  const e = env();
  if (!hasSupabaseAdmin(e)) {
    throw new Error("Supabase admin not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }
  cached = createClient(e.SUPABASE_URL, e.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  return cached;
}
