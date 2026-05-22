import { NextResponse } from 'next/server';
import { features } from '@/lib/env';
import { supabaseAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Liveness + readiness probe.
 *
 *   - liveness: process is up (the response itself proves this)
 *   - readiness: downstream dependencies are reachable
 *
 * Uptime monitors should poll `?check=ready` to require dependencies, or
 * plain `/api/health` for a basic liveness check.
 */
export async function GET(req: Request) {
  const t0 = Date.now();
  const url = new URL(req.url);
  const wantsReady = url.searchParams.get('check') === 'ready';

  const checks: Record<string, { ok: boolean; durationMs?: number; detail?: string }> = {
    process: { ok: true },
  };

  if (wantsReady) {
    // Supabase: cheap, head-only count on a tiny table
    if (features.supabase) {
      const start = Date.now();
      try {
        const sb = supabaseAdmin();
        const { error } = await sb!.from('admins').select('user_id', { head: true, count: 'exact' });
        checks.supabase = {
          ok: !error,
          durationMs: Date.now() - start,
          detail: error?.message,
        };
      } catch (err) {
        checks.supabase = {
          ok: false,
          durationMs: Date.now() - start,
          detail: err instanceof Error ? err.message : 'supabase error',
        };
      }
    } else {
      checks.supabase = { ok: true, detail: 'not_configured' };
    }
  }

  const allOk = Object.values(checks).every((c) => c.ok);
  return NextResponse.json(
    {
      status: allOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime_ms: Math.round(process.uptime() * 1000),
      durationMs: Date.now() - t0,
      features: {
        supabase: features.supabase,
        resend: features.resend,
        whatsapp: features.whatsapp,
        hubspot: features.hubspot,
        ai: features.ai,
        analytics: features.analytics,
        errorSink: features.errorSink,
      },
      checks,
    },
    { status: allOk ? 200 : 503 }
  );
}
