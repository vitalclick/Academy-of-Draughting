import { ConsultationSchema } from '@/lib/validation/consultation';
import { upsertApplicantByEmail, logEvent, getEventNamesForApplicant } from '@/lib/db/applications';
import { upsertHubspotLead } from '@/lib/hubspot/contacts';
import { computeLeadScore } from '@/lib/leads/scoring';
import { sendMetaEvent } from '@/lib/analytics/meta-capi';
import { sendEmail } from '@/lib/email/resend';
import { env, publicSiteUrl } from '@/lib/env';
import { SITE } from '@/lib/site';
import { clientKey, rateLimit } from '@/lib/ai/rate-limit';

export const runtime = 'nodejs';

const esc = (s: string) => s.replace(/[<>&"']/g, '');

export async function POST(req: Request) {
  const key = clientKey(req.headers);
  if (!rateLimit(`consult:${key}`, 5, 4).ok) {
    return Response.json({ error: 'rate_limited' }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = ConsultationSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: 'invalid_payload' }, { status: 400 });
  }
  const d = parsed.data;
  const when = [d.preferredDate, d.preferredTime].filter(Boolean).join(' · ') || 'flexible';

  try {
    const applicant = await upsertApplicantByEmail({
      email: d.email,
      firstName: d.firstName,
      phone: d.phone,
    });

    await logEvent({
      name: 'consultation_booked',
      applicant_id: applicant.id,
      application_id: null,
      anonymous_id: d.anonymousId ?? null,
      session_id: d.sessionId ?? null,
      payload: { campus: d.campus, when, interest: d.interest ?? null },
    });

    const leadScore = computeLeadScore(await getEventNamesForApplicant(applicant.id));

    await upsertHubspotLead({
      email: d.email,
      firstName: d.firstName,
      phone: d.phone,
      programme: d.interest,
      source: `consultation:${d.campus}`,
      leadScore,
    }).catch((err) => console.warn('[consult] hubspot failed', err));

    await sendMetaEvent({
      eventName: 'Schedule',
      email: d.email,
      phone: d.phone,
      sourceUrl: `${publicSiteUrl()}/book`,
    }).catch(() => {});

    await sendEmail({
      to: d.email,
      subject: 'We’ve got your consultation request',
      html: `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,sans-serif;color:#050F25;background:#F4F6FA;padding:24px;margin:0"><div style="max-width:540px;margin:0 auto;background:#fff;border:1px solid #E8EDF5;border-radius:14px;padding:32px"><div style="font-size:11px;letter-spacing:.12em;color:#4A5876;margin-bottom:18px">${SITE.name.toUpperCase()}</div><h1 style="font-size:22px;margin:0 0 16px;font-weight:500">Thanks, ${esc(d.firstName)}</h1><p style="font-size:15px;line-height:1.6">We've received your request for a ${esc(d.campus)} consultation (${esc(when)}). Admissions will confirm a time with you shortly — usually within one business day.</p><p style="font-size:13px;color:#8693AC;margin-top:20px">Need us sooner? WhatsApp ${esc(SITE.phone)}.</p></div></body></html>`,
      replyTo: env.ADMISSIONS_INBOX,
    }).catch((err) => console.warn('[consult] email failed', err));

    if (env.ADMISSIONS_INBOX) {
      await sendEmail({
        to: env.ADMISSIONS_INBOX,
        subject: `Consultation request · ${d.campus} · ${d.email}`,
        html: `<p>New consultation/booking request (lead score ${leadScore}).</p><ul><li>Name: ${esc(d.firstName)}</li><li>Email: ${esc(d.email)}</li><li>Phone: ${esc(d.phone)}</li><li>Campus: ${esc(d.campus)}</li><li>Preferred: ${esc(when)}</li><li>Interest: ${esc(d.interest ?? '—')}</li><li>Message: ${esc(d.message ?? '—')}</li></ul>`,
        replyTo: d.email,
      }).catch(() => {});
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error('[consult]', err);
    return Response.json({ error: 'server_error' }, { status: 500 });
  }
}
