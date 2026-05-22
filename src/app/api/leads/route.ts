import { z } from 'zod';
import { upsertApplicantByEmail, logEvent } from '@/lib/db/applications';
import { sendEmail } from '@/lib/email/resend';
import { env, publicSiteUrl } from '@/lib/env';
import { SITE } from '@/lib/site';
import { clientKey, rateLimit } from '@/lib/ai/rate-limit';

export const runtime = 'nodejs';

const Schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  firstName: z.string().trim().min(1).max(80).optional(),
  source: z.string().max(64).optional(), // e.g. 'exit_intent', 'newsletter'
  segment: z.string().max(40).optional(),
});

const LEAD_MAGNET_URL = '/downloads/sa-draughting-careers-2026.pdf';

function leadEmailBody(firstName: string | undefined) {
  const greeting = firstName ? `Hi ${firstName.replace(/[<>&"']/g, '')}` : 'Hi';
  const url = `${publicSiteUrl()}${LEAD_MAGNET_URL}`;
  return `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,sans-serif;color:#050F25;background:#F4F6FA;padding:24px;margin:0">
  <div style="max-width:540px;margin:0 auto;background:#fff;border:1px solid #E8EDF5;border-radius:14px;padding:32px">
    <div style="font-size:11px;letter-spacing:.12em;color:#4A5876;margin-bottom:18px">${SITE.name.toUpperCase()}</div>
    <h1 style="font-size:22px;margin:0 0 16px;font-weight:500;letter-spacing:-.02em">Your guide is ready</h1>
    <p style="font-size:15px;line-height:1.6">${greeting},</p>
    <p style="font-size:15px;line-height:1.6">As requested — our 2026 guide to draughting careers in South Africa. Salary bands, demand projections, software-by-discipline, and the shortest credible route into each role.</p>
    <p style="margin-top:20px"><a href="${url}" style="display:inline-block;background:#2D6FF7;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:500">Download the guide →</a></p>
    <hr style="border:0;border-top:1px solid #E8EDF5;margin:28px 0" />
    <p style="font-size:12px;color:#8693AC;line-height:1.5">If anything jumps out, hit reply — admissions reads every email. ${SITE.email}</p>
  </div></body></html>`;
}

export async function POST(req: Request) {
  const key = clientKey(req.headers);
  const limit = rateLimit(`lead:${key}`, 5, 5);
  if (!limit.ok) {
    return Response.json({ error: 'rate_limited' }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = Schema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: 'invalid_payload' }, { status: 400 });
  }

  const { email, firstName, source, segment } = parsed.data;

  try {
    const applicant = await upsertApplicantByEmail({ email, firstName });
    await logEvent({
      name: 'lead_captured',
      applicant_id: applicant.id,
      application_id: null,
      anonymous_id: null,
      session_id: null,
      payload: { source: source ?? 'unknown', segment: segment ?? 'unknown' },
    });

    // Best-effort: send the lead magnet email
    await sendEmail({
      to: email,
      subject: 'Your 2026 SA Draughting Careers guide',
      html: leadEmailBody(firstName),
    }).catch((err) => console.warn('[lead] email failed', err));

    // Best-effort: internal alert
    if (env.ADMISSIONS_INBOX) {
      await sendEmail({
        to: env.ADMISSIONS_INBOX,
        subject: `Lead · ${email}`,
        html: `<p>New lead captured.</p><ul><li>Email: ${email}</li><li>First name: ${firstName ?? '—'}</li><li>Source: ${source ?? '—'}</li><li>Segment: ${segment ?? '—'}</li></ul>`,
        replyTo: email,
      }).catch(() => {});
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error('[lead]', err);
    return Response.json({ error: 'server_error' }, { status: 500 });
  }
}
