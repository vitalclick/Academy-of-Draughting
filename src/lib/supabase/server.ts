import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env, features } from '@/lib/env';
import type { Database } from '@/types/database';

let cached: SupabaseClient<Database> | null = null;

/**
 * Server-side Supabase client using the service-role key.
 * Bypasses RLS — only call from server actions and route handlers.
 */
export function supabaseAdmin(): SupabaseClient<Database> | null {
  if (!features.supabase) return null;
  if (cached) return cached;
  cached = createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
