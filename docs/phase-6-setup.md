# Phase 6 — Hardening + launch

This phase doesn't add user-facing features. It tightens what's already there
so the site can take real production traffic.

## What landed

### Security headers
Set in `next.config.mjs`:
- **Content-Security-Policy** — `default-src 'self'`; narrow holes for the
  exact integrations we use (Anthropic, Resend, HubSpot, WhatsApp,
  Supabase, GA4, Meta Pixel). No `unsafe-inline` in `script-src`.
- **X-Frame-Options** — `DENY`. Blocks clickjacking.
- **X-Content-Type-Options** — `nosniff`.
- **Referrer-Policy** — `strict-origin-when-cross-origin`.
- **Permissions-Policy** — disables camera, microphone, geolocation,
  FLoC/topics cohort.
- **Strict-Transport-Security** — `max-age=63072000; includeSubDomains;
  preload`. Two years.
- **X-Robots-Tag** — `noindex, nofollow` on every `/admin/**` response.

### Health checks
- `GET /api/health` — liveness probe. Returns `200` with feature flags.
- `GET /api/health?check=ready` — readiness probe. Pings Supabase. Returns
  `503` if a dependency is down so uptime monitors trigger.

### POPIA data-rights
- Public page `/data-rights` lets anyone request either an access export or
  full deletion of their personal data.
- `POST /api/data-rights` validates the request and emails a magic-link
  confirmation to the address on record. **Always returns `200`** to avoid
  leaking whether an email exists in our database.
- `/data-rights/confirm?token=…` verifies a 48-hour JWT and either renders
  the full export inline (with a JSON download) or anonymises the record.
- Deletion anonymises the `applicants` row (keeps aggregate stats) and
  relies on the scheduled document-purge job for the underlying images.
- Both actions log `data_rights_requested` and `data_rights_executed`
  events for the audit trail.

### Document retention
- `supabase/migrations/0004_retention.sql` adds
  `public.purge_old_documents(retention_days)`.
- Deletes `documents` rows + the underlying storage objects for files older
  than the retention window whose application is decided (accepted /
  rejected / withdrawn) or whose application is itself stale.
- Schedule via Supabase pg_cron:
  ```sql
  select cron.schedule(
    'purge-old-documents',
    '0 3 * * *',
    $$ select public.purge_old_documents(90) $$
  );
  ```

### Error boundaries
- `src/app/error.tsx` — branded recovery UI for any route under the root
  layout. Posts a `client_error` event to `/api/events` for correlation.
- `src/app/global-error.tsx` — catastrophic fallback when the root layout
  itself throws.

### Observability
- `src/lib/observability.ts` exposes `captureError(message, err, context)`
  and `captureWarn(message, context)`. Posts to `ERROR_SINK_URL` if set
  (Sentry DSN, Slack webhook, Discord webhook, any HTTP sink); always
  console-logs.
- Wired into `submitApplicationAction` first; extend as needed.

### Route-aware overlays
- `AidaWidget`, `ExitIntent`, and `CookieBanner` now hide on `/admin/**`
  and `/data-rights/confirm`. `ExitIntent` also stays out of `/apply` so
  it doesn't compete with the form mid-submission.

## Pre-launch checklist

### Domain + DNS
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the production URL (e.g.
      `https://academydraughting.com`).
