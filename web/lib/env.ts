import { z } from "zod";

// Empty strings in .env.local should behave like "unset" rather than "invalid".
const optStr = z
  .string()
  .transform((s) => (s.trim() === "" ? undefined : s))
  .optional();
const optUrl = optStr.refine((v) => v === undefined || /^https?:\/\//.test(v), {
  message: "must be a valid URL",
});
const optEmail = optStr.refine(
  (v) => v === undefined || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v),
  { message: "must be a valid email" }
);

const schema = z.object({
  // Required for any AIDA call
  ANTHROPIC_API_KEY: optStr,

  // Supabase — server-only service role
  SUPABASE_URL: optUrl,
  SUPABASE_SERVICE_ROLE_KEY: optStr,

  // Supabase — public, used by browser + SSR auth
  NEXT_PUBLIC_SUPABASE_URL: optUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optStr,

  // App
  NEXT_PUBLIC_SITE_URL: optUrl.transform((v) => v ?? "http://localhost:3000"),

  // Pass B — optional integrations (no-op if unset)
  UPSTASH_REDIS_REST_URL: optUrl,
  UPSTASH_REDIS_REST_TOKEN: optStr,
  RESEND_API_KEY: optStr,
  RESEND_FROM_EMAIL: optEmail.transform((v) => v ?? "admissions@aod.local"),
  ADMISSIONS_NOTIFY_EMAIL: optEmail,
  MINDEE_API_KEY: optStr,

  // Pass I — error reporting, anti-bot, webhook verification (all optional)
  SENTRY_DSN: optStr,
  NEXT_PUBLIC_SENTRY_DSN: optStr,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: optStr,
  TURNSTILE_SECRET_KEY: optStr,
  RESEND_WEBHOOK_SECRET: optStr,

  // Privacy-friendly analytics (cookieless). When unset, the script is not
  // injected and no requests leave the browser.
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: optStr,

  // Antivirus: VirusTotal hash-lookup. When unset, uploads are marked
  // 'skipped' rather than scanned.
  VIRUSTOTAL_API_KEY: optStr,
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}

export function hasSupabasePublic(e = env()): e is Env & {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
} {
  return Boolean(e.NEXT_PUBLIC_SUPABASE_URL && e.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function hasSupabaseAdmin(e = env()): e is Env & {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
} {
  return Boolean(e.SUPABASE_URL && e.SUPABASE_SERVICE_ROLE_KEY);
}
