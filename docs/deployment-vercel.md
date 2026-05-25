# Vercel Deployment

## One-time setup

1. Create a new Vercel project and link it to this repo (`vitalclick/academy-of-draughting`).
2. Framework preset is auto-detected (Next.js). Leave build / install / output settings on default — `vercel.json` pins them explicitly.
3. Set the production branch to `main`.
4. Region is pinned to `cpt1` (Cape Town) in `vercel.json`. Change there if you want to move it.

## Environment variables

Copy these into Vercel → Project → Settings → Environment Variables. All are required unless marked optional. Use the values from `.env.example` as the format reference.

### Public (exposed to the browser — `NEXT_PUBLIC_*`)

| Variable | Notes |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://academydraughting.com` in production, the preview URL otherwise. |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL from Supabase. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key from Supabase. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional. Only loaded after cookie consent. |
| `NEXT_PUBLIC_META_PIXEL_ID` | Optional. Only loaded after cookie consent. |

### Server-only

| Variable | Notes |
| --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key — never expose. |
| `RESEND_API_KEY` | Resend API key. |
| `RESEND_FROM` | Verified sender, e.g. `admissions@academydraughting.com`. |
| `ADMISSIONS_INBOX` | Internal alerts inbox. |
| `WHATSAPP_PHONE_ID` | Meta WhatsApp Business phone number ID. |
| `WHATSAPP_TOKEN` | Meta Graph API token. |
| `WHATSAPP_TEMPLATE_NAME` | Template name, e.g. `application_received`. |
| `ANTHROPIC_API_KEY` | Powers AIDA chat, recommender, OCR. |
| `ANTHROPIC_MODEL` | Default chat / recommender model. |
| `ANTHROPIC_OCR_MODEL` | OCR-specific model. |
| `HUBSPOT_PRIVATE_APP_TOKEN` | HubSpot CRM token. |
| `TRACKING_TOKEN_SECRET` | ≥32 random bytes. Generate with `openssl rand -base64 48`. |
| `ADMIN_EMAILS` | Comma-separated bootstrap admin list. |
| `ERROR_SINK_URL` | Optional. Observability webhook. |
| `ERROR_SINK_TOKEN` | Optional. Bearer token for the sink. |
| `DOC_RETENTION_DAYS` | Optional. Defaults to `90`. |
| `CRON_SECRET` | Authenticates the Vercel Cron retention purge. `openssl rand -hex 32`. |

### Per-environment overrides

- **Production:** `NEXT_PUBLIC_SITE_URL=https://academydraughting.com`.
- **Preview:** leave `NEXT_PUBLIC_SITE_URL` unset and Vercel will use `VERCEL_URL`, or set it per-preview if you need a stable value.
- **Development:** copy `.env.example` to `.env.local`.

## Function configuration

`vercel.json` sets per-route timeouts and memory for the AI-heavy endpoints:

- `/api/chat` — 60s (streaming Claude responses).
- `/api/applications/ocr` — 60s, 1024 MB (image upload + Claude vision).
- `/api/applications/documents` — 30s, 1024 MB.
- `/api/recommend` — 30s.
- `/api/leads`, `/api/data-rights` — 15s.
- `/api/events` — 10s.
- `/api/health` — 5s.
- `/api/cron/purge-documents` — 60s (scheduled).

All API routes run on the Node.js runtime (`export const runtime = 'nodejs'`). There are no Edge-runtime routes or Supabase Edge Functions.

## Scheduled jobs (Vercel Cron)

`vercel.json` registers one cron:

- **`/api/cron/purge-documents`** — daily at 03:00 UTC. Calls the
  `purge_old_documents()` Postgres function to delete applicant ID/matric
  images older than `DOC_RETENTION_DAYS` (POPIA Section 14).

Requirements:

1. `CRON_SECRET` must be set in the environment. Vercel automatically attaches
   it as `Authorization: Bearer <CRON_SECRET>` on scheduled invocations; the
   route rejects anything else with 401, so the endpoint isn't publicly
   triggerable. Generate with `openssl rand -hex 32`.
2. The `0004_retention.sql` migration must be applied (it defines
   `purge_old_documents`).
3. Cron jobs only run on the **production** deployment.

Manual test (replace the secret):

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://academydraughting.com/api/cron/purge-documents
# -> { "ok": true, "removed": 0, "retention_days": 90, ... }
```

## Domains

1. Add `academydraughting.com` and `www.academydraughting.com` in Vercel → Domains.
2. Set the apex as primary and 308-redirect `www` to apex (or vice versa).
3. Update DNS at the registrar to point at Vercel's nameservers or set the A / CNAME records Vercel shows.

## Post-deploy checklist

- [ ] `/api/health` returns 200.
- [ ] Submit a test lead → row appears in Supabase `leads` and HubSpot.
- [ ] Trigger AIDA chat → response streams.
- [ ] Upload a sample ID to `/apply` → OCR returns parsed JSON.
- [ ] Confirmation email arrives from Resend.
- [ ] CSP headers present (`curl -I https://academydraughting.com`).
- [ ] `robots.txt` and `sitemap.xml` resolve.
