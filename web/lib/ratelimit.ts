import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

type Limiter = { limit: (key: string) => Promise<{ success: boolean; remaining: number; reset: number }> };

const noop: Limiter = {
  limit: async () => ({ success: true, remaining: 999, reset: 0 }),
};

const cache = new Map<string, Limiter>();

function build(name: string, limit: number, windowSec: number): Limiter {
  const cached = cache.get(name);
  if (cached) return cached;
  const e = env();
  if (!e.UPSTASH_REDIS_REST_URL || !e.UPSTASH_REDIS_REST_TOKEN) {
    cache.set(name, noop);
    return noop;
  }
  const redis = new Redis({
    url: e.UPSTASH_REDIS_REST_URL,
    token: e.UPSTASH_REDIS_REST_TOKEN,
  });
  const limiter: Limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
    prefix: `aod:${name}`,
    analytics: false,
  });
  cache.set(name, limiter);
  return limiter;
}

// Tunables in one place.
export const aidaLimiter = () => build("aida", 12, 60); // 12 req / minute / ip
export const applyLimiter = () => build("apply", 4, 600); // 4 submits / 10 min / ip
export const uploadLimiter = () => build("upload", 30, 600); // 30 uploads / 10 min / user
export const submissionLimiter = () => build("submission", 30, 600); // 30 submissions / 10 min / user
export const gradeLimiter = () => build("grade", 120, 600); // 120 grades / 10 min / admin

export function ipFromRequest(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "anon";
}
