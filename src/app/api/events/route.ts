import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logEvent } from '@/lib/db/applications';
import { deriveDimensions } from '@/lib/analytics/enrich';
import { publicSiteUrl } from '@/lib/env';

const Schema = z.object({
  name: z.string().min(1).max(100),
  anonymousId: z.string().max(64).nullable().optional(),
  sessionId: z.string().max(64).nullable().optional(),
  applicationId: z.string().uuid().nullable().optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

function selfHost(): string {
  try {
    return new URL(publicSiteUrl()).host.toLowerCase();
  } catch {
    return '';
  }
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = Schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const payload = parsed.data.payload ?? {};
  const referrer = typeof payload.referrer === 'string' ? payload.referrer : null;
  const { device, source, country } = deriveDimensions(req.headers, referrer, selfHost());

  await logEvent({
    name: parsed.data.name,
    applicant_id: null,
    application_id: parsed.data.applicationId ?? null,
    anonymous_id: parsed.data.anonymousId ?? null,
    session_id: parsed.data.sessionId ?? null,
    payload: { ...payload, device, source, country },
  });
  return NextResponse.json({ ok: true });
}
