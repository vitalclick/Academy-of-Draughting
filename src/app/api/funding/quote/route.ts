import { QuoteRequestSchema } from '@/lib/validation/funding';
import { computeQuote, formatRand, NSFAS_HOUSEHOLD_THRESHOLD } from '@/data/funding';
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

function quoteEmail(firstName: string | undefined, lines: string[]) {
  const greeting = firstName ? `Hi ${esc(firstName)}` : 'Hi';
  return `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,sans-serif;color:#050F25;background:#F4F6FA;padding:24px;margin:0">
  <div style="max-width:540px;margin:0 auto;background:#fff;border:1px solid #E8EDF5;border-radius:14px;padding:32px">
    <div style="font-size:11px;letter-spacing:.12em;color:#4A5876;margin-bottom:18px">${SITE.name.toUpperCase()}</div>
    <h1 style="font-size:22px;margin:0 0 16px;font-weight:500;letter-spacing:-.02em">Your fee estimate</h1>
    <p style="font-size:15px;line-height:1.6">${greeting}, here's the breakdown you asked for:</p>
    <ul style="font-size:15px;line-height:1.8;padding-left:18px">${lines.map((l) => `<li>${l}</li>`).join('')}</ul>
    <p style="margin-top:20px"><a href="${publicSiteUrl()}/apply" style="display:inline-block;background:#2D6FF7;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:500">Secure your seat →</a></p>
    <hr style="border:0;border-top:1px solid #E8EDF5;margin:28px 0" />
    <p style="font-size:12px;color:#8693AC;line-height:1.5">Figures are indicative and confirmed on enrolment. Questions? Reply to this email or WhatsApp us on ${esc(SITE.phone)}.</p>
  </div></body></html>`;
}

export async function POST(req: Request) {
  const key = clientKey(req.headers);
  if (!rateLimit(`quote:${key}`, 8, 5).ok) {
    return Response.json({ error: 'rate_limited' }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = QuoteRequestSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: 'invalid_payload' }, { status: 400 });
  }
  const data = parsed.data;

  const quote = computeQuote({ courseId: data.courseId, route: data.route, months: data.months });
  if (!quote) return Response.json({ error: 'unknown_course' }, { status: 400 });

  const bursaryFlag =
    typeof data.householdIncome === 'number' && data.householdIncome <= NSFAS_HOUSEHOLD_THRESHOLD;

  const lines = [`${quote.courseTitle}`, `Full fee: ${formatRand(quote.total)}`];
  if (quote.route === 'upfront') {
    lines.push(`Upfront discount: −${formatRand(quote.discount)}`);
    lines.push(`<strong>You pay: ${formatRand(quote.payable)}</strong>`);
  } else if (quote.route === 'monthly' && quote.monthly && quote.months) {
    lines.push(`Deposit to secure your seat: ${formatRand(quote.deposit)}`);
    lines.push(
      `<strong>${quote.months} × ${formatRand(quote.monthly)}/month</strong> on the balance`
    );
  } else {
    lines.push(`Deposit to secure your seat: ${formatRand(quote.deposit)}`);
  }
  if (bursaryFlag) lines.push('You may qualify for NSFAS/bursary support — admissions will follow up.');

  try {
    const applicant = await upsertApplicantByEmail({
      email: data.email,
      firstName: data.firstName,
      phone: data.phone,
    });

    await logEvent({
      name: 'funding_quote',
      applicant_id: applicant.id,
      application_id: null,
      anonymous_id: data.anonymousId ?? null,
      session_id: data.sessionId ?? null,
      payload: {
        courseId: quote.courseId,
        route: quote.route,
        total: quote.total,
        payable: quote.payable,
        months: quote.months,
        monthly: quote.monthly,
        bursaryFlag,
      },
    });

    const leadScore = computeLeadScore(await getEventNamesForApplicant(applicant.id));

    await upsertHubspotLead({
      email: data.email,
      firstName: data.firstName,
      phone: data.phone,
      programme: quote.courseId,
      source: `funding_quote:${quote.route}`,
      leadScore,
    }).catch((err) => console.warn('[quote] hubspot failed', err));

    await sendMetaEvent({
      eventName: 'Lead',
      email: data.email,
      phone: data.phone,
      value: quote.payable,
      sourceUrl: `${publicSiteUrl()}/funding`,
    }).catch(() => {});

    await sendEmail({
      to: data.email,
      subject: `Your ${quote.courseTitle} fee estimate`,
      html: quoteEmail(data.firstName, lines),
    }).catch((err) => console.warn('[quote] email failed', err));

    if (env.ADMISSIONS_INBOX) {
      await sendEmail({
        to: env.ADMISSIONS_INBOX,
        subject: `Funding quote · ${quote.courseTitle} · ${data.email}${bursaryFlag ? ' · bursary?' : ''}`,
        html: `<p>Qualified funding lead.</p><ul><li>Email: ${esc(data.email)}</li><li>Phone: ${esc(data.phone ?? '—')}</li><li>Programme: ${esc(quote.courseTitle)}</li><li>Route: ${esc(quote.route)}</li><li>Bursary candidate: ${bursaryFlag ? 'yes' : 'no'}</li></ul>`,
        replyTo: data.email,
      }).catch(() => {});
    }

    return Response.json({ ok: true, quote, bursaryFlag });
  } catch (err) {
    console.error('[quote]', err);
    return Response.json({ error: 'server_error' }, { status: 500 });
  }
}