- [ ] Configure the production domain in Vercel (or your host).
- [ ] DNS A/AAAA → host's IP, CNAME `www` → apex.
- [ ] HTTPS certificate provisioned (Vercel auto-issues; otherwise
      Let's Encrypt).
- [ ] Verify HSTS doesn't lock out staging — staging should be on a
      separate hostname.

### Supabase
- [ ] Migrations applied in order: 0001, 0002, 0003, 0004.
- [ ] RLS confirmed enabled on `applicants`, `applications`, `documents`,
      `events`, `content_blocks`, `admins` (`select pg_class.relname,
      relrowsecurity from pg_class join pg_namespace on … where … ;`).
- [ ] First admin seeded (via `ADMIN_EMAILS` allowlist or direct insert).
      Test sign-in to `/admin` end-to-end.
- [ ] Storage bucket `applicant-documents` exists and is **private**.
- [ ] pg_cron enabled and `purge-old-documents` scheduled.
- [ ] Backups: confirm daily backup is running in Supabase Project
      Settings → Backups. Test a restore on a staging project.

### Integrations
- [ ] Resend domain verified; test the apply confirmation email reaches an
      inbox (not spam).
- [ ] WhatsApp Business template `application_received` approved by Meta.
      Send a test message.
- [ ] HubSpot Private App scopes confirmed
      (`crm.objects.contacts.read/write`); test a submit creates the
      contact with custom properties set.
- [ ] Anthropic key set and a chat round-trip works; recommender rationale
      generates.

### Secrets + rotation
- [ ] `TRACKING_TOKEN_SECRET` set to a 48+ byte random value
      (`openssl rand -base64 48`). The same secret signs both
      `apply/status/[token]` and the data-rights confirmation token —
      rotating it invalidates both.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` only set in server env, never in any
      `NEXT_PUBLIC_*` slot. (Build will fail at import time if leaked
      because of `import 'server-only'`.)
- [ ] Rotate keys at least quarterly. Document the rotation playbook with
      ops.

### Observability
- [ ] `ERROR_SINK_URL` set (Sentry DSN, Slack webhook, or custom).
- [ ] Uptime monitor pointed at `/api/health?check=ready` with a 30s
      interval and a 503-alert rule.
- [ ] Set up an alert on the `events` table for `application_status_changed`
      transitions to `rejected` going above baseline (helps catch a buggy
      admin script).

### Performance + accessibility
- [ ] Run Lighthouse on `/`, `/courses`, `/courses/mddop`, `/apply`,
      `/career/quiz`, `/blog` — expect ≥95 mobile, ≥98 desktop.
- [ ] Run axe-core or Lighthouse a11y on the same routes — fix any
      critical/serious issues.
- [ ] Confirm keyboard navigation reaches every CTA (skip link first, then
      nav, then content).
- [ ] Confirm dark/light contrast on the dim text (`var(--ink-3)`,
      `var(--ink-4)`) at WCAG AA against its background.

### Content + legal
- [ ] Real `public/downloads/sa-draughting-careers-2026.pdf` lead magnet
      in place (currently 404s).
- [ ] Privacy, Terms, POPIA pages reviewed by legal counsel.
- [ ] Data Processing Agreements signed with Supabase, Resend, Anthropic,
      Meta WhatsApp, HubSpot.
- [ ] Information Officer email in `/popia` matches the actual designated
      Officer.

### SEO + AI discoverability
- [ ] `sitemap.xml` submitted to Google Search Console + Bing Webmaster.
- [ ] OG image (`opengraph-image.png` in `app/`) commissioned and dropped
      in. Currently no OG image — social embeds will use the title only.
- [ ] Confirm rich results: paste the canonical home + a course detail URL
      into Google Rich Results Test.
- [ ] `robots.txt` confirms `/admin` and `/api` are not crawled.

### Final smoke test (production)
- [ ] Apply form end-to-end: submit a real application, receive both the
      applicant email and the admissions alert, see the row in
      `applications` with status `submitted`, hit the tracking link.
- [ ] Recommender: 4 questions → top match + Claude rationale.
- [ ] AIDA chatbot: start with a starter chip, exercise a tool use
      (e.g. "tell me about MDDOP"), confirm tool effect renders a CTA.
- [ ] Admin: sign in, change an application status, see the public
      tracking page update.
- [ ] Content Studio: AI-generate a blog draft, publish, confirm the post
      shows at `/blog/<slug>` and is in `sitemap.xml`.
- [ ] Data rights: request access on a real applicant; click the magic
      link; confirm the export JSON is correct; request deletion and
      confirm the row is anonymised.

## Post-launch runbook

### Daily
- Glance at `/admin` overview. Look for: spike in `rejected` status,
  drop-off in `application_submitted` events, content drafts stuck in
  `review`.

### Weekly
- Eyeball Supabase storage usage. Documents older than 90 days should be
  shrinking due to the cron job.
- Skim `events` for new `client_error` / `global_error` rows; reproduce
  and patch.

### Monthly
- Lighthouse + a11y audit on the top 6 routes. File any regressions.
- Rotate the Resend / WhatsApp / HubSpot keys per the org's policy.
- Review the `admins` table — remove any staff who have left.
- Confirm backups still running (Supabase email or dashboard).

### When something breaks
1. Check `/api/health?check=ready` from your laptop. A 503 narrows it to
   Supabase or app process.
2. If Supabase is the issue, check Supabase Project → Logs.
3. Otherwise, check Vercel logs (or your host).
4. If the chatbot is down: the API route handles `429` and `503` from
   Anthropic gracefully — set `force` on the AI feature flag or drop the
   key temporarily to force the scripted fallback.
5. For payments / fees questions, point the visitor at WhatsApp from the
   footer — there's always a human path.

## Known follow-ups
- Replace the in-memory rate limiter with Upstash Ratelimit if running >1
  region or instance.
- Add real OG images per route (currently relies on title only).
- Add an admin-side "Run purge now" button that calls
  `purge_old_documents` directly — useful for testing the cron job.
- Lighthouse-test with cold cache from Cape Town / Johannesburg — likely
  fine on Vercel edge but worth measuring.
