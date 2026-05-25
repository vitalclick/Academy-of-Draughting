# Academy of Advanced Draughting — Web

Next.js 14 (App Router) + TypeScript + Tailwind + Supabase + Anthropic + Resend + Mindee + Upstash + Sentry + Cloudflare Turnstile.

## Quickstart

```bash
cd web
npm install
cp .env.example .env.local      # fill keys (see Env section)
# Apply all migrations against your Supabase project — either via SQL editor
# in the dashboard, or via psql:
#   for f in supabase/migrations/0*.sql; do psql "$SUPABASE_DB_URL" < "$f"; done
npm run dev
```

Open http://localhost:3000.

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript strict |
| Styling | Tailwind + design tokens in `tailwind.config.ts` |
| Auth | Supabase Auth (magic link + password), session cookies refreshed in `middleware.ts` |
| Database | Supabase Postgres with RLS, plus realtime publication on `submissions` |
| AI chat | Anthropic SDK (`claude-sonnet-4-6`) — admissions + assignment tutor |
| Email | Resend (transactional + webhook for bounce/complaint tracking) |
| OCR | Mindee (swappable with Document AI / Textract) |
| Rate limiting | Upstash Redis + `@upstash/ratelimit` |
| Error reporting | `@sentry/nextjs` (no-op without DSN) |
| Anti-bot | Cloudflare Turnstile (hides if site key unset) |
| Validation | zod (request bodies + env) |
| E2E | Playwright |

All optional integrations (Upstash, Resend, Mindee, Sentry, Turnstile) no-op gracefully if their env vars are unset, so local development is friction-free.

## Routes

### Public
- `/`, `/about`, `/courses`, `/apply` — marketing + admissions
- `/privacy`, `/terms` — POPIA + legal
- `/login`, `/auth/callback`, `/auth/signout` — auth
- `GET /api/health` — uptime probe (200/503 + per-integration status)

### Authenticated
- `/portal` — student dashboard: enrollments, modules, assignments, submissions, AIDA tutor, progress + cohort rank, "Your data" export/delete
- `GET /api/me/export` — POPIA right of access (JSON download)
- `POST /api/me/delete-request` — POPIA right of erasure

### Admin / faculty (faculty allowed on curriculum + grading only)
- `/admin` — overview with 4-card summary
- `/admin/applications/[id]` — application detail + status + link-to-user
- `/admin/cohorts`, `/admin/cohorts/[slug]` — enrollments + grading matrix
- `/admin/curriculum`, `/admin/curriculum/[slug]` — modules + assignments editor
- `/admin/grading` — global grading queue with realtime LIVE indicator
- `/admin/audit` — append-only audit log

### API
- `POST /api/aida` — Claude chat. Optional `assignmentId` for tutor mode.
- `POST /api/apply` — public form submission. Verifies Turnstile if configured.
- `POST /api/apply-upload` — anonymous document upload during apply (token-gated, 24h).
- `POST /api/upload` — authenticated document upload.
- `POST /api/ocr` — Mindee OCR on a stored doc.
- `POST /api/submissions` — student submits work for an assignment.
- `POST /api/admin/grade` — admin/faculty grade a submission.
- `GET  /api/admin/file?bucket=…&path=…` — 5-min signed URL redirect for staff preview.
- `POST /api/webhooks/resend` — Svix-signed delivery events → `email_deliveries`.

## Auth model

- Supabase Auth handles users.
- A `profiles` row is auto-created on signup via the `on_auth_user_created` trigger.
- `profiles.role` is one of `student` / `admin` / `faculty`.
- `middleware.ts` redirects unauthenticated visitors to `/login` for `/portal` and `/admin`. Within `/admin`, faculty are allowed on `/admin/curriculum` and `/admin/grading`; everything else is admin-only.
- Sign in flow: magic link by default; password fallback toggled with "Use a password instead".
- Promote a user to admin (or faculty):
  ```sql
  update public.profiles set role = 'admin' where email = 'you@example.com';
  ```

## RLS summary

- `applications` — owner-read, admin-read/update, owner via user_id; service-role inserts.
- `profiles` — self-read/update, admin/faculty read.
- `application_documents` — owner-read, admin-read.
- `modules`, `assignments` — admin/faculty CRUD; students read only if they have an active enrollment in the course.
- `enrollments` — self-read, admin write, faculty read.
- `submissions` — owner read/insert/update **with hard guardrails: score, feedback, graded_at must stay null on owner updates**. Admin/faculty read all and update grades.
- `data_deletion_requests` — self insert + read, admin read + update.
- `audit_log`, `email_deliveries` — admin read only; service-role writes.
- Helper functions: `current_user_role()`, `is_enrolled(course)`, `is_admin_or_faculty()`, `cohort_progress(course)`.

## Cohort timing

A student's effective due date is computed at read time as `enrollment.starts_on + assignment.due_offset_days`. If either is null, fall back to `assignment.due_at` (absolute). Same pattern for `release_offset_days`. This lets one set of modules serve multiple intakes without cloning.

## Rate limits (`lib/ratelimit.ts`)

| Route | Limit |
|---|---|
| `/api/aida` (chat) | 12 / min / IP — or per-user in tutor mode |
| `/api/apply` | 4 / 10 min / IP |
| `/api/upload`, `/api/apply-upload` | 30 / 10 min / user |
| `/api/submissions` | 30 / 10 min / user |
| `/api/admin/grade` | 120 / 10 min / admin |

If `UPSTASH_REDIS_REST_URL` is unset, the limiter is a no-op.

## Security posture

