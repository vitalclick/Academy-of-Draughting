import { verifyItn } from '@/lib/payments/payfast';
import { logEvent } from '@/lib/db/applications';
import { sendEmail } from '@/lib/email/resend';
import { env } from '@/lib/env';

export const runtime = 'nodejs';

/**
 * Payfast ITN (Instant Transaction Notification) webhook.
 *
 * Payfast POSTs form-encoded payment results here. We always return 200 so
 * Payfast stops retrying, but only act on verified, completed payments.
 */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) return new Response('ok', { status: 200 });

  const params: Record<string, string> = {};
  for (const [k, v] of form.entries()) params[k] = String(v);

  const verified = await verifyItn(params);
  if (!verified) {
    console.warn('[payfast:notify] unverified ITN', params.m_payment_id);
    return new Response('ok', { status: 200 });
  }

  if (params.payment_status === 'COMPLETE') {
    await logEvent({
      name: 'deposit_paid',
      applicant_id: null,
      application_id: null,
      anonymous_id: null,
      session_id: null,
      payload: {
        paymentId: params.m_payment_id ?? '',
        amount: params.amount_gross ?? '',
        courseId: params.custom_str1 ?? '',
        route: params.custom_str2 ?? '',
        pfPaymentId: params.pf_payment_id ?? '',
      },
    });

    if (env.ADMISSIONS_INBOX) {
      await sendEmail({
        to: env.ADMISSIONS_INBOX,
        subject: `Deposit PAID · ${params.email_address ?? ''} · R${params.amount_gross ?? ''}`,
        html: `<p>A deposit has been paid — secured seat.</p><ul><li>Name: ${params.name_first ?? ''} ${params.name_last ?? ''}</li><li>Email: ${params.email_address ?? ''}</li><li>Programme: ${params.custom_str1 ?? ''}</li><li>Amount: R${params.amount_gross ?? ''}</li><li>Payfast ref: ${params.pf_payment_id ?? ''}</li></ul>`,
      }).catch(() => {});
    }
  }

  return new Response('ok', { status: 200 });
}
