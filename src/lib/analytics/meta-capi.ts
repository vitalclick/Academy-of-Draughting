import 'server-only';
import crypto from 'node:crypto';
import { env, features } from '@/lib/env';

/**
 * Meta Conversions API (server-side).
 *
 * Mirrors key browser-pixel events from the server so conversions still land
 * when the client pixel is blocked (ad-blockers, iOS ITP, no-consent). PII is
 * SHA-256 hashed per Meta's spec. No-op when the pixel id / CAPI token are
 * missing.
 */

const sha256 = (v: string) => crypto.createHash('sha256').update(v.trim().toLowerCase()).digest('hex');

export async function sendMetaEvent(args: {
  eventName: 'Lead' | 'Purchase' | 'CompleteRegistration' | 'Schedule';
  email?: string;
  phone?: string;
  value?: number;
  currency?: string;
  eventId?: string;
  sourceUrl?: string;
}): Promise<{ mocked: boolean }> {
  if (!features.metaCapi) {
    console.info(`[meta-capi:mock] ${args.eventName}`);
    return { mocked: true };
  }

  const userData: Record<string, string[]> = {};
  if (args.email) userData.em = [sha256(args.email)];
  if (args.phone) userData.ph = [sha256(args.phone.replace(/[^\d]/g, ''))];

  const body = {
    data: [
      {
        event_name: args.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: args.eventId,
        action_source: 'website',
        event_source_url: args.sourceUrl,
        user_data: userData,
        custom_data:
          args.value != null
            ? { value: args.value, currency: args.currency ?? 'ZAR' }
            : undefined,
      },
    ],
  };

  try {
    const url = `https://graph.facebook.com/v20.0/${env.NEXT_PUBLIC_META_PIXEL_ID}/events?access_token=${env.META_CAPI_ACCESS_TOKEN}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.warn('[meta-capi] non-200', res.status, (await res.text()).slice(0, 200));
    }
  } catch (err) {
    console.warn('[meta-capi] failed', err);
  }
  return { mocked: false };
}
