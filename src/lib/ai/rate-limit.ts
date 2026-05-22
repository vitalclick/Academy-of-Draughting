/**
 * In-memory token-bucket rate limiter keyed by IP.
 *
 * For production with multiple instances, swap for Upstash Ratelimit or a
 * Redis-backed bucket. For now this is fine: the bucket is per-process and
 * cheap, and abuse from a single IP gets shrugged off.
 */

type Bucket = { tokens: number; lastRefill: number };
const buckets = new Map<string, Bucket>();

export type RateLimitResult = { ok: boolean; remaining: number; retryAfter: number };

export function rateLimit(
  key: string,
  capacity = 30,
  refillPerMinute = 30
): RateLimitResult {
  const now = Date.now();
  const refillRate = refillPerMinute / 60_000; // tokens per ms
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { tokens: capacity, lastRefill: now };
    buckets.set(key, bucket);
  }

  const elapsed = now - bucket.lastRefill;
  bucket.tokens = Math.min(capacity, bucket.tokens + elapsed * refillRate);
  bucket.lastRefill = now;

  if (bucket.tokens < 1) {
    const retryAfter = Math.ceil((1 - bucket.tokens) / refillRate / 1000);
    return { ok: false, remaining: 0, retryAfter };
  }
  bucket.tokens -= 1;
  return { ok: true, remaining: Math.floor(bucket.tokens), retryAfter: 0 };
}

export function clientKey(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  const real = headers.get('x-real-ip');
  if (real) return real;
  return 'anon';
}
