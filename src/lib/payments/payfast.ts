import 'server-only';
import crypto from 'node:crypto';
import { env, features, publicSiteUrl } from '@/lib/env';

/**
 * Payfast integration (South African payment gateway).
 *
 * Used for the refundable enrolment deposit that secures a seat — the highest-
 * intent action a prospect can take. No-op-safe: when PAYFAST_* env vars are
 * missing, {@link buildDepositCheckout} returns a mock action that routes
 * straight to the success page so the flow is demoable in development.
 *
 * Signature scheme follows Payfast's spec: an ordered, PHP-style urlencoded
 * parameter string with the passphrase appended, hashed with MD5.
 */

const PROCESS_HOST = () =>
  env.PAYFAST_SANDBOX ? 'https://sandbox.payfast.co.za' : 'https://www.payfast.co.za';

/** PHP urlencode-compatible encoding (spaces become `+`, hex uppercased). */
function pfEncode(value: string): string {
  return encodeURIComponent(value.trim()).replace(/%20/g, '+').replace(/[!'()*]/g, (c) =>
    '%' + c.charCodeAt(0).toString(16).toUpperCase()
  );
}

/**
 * Builds the signature over an ordered set of fields. Empty values and the
 * signature field itself are excluded; the passphrase is appended when set.
 */
export function signFields(fields: Record<string, string>): string {
  const parts = Object.entries(fields)
    .filter(([k, v]) => k !== 'signature' && v !== '' && v != null)
    .map(([k, v]) => `${k}=${pfEncode(String(v))}`);
  if (env.PAYFAST_PASSPHRASE) {
    parts.push(`passphrase=${pfEncode(env.PAYFAST_PASSPHRASE)}`);
  }
  return crypto.createHash('md5').update(parts.join('&')).digest('hex');
}

export type DepositCheckout = {
  /** Form action URL to POST the fields to. */
  action: string;
  /** Hidden form fields, including the computed signature. */
  fields: Record<string, string>;
  mocked: boolean;
};

export function buildDepositCheckout(args: {
  amount: number;
  itemName: string;
  paymentId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  custom?: Record<string, string>;
}): DepositCheckout {
  const base = publicSiteUrl();

  if (!features.payments) {
    // Dev/preview mock: skip the gateway, land on the success page directly.
    return {
      action: `${base}/funding/deposit/success?mock=1&ref=${encodeURIComponent(args.paymentId)}`,
      fields: {},
      mocked: true,
    };
  }

  const fields: Record<string, string> = {
    merchant_id: env.PAYFAST_MERCHANT_ID!,
    merchant_key: env.PAYFAST_MERCHANT_KEY!,
    return_url: `${base}/funding/deposit/success?ref=${encodeURIComponent(args.paymentId)}`,
    cancel_url: `${base}/funding/deposit/cancel?ref=${encodeURIComponent(args.paymentId)}`,
    notify_url: `${base}/api/payments/payfast/notify`,
    name_first: args.firstName ?? '',
    name_last: args.lastName ?? '',
    email_address: args.email ?? '',
    m_payment_id: args.paymentId,
    amount: args.amount.toFixed(2),
    item_name: args.itemName,
    ...(args.custom ?? {}),
  };

  fields.signature = signFields(fields);
  return { action: `${PROCESS_HOST()}/eng/process`, fields, mocked: false };
}

/**
 * Verifies an ITN (Instant Transaction Notification) callback:
 *  1. signature matches the posted data
 *  2. Payfast confirms the data server-side (skipped in sandbox-less mock mode)
 */
export async function verifyItn(params: Record<string, string>): Promise<boolean> {
  if (!features.payments) return false;

  const received = params.signature;
  const computed = signFields(params);
  if (!received || received !== computed) return false;

  // Server confirmation: post the raw data back to Payfast.
  const body = Object.entries(params)
    .filter(([k]) => k !== 'signature')
    .map(([k, v]) => `${k}=${pfEncode(String(v))}`)
    .join('&');

  try {
    const res = await fetch(`${PROCESS_HOST()}/eng/query/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const text = (await res.text()).trim();
    return text === 'VALID';
  } catch {
    return false;
  }
}
