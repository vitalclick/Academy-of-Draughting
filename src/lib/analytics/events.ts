'use client';

const ANON_KEY = 'aoad_anon_id_v1';
const SESSION_KEY = 'aoad_session_id_v1';

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getOrCreate(storage: Storage, key: string): string {
  try {
    const existing = storage.getItem(key);
    if (existing) return existing;
    const value = uuid();
    storage.setItem(key, value);
    return value;
  } catch {
    return uuid();
  }
}

function ids() {
  if (typeof window === 'undefined') return { anonymousId: null, sessionId: null };
  return {
    anonymousId: getOrCreate(localStorage, ANON_KEY),
    sessionId: getOrCreate(sessionStorage, SESSION_KEY),
  };
}

/**
 * Fire-and-forget event recorder. Never throws.
 *
 * Stored to the `events` table server-side; also forwarded to gtag/fbq if
 * those scripts are loaded and the user has consented.
 */
export function track(name: string, payload?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  const { anonymousId, sessionId } = ids();
  try {
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, anonymousId, sessionId, payload }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // ignore
  }
  // GA4
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (w.gtag) w.gtag('event', name, payload ?? {});
  // Meta Pixel
  const w2 = window as unknown as { fbq?: (...args: unknown[]) => void };
  if (w2.fbq) w2.fbq('trackCustom', name, payload ?? {});
  // PostHog
  const w3 = window as unknown as { posthog?: { capture?: (n: string, p?: unknown) => void } };
  if (w3.posthog?.capture) w3.posthog.capture(name, payload ?? {});
}
