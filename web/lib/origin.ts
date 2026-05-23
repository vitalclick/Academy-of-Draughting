import { env } from "@/lib/env";

// Verifies the request originated from our own site. Used as a lightweight
// CSRF defence on state-changing API routes, complementing SameSite cookies.
//
// Rules:
//   - GET/HEAD/OPTIONS: always allowed (read-only).
//   - For mutating methods, either Origin or Referer MUST be present and
//     match NEXT_PUBLIC_SITE_URL's origin. Missing both => reject (this
//     previously fell open, allowing curl + some embedded webviews to bypass).
export function isAllowedOrigin(req: Request): boolean {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return true;

  const expected = (() => {
    try {
      return new URL(env().NEXT_PUBLIC_SITE_URL).origin;
    } catch {
      return null;
    }
  })();
  if (!expected) return false;

  const origin = req.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).origin === expected;
    } catch {
      return false;
    }
  }
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).origin === expected;
    } catch {
      return false;
    }
  }
  return false;
}
