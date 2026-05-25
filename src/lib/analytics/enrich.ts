import 'server-only';

export type Device = 'mobile' | 'tablet' | 'desktop';

export function deviceFromUserAgent(ua: string | null): Device {
  if (!ua) return 'desktop';
  if (/ipad|tablet|playbook|silk|(android(?!.*mobi))/i.test(ua)) return 'tablet';
  if (/mobi|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua)) return 'mobile';
  return 'desktop';
}

/** Buckets a referrer URL into a coarse acquisition channel. */
export function sourceFromReferrer(referrer: string | null | undefined, selfHost: string): string {
  if (!referrer) return 'Direct';
  let host: string;
  try {
    host = new URL(referrer).host.toLowerCase();
  } catch {
    return 'Direct';
  }
  if (!host || host === selfHost) return 'Direct';
  if (/(google|bing|duckduckgo|yahoo|ecosia|baidu|yandex)\./.test(host)) return 'Organic search';
  if (/(facebook|fb\.|instagram|t\.co|twitter|x\.com|linkedin|tiktok|youtube|pinterest|whatsapp)\./.test(host))
    return 'Social';
  return 'Referral';
}

/** Two-letter ISO country code from edge/CDN geo headers, or null. */
export function countryFromHeaders(headers: Headers): string | null {
  const code =
    headers.get('x-vercel-ip-country') ||
    headers.get('cf-ipcountry') ||
    headers.get('x-country-code');
  if (!code) return null;
  const upper = code.toUpperCase();
  return /^[A-Z]{2}$/.test(upper) ? upper : null;
}

/**
 * Derives the analytics dimensions for an incoming event from the request
 * headers and the client-supplied referrer. Stored alongside the event so the
 * dashboard can aggregate device, source and geography.
 */
export function deriveDimensions(
  headers: Headers,
  referrer: string | null | undefined,
  selfHost: string
): { device: Device; source: string; country: string | null } {
  return {
    device: deviceFromUserAgent(headers.get('user-agent')),
    source: sourceFromReferrer(referrer, selfHost),
    country: countryFromHeaders(headers),
  };
}
