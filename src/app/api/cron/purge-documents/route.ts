import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { env, features } from '@/lib/env';
import { supabaseAdmin } from '@/lib/supabase/server';
import { captureError } from '@/lib/observability';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Scheduled POPIA document-retention purge. Invoked by Vercel Cron (see the
 * schedule in vercel.json). Deletes applicant ID/matric images older than
 * DOC_RETENTION_DAYS via the purge_old_documents() Postgres function.
 *
 * Auth: Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`. We reject
 * anything that doesn't match, so the endpoint can't be triggered by the public.
 */
function authorized(req: Request): boolean {
  const secret = env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get('authorization') ?? '';
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (!features.supabase) {
    return NextResponse.json({ error: 'supabase_not_configured' }, { status: 503 });
  }

  const sb = supabaseAdmin()!;
  const { data, error } = await sb.rpc('purge_old_documents', {
    retention_days: env.DOC_RETENTION_DAYS,
  });

  if (error) {
    await captureError('purge_old_documents failed', error, {
      retention_days: env.DOC_RETENTION_DAYS,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    removed: data ?? 0,
    retention_days: env.DOC_RETENTION_DAYS,
    timestamp: new Date().toISOString(),
  });
}
