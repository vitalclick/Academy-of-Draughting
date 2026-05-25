# Deployment Runbook — Academy of Advanced Draughting

End-to-end guide to taking this app to production. The web app lives in
`web/` (Next.js 14 App Router); the database is Supabase Postgres. Recommended
host is Vercel.

> Billing posture for v1: **manual billing**. No payment processor is wired —
> admissions records offline EFT/deposits out of band. Everything else
> (admissions, portal, curriculum, grading, AI tutor) is fully functional.

---

## 0. Prerequisites

- A **Supabase** project for production (separate from any dev/staging project).
- A **Vercel** account with access to the `vitalclick/academy-of-draughting` repo.
- An **Anthropic** API key (AIDA chat + tutor).
- Optional accounts: Resend (email), Upstash (rate limiting), Cloudflare
  Turnstile (anti-bot), Sentry (errors), Plausible (analytics), VirusTotal
  (file scanning), Mindee (OCR).

Nothing optional blocks launch — each integration no-ops when its env var is
unset.

---

## 1. Database — apply migrations

Apply **all migrations in order** to the production Supabase project. They are
idempotent (safe to re-run). Two ways:

**Option A — Supabase SQL editor (no local tooling).**
Open `https://supabase.com/dashboard/project/<ref>/sql/new` and paste each
file's contents in turn, oldest first, clicking Run after each:

```
0001_applications.sql
0002_auth_and_rls.sql
0003_curriculum.sql
0004_submissions_and_autoenroll.sql
0005_link_orphan_applications.sql
0006_security_and_faculty.sql
0007_realtime_and_progress.sql
0008_compliance_and_apply_docs.sql
0009_audit_offsets_webhooks.sql
0010_notifications_softdelete_briefs.sql
0011_rubric_prereqs_scan.sql
```

**Option B — psql.**

```bash
for f in web/supabase/migrations/0*.sql; do
  echo "applying $f"
  psql "$SUPABASE_DB_URL" < "$f"
done
```

**Verify** with a single query — it should return rows, not error:

```sql
select
  (select count(*) from public.applications)            as applications,
  (select count(*) from public.modules)                 as modules,
  (select count(*) from public.assignments)             as assignments,
  (select count(*) from public.rubric_criteria)         as rubric_criteria,
  (select count(*) from public.notifications)           as notifications,
  (select count(*) from public.audit_log)               as audit_log;
```

If `0007` ran, this should also work (returns 0, not an error):

```sql
select public.cohort_progress('mddop-n4-n5');
```

---

## 2. Database — storage buckets

Migrations create three buckets. Confirm them under **Storage** in the
dashboard:

| Bucket | Visibility | Purpose |
|---|---|---|
| `application-documents` | **private** | Applicant ID / qualification uploads |
| `submissions` | **private** | Student coursework uploads |
| `assignment-briefs` | **public** | Class-facing assignment brief PDFs |

If any is missing, re-run `0002`, `0004`, and `0010`.

---

## 3. Database — realtime

Migrations `0007` and `0010` add `submissions` and `notifications` to the
`supabase_realtime` publication (powers the live grading feed + notification
bell). Confirm under **Database → Replication → supabase_realtime** that both
tables are listed. If not, run:

```sql
alter publication supabase_realtime add table public.submissions;
alter publication supabase_realtime add table public.notifications;
```

---

## 4. Hosting — Vercel project

1. **New Project** → import `vitalclick/academy-of-draughting`.
2. **Root Directory**: `web` (the Next app is in a subdirectory — this is required).
3. Framework preset: **Next.js** (auto-detected).
4. Build command: `next build` (default). Install: `npm install` (default).
5. Node version: **20.x**.

---

## 5. Environment variables (Vercel → Settings → Environment Variables, Production)

### Required

| Var | Where to get it |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Your final URL, e.g. `https://aod.ac.za` |
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → **service_role** key |
| `NEXT_PUBLIC_SUPABASE_URL` | Same as `SUPABASE_URL` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → **anon public** key |

> ⚠️ **Never** put the service-role key under a `NEXT_PUBLIC_*` name. The
> naming split is the only thing keeping it out of the browser bundle.

### Optional (no-op when unset)

| Var | Enables |
|---|---|
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Rate limiting |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ADMISSIONS_NOTIFY_EMAIL` | Transactional email |
| `RESEND_WEBHOOK_SECRET` | Bounce/complaint webhook verification |
| `MINDEE_API_KEY` | Document OCR |
| `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` | Error reporting (server + client) |
| `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` | Source-map upload at build (optional) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | CAPTCHA on `/apply` |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Cookieless analytics |
| `VIRUSTOTAL_API_KEY` | Antivirus hash-lookup on uploads |

`RESEND_FROM_EMAIL` must be an address on a **verified Resend domain**, or
email silently fails. The default `admissions@aod.local` is undeliverable.

---

## 6. Supabase — Auth configuration

Under **Authentication → URL Configuration**:

- **Site URL**: `https://aod.ac.za` (your production URL)
- **Redirect URLs** (add each):
  - `https://aod.ac.za/auth/callback`
  - `https://*-vitalclick.vercel.app/auth/callback` (if you use preview deploys)

