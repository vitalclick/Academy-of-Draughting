'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

let cached: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Browser-side Supabase client using the anon key.
 * Returns null when public Supabase env vars are not configured.
 */
export function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (cached) return cached;
  cached = createBrowserClient<Database>(url, key);
  return cached;
}
