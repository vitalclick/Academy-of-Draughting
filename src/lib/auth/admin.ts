import 'server-only';
import { supabaseRouteHandler } from '@/lib/supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase/server';
import { env } from '@/lib/env';

export type AdminSession = {
  userId: string;
  email: string;
  role: 'staff' | 'super';
};

function emailAllowlisted(email: string): boolean {
  if (!env.ADMIN_EMAILS) return false;
  return env.ADMIN_EMAILS.split(',')
    .map((s) => s.trim().toLowerCase())
    .includes(email.toLowerCase());
}

/**
 * Returns the current admin session, or null if the visitor is not signed in
 * or is not an admin. Layered checks:
 *   1. Supabase Auth session via SSR cookies
 *   2. Row in `admins` table OR email in ADMIN_EMAILS allowlist
 *
 * The allowlist is a bootstrap escape hatch — populate `admins` and remove
 * the env var once the team is established.
 */
export async function currentAdmin(): Promise<AdminSession | null> {
  const sb = await supabaseRouteHandler();
  if (!sb) return null;

  const {
    data: { user },
    error,
  } = await sb.auth.getUser();
  if (error || !user || !user.email) return null;

  // Allowlist check first — runs even without a populated admins table
  if (emailAllowlisted(user.email)) {
    // Auto-promote the allowlisted user into the admins table for future
    // RLS-based access. Best-effort; doesn't block sign-in.
    const adminClient = supabaseAdmin();
    if (adminClient) {
      await adminClient
        .from('admins')
        .upsert(
          { user_id: user.id, email: user.email, role: 'super' },
          { onConflict: 'user_id' }
        )
        .then(() => {}, () => {});
    }
    return { userId: user.id, email: user.email, role: 'super' };
  }

  // Otherwise look up the admins table via the user's own session.
  // RLS only allows admins to read this table — so success implies admin.
  const { data } = await sb.from('admins').select('*').eq('user_id', user.id).maybeSingle();
  if (!data) return null;
  const row = data as { user_id: string; email: string; role: 'staff' | 'super' };
  return { userId: row.user_id, email: row.email, role: row.role };
}
