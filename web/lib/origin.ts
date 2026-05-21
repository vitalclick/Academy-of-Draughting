import { env } from "@/lib/env";

export function isAllowedOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // same-origin requests don't always set Origin
  const allowed = new URL(env().NEXT_PUBLIC_SITE_URL).origin;
  try {
    return new URL(origin).origin === allowed;
  } catch {
    return false;
  }
}
