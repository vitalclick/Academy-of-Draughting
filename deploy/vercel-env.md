# Vercel environment variables

Paste these into **Vercel → Project → Settings → Environment Variables**.

**Scope** column: which Vercel environment each var applies to.
- `prod` = Production only
- `all` = Production + Preview + Development
- `staging` = Preview + Development (different value to prod)

For staging, point at a separate Supabase project so previews don't
mutate production data.

## Required for the site to function

| Variable | Scope | Source | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | prod | you | `https://academydraughting.com` |
| `NEXT_PUBLIC_SITE_URL` | staging | you | `https://<preview>.vercel.app` (or staging subdomain) |
| `NEXT_PUBLIC_SUPABASE_URL` | all | Supabase → Settings → API | `https://YOUR_PROJECT.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | all | Supabase → Settings → API | `eyJ…` (long JWT) |
| `SUPABASE_SERVICE_ROLE_KEY` | all | Supabase → Settings → API | **server-only — never put in a `NEXT_PUBLIC_*` slot** |
| `TRACKING_TOKEN_SECRET` | all | `openssl rand -base64 48` | rotate quarterly |
| `ADMIN_EMAILS` | all | you | comma-separated; remove after `admins` table is seeded |

## Required for AI features

| Variable | Scope | Source | Notes |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | all | Anthropic console | `sk-ant-…` |
| `ANTHROPIC_MODEL` | all | optional | defaults to `claude-sonnet-4-6` |
| `ANTHROPIC_OCR_MODEL` | all | optional | defaults to `claude-haiku-4-5-20251001` |

## Required for email

| Variable | Scope | Source | Notes |
|---|---|---|---|
| `RESEND_API_KEY` | all | Resend → API Keys | `re_…` |
| `RESEND_FROM` | all | you | `admissions@academydraughting.com` |
| `ADMISSIONS_INBOX` | prod | you | `enroll@academydraughting.com` — receives internal alerts |

## Optional — degrades to no-op when missing

| Variable | Scope | Source | Notes |
|---|---|---|---|
| `WHATSAPP_PHONE_ID` | prod | Meta WhatsApp Manager | numeric phone ID |
| `WHATSAPP_TOKEN` | prod | Meta → System Users | starts with `EAAJ…` |
| `WHATSAPP_TEMPLATE_NAME` | prod | you | `application_received` |
| `HUBSPOT_PRIVATE_APP_TOKEN` | prod | HubSpot → Private Apps | `pat-na1-…` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | prod | GA4 Admin | `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_META_PIXEL_ID` | prod | Meta Events Manager | numeric pixel ID |
| `ERROR_SINK_URL` | all | Sentry DSN / Slack webhook / etc. | observability sink |
| `ERROR_SINK_TOKEN` | all | optional | bearer token for the sink |
| `DOC_RETENTION_DAYS` | prod | you | defaults to 90, POPIA Section 14 |

## Sanity checks after setting

1. Trigger a redeploy (Vercel auto-deploys on env var save).
2. Hit `https://YOUR_DOMAIN/api/health?check=ready` — every feature flag
   should be `true` except the ones you intentionally left empty.
   Supabase `checks.supabase.ok` must be `true`, not `not_configured`.
3. Run `bash deploy/smoke-test.sh https://YOUR_DOMAIN` for the full pass.
