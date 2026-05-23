import 'server-only';
import { supabaseRouteHandler } from '@/lib/supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { EnrollmentRow } from '@/types/database';

export type StudentSession = {
  userId: string;
  email: string;
  enrollments: EnrollmentRow[];
};

/**
 * Returns the current student session, or null if the visitor isn't signed in
 * OR isn't enrolled. Distinct from `currentAdmin()` — students don't get
 * admin permissions just because they signed in.
 */
export async function currentStudent(): Promise<StudentSession | null> {
  const sb = await supabaseRouteHandler();
  if (!sb) return null;

  const {
    data: { user },
    error,
  } = await sb.auth.getUser();
  if (error || !user?.email) return null;

  // Use the service-role client to read enrollments — the user's own RLS
  // works too, but this stays consistent with the admin flow and avoids
  // re-issuing the query.
  const admin = supabaseAdmin();
  if (!admin) return null;

  const { data } = await admin
    .from('enrollments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (!data || data.length === 0) return null;

  return { userId: user.id, email: user.email, enrollments: data };
}
