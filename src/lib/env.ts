import { z } from 'zod';

/**
 * Server-side environment variables.
 *
 * Required for full functionality, but the app gracefully degrades when they're
 * missing: applications fall back to a local-filesystem store in development,
 * emails log to the console, WhatsApp/HubSpot calls become no-ops.
 *
 * This means CI passes without secrets and a contributor can run the site end-
 * to-end locally before any external services are wired up.
 */
const ServerEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // Resend transactional email
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM: z.string().email().optional(),
  ADMISSIONS_INBOX: z.string().email().optional(),

  // WhatsApp Business Cloud API
  WHATSAPP_PHONE_ID: z.string().optional(),
  WHATSAPP_TOKEN: z.string().optional(),
  WHATSAPP_TEMPLATE_NAME: z.string().optional(),

  // Anthropic (Claude) — chatbot, recommender rationale, OCR
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default('claude-sonnet-4-6'),
  ANTHROPIC_OCR_MODEL: z.string().default('claude-haiku-4-5-20251001'),

  // HubSpot CRM
  HUBSPOT_PRIVATE_APP_TOKEN: z.string().optional(),

  // Payfast — online deposit payments (South African gateway)
  PAYFAST_MERCHANT_ID: z.string().optional(),
  PAYFAST_MERCHANT_KEY: z.string().optional(),
  PAYFAST_PASSPHRASE: z.string().optional(),
  PAYFAST_SANDBOX: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),

  // Tracking-link JWT signing secret
  TRACKING_TOKEN_SECRET: z.string().optional(),

  // Comma-separated allowlist of admin emails. First-time bootstrap before
  // the admins table is populated. Empty in production once admins are seeded.
  ADMIN_EMAILS: z.string().optional(),

  // Public analytics
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_META_PIXEL_ID: z.string().optional(),
  // Meta Conversions API — server-side, privacy-resilient conversion tracking
  META_CAPI_ACCESS_TOKEN: z.string().optional(),
  // PostHog — product analytics, funnels, session replay (POPIA-friendly self-host)
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),

  // Error sink — receives POST {level,message,context} on captureError().
  // Supports any HTTPS webhook (Sentry, Slack, Discord, custom).
  ERROR_SINK_URL: z.string().url().optional(),
  ERROR_SINK_TOKEN: z.string().optional(),

  // Document retention — overrideable for testing
  DOC_RETENTION_DAYS: z.coerce.number().int().positive().default(90),

  // Shared secret for authenticating Vercel Cron invocations. Vercel sends it
  // as `Authorization: Bearer <CRON_SECRET>` on scheduled requests.
  CRON_SECRET: z.string().optional(),
});

export const env = ServerEnvSchema.parse(process.env);

export const isProduction = env.NODE_ENV === 'production';

/** Feature flags derived from which env vars are present. */
export const features = {
  supabase: Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL &&
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      env.SUPABASE_SERVICE_ROLE_KEY
  ),
  resend: Boolean(env.RESEND_API_KEY && env.RESEND_FROM),
  whatsapp: Boolean(env.WHATSAPP_PHONE_ID && env.WHATSAPP_TOKEN),
  hubspot: Boolean(env.HUBSPOT_PRIVATE_APP_TOKEN),
  payments: Boolean(env.PAYFAST_MERCHANT_ID && env.PAYFAST_MERCHANT_KEY),
  ai: Boolean(env.ANTHROPIC_API_KEY),
  trackingTokens: Boolean(env.TRACKING_TOKEN_SECRET),
  analytics: Boolean(env.NEXT_PUBLIC_GA_MEASUREMENT_ID || env.NEXT_PUBLIC_META_PIXEL_ID),
  metaCapi: Boolean(env.NEXT_PUBLIC_META_PIXEL_ID && env.META_CAPI_ACCESS_TOKEN),
  posthog: Boolean(env.NEXT_PUBLIC_POSTHOG_KEY),
  errorSink: Boolean(env.ERROR_SINK_URL),
};

export function publicSiteUrl() {
  return env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}
