import { NextResponse } from 'next/server';
import { z } from 'zod';
import { SignJWT } from 'jose';
import { env } from '@/lib/env';
import { sendEmail } from '@/lib/email/resend';
import { clientKey, rateLimit } from '@/lib/ai/rate-limit';
import { publicSiteUrl } from '@/lib/env';
import { SITE } from '@/lib/site';
import { supabaseAdmin } from '@/lib/supabase/server';
import { logEvent } from '@/lib/db/applications';

export const runtime = 'nodejs';

/**
 * Data-rights intake. Anyone can request:
 *   - 'access' : a copy of all personal data we hold about them
 *   - 'delete' : permanent erasure (subject to legal-hold exceptions)
 *
 * To avoid impersonation, we email a signed magic link to the address on
 * record. Clicking the link confirms ownership; admissions reviews and
 * executes from /admin/applications.
 */

const Schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  kind: z.enum(['access', 'delete']),
  reason: z.string().max(2000).optional(),
});

function tokenKey() {
  const secret =
    env.TRACKING_TOKEN_SECRET ?? 'dev-only-secret-please-set-TRACKING_TOKEN_SECRET';
  return new TextEncoder().encode(secret);
}

async function mintToken(email: string, kind: 'access' | 'delete') {
  return new SignJWT({ email, kind })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('aoad.data-rights')
    .setExpirationTime('48h')
    .sign(tokenKey());
}

export async function POST(req: Request) {
  const limit = rateLimit(`data-rights:${clientKey(req.headers)}`, 4, 4);
  if (!limit.ok) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }
  const json = await req.json().catch(() => null);
  const parsed = Schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  // Always respond OK, even if no record exists, to avoid revealing membership.
  const sb = supabaseAdmin();
  if (sb) {
    const { data } = await sb
      .from('applicants')
      .select('id')
      .eq('email', parsed.data.email)
      .maybeSingle();
    if (data) {
      const token = await mintToken(parsed.data.email, parsed.data.kind);
      const url = `${publicSiteUrl()}/data-rights/confirm?token=${token}`;
      await sendEmail({
        to: parsed.data.email,
        subject: `${parsed.data.kind === 'access' ? 'Access' : 'Deletion'} request — confirm via this link`,
        html: confirmEmail(url, parsed.data.kind),
      }).catch(() => {});
      if (env.ADMISSIONS_INBOX) {
        await sendEmail({
          to: env.ADMISSIONS_INBOX,
          subject: `Data-rights request · ${parsed.data.kind} · ${parsed.data.email}`,
          html: `<p>A ${parsed.data.kind} request was submitted by <strong>${parsed.data.email}</strong>.</p>${
            parsed.data.reason ? `<p>Reason:</p><blockquote>${escape(parsed.data.reason)}</blockquote>` : ''
          }<p>The applicant has been emailed a confirmation link (48-hour TTL).</p>`,
          replyTo: parsed.data.email,
        }).catch(() => {});
      }
      await logEvent({
        name: 'data_rights_requested',
        applicant_id: data.id,
        application_id: null,
        anonymous_id: null,
        session_id: null,
        payload: { kind: parsed.data.kind },
      }).catch(() => {});
    }
  }

  return NextResponse.json({ ok: true });
}

function escape(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;'
  );
}

function confirmEmail(url: string, kind: 'access' | 'delete') {
  const verb = kind === 'access' ? 'data export' : 'data deletion';
  return `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,sans-serif;color:#050F25;background:#F4F6FA;padding:24px;margin:0">
  <div style="max-width:540px;margin:0 auto;background:#fff;border:1px solid #E8EDF5;border-radius:14px;padding:32px">
    <div style="font-size:11px;letter-spacing:.12em;color:#4A5876;margin-bottom:18px">${SITE.name.toUpperCase()} · POPIA</div>
    <h1 style="font-size:22px;margin:0 0 12px;font-weight:500;letter-spacing:-.02em">Confirm your ${verb} request</h1>
    <p style="font-size:15px;line-height:1.55">We received a ${verb} request for this email. If that was you, click the button below to confirm. The link expires in 48 hours.</p>
    <p style="margin-top:20px"><a href="${url}" style="display:inline-block;background:#2D6FF7;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:500">Confirm ${verb}</a></p>
    <p style="font-size:13px;color:#8693AC;margin-top:24px">If you didn't make this request, ignore this email — nothing happens without confirmation.</p>
  </div></body></html>`;
}