Under **Authentication → Providers**: confirm **Email** is enabled. Sign-in
supports both magic link (default) and password.

---

## 7. First admin user

1. Deploy (Section 9), then sign up at `/login` with your real email.
2. The `on_auth_user_created` trigger creates a `profiles` row automatically.
3. Promote yourself in the SQL editor:

```sql
update public.profiles set role = 'admin' where email = 'you@aod.ac.za';
```

Roles: `student` (default), `faculty` (curriculum + grading), `admin` (everything).

---

## 8. Optional integrations — setup notes

- **Resend webhook**: in the Resend dashboard add a webhook pointing at
  `https://aod.ac.za/api/webhooks/resend`, copy its signing secret into
  `RESEND_WEBHOOK_SECRET`. Events land in `public.email_deliveries`.
- **Turnstile**: create a widget at cloudflare.com/turnstile, set the site key
  + secret. The `/apply` form requires it once the site key is present.
- **VirusTotal**: set `VIRUSTOTAL_API_KEY`. Note: hash-lookup only catches
  *known* malware; a never-before-seen file returns `pending`, not `clean`.
  Submission downloads are blocked in the grading queue when `scan_status` is
  `infected`.
- **Sentry**: set `NEXT_PUBLIC_SENTRY_DSN` (+ `SENTRY_DSN`). For source maps,
  also set `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`.

---

## 9. Deploy

Push/merge to the branch Vercel builds (typically `main`), or click **Deploy**
in Vercel. Then attach the custom domain under **Vercel → Domains** and update
DNS per Vercel's instructions. After the domain resolves, make sure
`NEXT_PUBLIC_SITE_URL` and the Supabase Site URL/redirects match the final
domain, and redeploy if you changed them.

---

## 10. Post-deploy smoke test

Run these in order:

1. **Health** — `curl https://aod.ac.za/api/health` → `{"status":"ok",...}`.
   If `db:"fail"` or a critical check is `missing`, fix env and redeploy.
2. **Auth** — sign up, receive the magic-link email (or use password), land on
   `/portal`.
3. **Admin** — after promoting yourself, `/admin` shows the 4-card summary.
4. **Admissions flow** — submit `/apply`, then as admin set the application to
   `accepted`; confirm the welcome email + in-app notification, and that an
   enrollment is auto-created.
5. **Coursework** — as an enrolled student, open an assignment, use the AIDA
   tutor, submit work. As admin/faculty, grade it on `/admin/grading`; confirm
   the student sees the score, rubric breakdown, and feedback.
6. **⚠️ CSP browser check (required)** — sign in and open `/portal` and
   `/admin` with the **devtools console open**. Confirm there are **no
   Content-Security-Policy violation errors** and that scripts run (navigation,
   AIDA chat, notification bell). Auth routes use a strict nonce CSP that can
   only be validated in a real browser. Marketing pages use a static CSP and
   are lower risk.

---

## 11. Rollback

- **App**: in Vercel → Deployments, promote the previous green deployment.
- **CSP only**: if the strict nonce CSP breaks an auth page, edit
  `web/middleware.ts` and remove the route prefix from `NONCE_CSP_PREFIXES`
  (or point it at `staticCsp()`), then redeploy. Everything keeps working with
  the slightly weaker policy.
- **Migrations**: migrations are additive and idempotent; there are no
  destructive drops. A bad data state is fixed forward with SQL, not by
  reverting a migration. Keep daily Supabase backups on (Section 13) so you can
  restore if needed.

---

## 12. Secrets to rotate after handoff

- `SUPABASE_SERVICE_ROLE_KEY` (Supabase → Settings → API → Reset)
- Database password (Supabase → Settings → Database → Reset)
- `ANTHROPIC_API_KEY`
- Any Supabase Personal Access Token used during setup
  (supabase.com/dashboard/account/tokens)

---

## 13. Ongoing operations

- **Uptime**: point a monitor (UptimeRobot / Better Stack) at `/api/health`.
- **Backups**: enable daily backups in Supabase; test a restore quarterly.
- **Dependencies**: Dependabot is configured (`.github/dependabot.yml`) — weekly
  npm PRs, monthly GitHub Actions.
- **Audit**: review `/admin/audit` for role changes, grade overrides, and
  application links.
- **Email deliverability**: watch `public.email_deliveries` for `bounced` /
  `complained` events (populated by the Resend webhook).
- **POPIA**: data export at `/api/me/export`; deletion requests land in
  `public.data_deletion_requests` (process within 30 days).

---

## 14. Local development

```bash
cd web
npm install
cp .env.example .env.local      # fill keys
npm run dev                      # http://localhost:3000
```

Useful scripts:

```bash
npm run typecheck                # tsc --noEmit
npm run build                    # production build
npm run test:e2e                 # Playwright (needs E2E_SUPABASE_* on a non-prod project)
npm run seed:demo                # seed a non-prod Supabase with demo data
npm run reset:demo               # purge demo data (@demo.aod.local)
```

See `web/README.md` for architecture, routes, RLS summary, and rate limits.
