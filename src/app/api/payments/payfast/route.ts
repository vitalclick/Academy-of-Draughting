import crypto from 'node:crypto';
import { DepositInitSchema } from '@/lib/validation/funding';
import { computeQuote, formatRand } from '@/data/funding';
import { buildDepositCheckout } from '@/lib/payments/payfast';
import { upsertApplicantByEmail, logEvent } from '@/lib/db/applications';
import { SITE } from '@/lib/site';
import { clientKey, rateLimit } from '@/lib/ai/rate-limit';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const key = clientKey(req.headers);
  if (!rateLimit(`deposit:${key}`, 6, 4).ok) {
    return Response.json({ error: 'rate_limited' }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = DepositInitSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: 'invalid_payload' }, { status: 400 });
  }
  const data = parsed.data;

  const quote = computeQuote({ courseId: data.courseId, route: data.route, months: data.months });
  if (!quote) return Response.json({ error: 'unknown_course' }, { status: 400 });

  // Pay-upfront settles the discounted fee; monthly settles the deposit.
  const amount = quote.route === 'upfront' ? quote.payable : quote.deposit;
  const itemName =
    quote.route === 'upfront'
      ? `${quote.courseTitle} — full fee`
      : `${quote.courseTitle} — enrolment deposit`;

  const paymentId = crypto.randomUUID();

  try {
    const applicant = await upsertApplicantByEmail({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    await logEvent({
      name: 'deposit_initiated',
      applicant_id: applicant.id,
      application_id: null,
      anonymous_id: null,
      session_id: null,
      payload: { paymentId, courseId: quote.courseId, route: quote.route, amount },
    });

    const checkout = buildDepositCheckout({
      amount,
      itemName: `${SITE.short}: ${itemName}`,
      paymentId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      custom: { custom_str1: quote.courseId, custom_str2: quote.route },
    });

    return Response.json({
      ok: true,
      action: checkout.action,
      fields: checkout.fields,
      mocked: checkout.mocked,
      amountLabel: formatRand(amount),
    });
  } catch (err) {
    console.error('[deposit]', err);
    return Response.json({ error: 'server_error' }, { status: 500 });
  }
}