- **Security headers** in `next.config.js`: HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy, and a CSP that allows `self`, Supabase REST/WS, Turnstile, and Sentry ingest.
- **Origin check** (`lib/origin.ts`): mutating requests must carry a matching Origin or Referer. Read-only methods (`GET`/`HEAD`/`OPTIONS`) bypass.
- **CSRF**: rely on the Origin check above + SameSite=Lax session cookies.
- **CAPTCHA**: Cloudflare Turnstile on `/apply` if `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set.
- **Audit log**: every admin/faculty mutation (status change, link, enroll, grade) writes a row.
- **Storage**: private buckets `application-documents` and `submissions`. Owner-only path prefixes for direct browser access; admin/faculty preview via the server-side `/api/admin/file` redirect.

## Env

See `.env.example`. Required:

- `ANTHROPIC_API_KEY` — AIDA chat
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — service-role writes, signed URLs
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` — auth + SSR
- `NEXT_PUBLIC_SITE_URL` — origin check, metadataBase, email links

Optional (no-op when unset):

- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — rate limiting
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ADMISSIONS_NOTIFY_EMAIL` — email
- `RESEND_WEBHOOK_SECRET` — verifies the Resend webhook signature
- `MINDEE_API_KEY` — OCR
- `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` — error reporting (server + client)
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` — CAPTCHA on `/apply`

Env is validated at first read via `lib/env.ts` with zod; misconfigurations fail loudly.

## Scripts

```bash
npm run dev               # next dev
npm run build             # next build
npm run start             # next start
npm run lint              # next lint
npm run typecheck         # tsc --noEmit
npm run test:e2e          # Playwright headless against the production build
npm run test:e2e:headed   # ditto, in a real browser
npm run seed:demo         # Populate a non-prod Supabase with demo users + data
npm run reset:demo        # Purge anything tagged with @demo.aod.local
```

## Migrations

Run in order against any environment. All are idempotent.

| File | What it adds |
|---|---|
| `0001_applications.sql` | `applications` table + RLS |
| `0002_auth_and_rls.sql` | `profiles`, `application_documents`, storage bucket, RLS, auto-profile trigger |
| `0003_curriculum.sql` | `modules`, `enrollments`, `assignments`, `submissions`, `is_enrolled` helper, seed data |
| `0004_submissions_and_autoenroll.sql` | `submissions` storage bucket + RLS; auto-enroll on application accept |
| `0005_link_orphan_applications.sql` | Profile-insert trigger that back-links applications by email |
| `0006_security_and_faculty.sql` | Tighten submission owner-update; faculty role policies |
| `0007_realtime_and_progress.sql` | Realtime publication on `submissions`; `cohort_progress` RPC |
| `0008_compliance_and_apply_docs.sql` | `data_deletion_requests`; `applications.upload_token` |
| `0009_audit_offsets_webhooks.sql` | `audit_log`, `email_deliveries`, `enrollments.starts_on`, assignment offsets |

## Testing

The Playwright suite covers the happy path: apply → admin accept → portal → submit → grade → student sees feedback. It auto-skips when `E2E_SUPABASE_URL` + `E2E_SUPABASE_SERVICE_ROLE_KEY` aren't set. The flow drives password sign-in via the magic-link/password toggle, so existing magic-link UX is untouched.

```bash
npx playwright install chromium
E2E_SUPABASE_URL=…  E2E_SUPABASE_SERVICE_ROLE_KEY=…  npm run test:e2e
```

## Deployment

See deployment notes in chat / project docs. The short version:

1. Apply all migrations to your prod Supabase project.
2. Point Vercel at `web/` as the root directory.
3. Set the env vars from the list above on Production. **Never** put `SUPABASE_SERVICE_ROLE_KEY` under `NEXT_PUBLIC_*`.
4. In Supabase: set Site URL + Redirect URLs under Auth → URL Configuration.
5. If using Resend webhooks: point Resend at `https://your-domain/api/webhooks/resend` and put the secret into `RESEND_WEBHOOK_SECRET`.
6. Monitor with `GET /api/health` (200 = critical integrations up; 503 = degraded with per-integration detail).

## Project layout

```
app/
  layout.tsx, page.tsx          home + chrome
  about/, courses/, apply/      public pages
  privacy/, terms/              POPIA + legal
  login/, auth/                 magic-link + password sign-in
  portal/                       student portal (enrollments, progress, tutor, Your data)
  admin/                        applications, cohorts, grading, curriculum, audit
  api/                          aida, apply, apply-upload, upload, ocr, submissions,
                                admin/grade, admin/file, me/export, me/delete-request,
                                webhooks/resend, health
components/                     UI (Hero, ApplyForm, Aida, GradeForm, Turnstile, …)
data/                           Typed content (courses, career intel)
lib/
  env.ts                        zod-validated env
  ratelimit.ts                  Upstash limiter (no-op fallback)
  email.ts                      Resend wrapper + templates
  ocr.ts                        Mindee wrapper
  origin.ts                     CSRF origin check
  turnstile.ts                  Server-side CAPTCHA verify
  audit.ts                      Audit-log writer
  anthropic.ts                  Claude client + admissions/tutor prompts
  database.types.ts             Generated schema types
  supabase/                     admin / server / client / middleware clients
middleware.ts                   Session refresh + role-gated route protection
scripts/                        Demo seed + reset
supabase/migrations/            See table above
tests/e2e/                      Playwright spec + fixtures
sentry.{client,server,edge}.config.ts
instrumentation.ts              Sentry init wiring
next.config.js                  Security headers, CSP, withSentryConfig wrapper
```
