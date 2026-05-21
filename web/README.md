# Academy of Advanced Draughting — Web

Next.js 14 (App Router) + TypeScript + Tailwind + Supabase Auth + Anthropic + Resend + Mindee + Upstash.

## Quickstart

```bash
cd web
npm install
cp .env.example .env.local      # fill keys (see Env section)
# Run migrations against your Supabase project:
#   psql "$SUPABASE_DB_URL" < supabase/migrations/0001_applications.sql
#   psql "$SUPABASE_DB_URL" < supabase/migrations/0002_auth_and_rls.sql
npm run dev
```

Open http://localhost:3000.

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript strict |
| Styling | Tailwind + design tokens in `tailwind.config.ts` |
| Auth | Supabase Auth (magic link) via `@supabase/ssr`, session cookies refreshed in `middleware.ts` |
| Database | Supabase Postgres with RLS |
| AI chat | Anthropic SDK (`claude-sonnet-4-6`) |
| Email | Resend |
| OCR | Mindee (abstracted — easy to swap for Document AI / Textract) |
| Rate limiting | Upstash Redis + `@upstash/ratelimit` |
| Validation | zod (request bodies + env) |

All optional integrations (Upstash, Resend, Mindee) no-op gracefully if their env vars are unset, so local development is friction-free.

## Routes

- `/` — marketing home
- `/about`, `/courses`, `/apply` — public
- `/login`, `/auth/callback`, `/auth/signout` — auth
- `/portal` — **auth-gated**, shows the signed-in user's applications + lets them upload docs
- `/admin`, `/admin/applications/[id]` — **admin-gated**, application triage + status updates
- `POST /api/aida` — Claude-backed chat, rate-limited per IP
- `POST /api/apply` — public form submission, rate-limited, links to user if signed in, fires Resend emails
- `POST /api/upload` — auth-required, returns a signed Supabase Storage upload URL
- `POST /api/ocr` — auth-required, runs Mindee OCR on an uploaded document

## Auth model

- Supabase Auth handles users.
- A `profiles` row is auto-created on signup via a trigger.
- `profiles.role` is one of `student` / `admin` / `faculty`.
- `middleware.ts` redirects unauthenticated visitors to `/login` for `/portal` and `/admin`, and bounces non-admins away from `/admin`.
- RLS policies on `applications` and `application_documents` let owners read their own rows and admins read everything; updates are admin-only. Inserts are done server-side with the service role to support anonymous applications.
- Promote a user to admin:
  ```sql
  update public.profiles set role = 'admin' where email = 'you@example.com';
  ```

## Rate limits (defined in `lib/ratelimit.ts`)

| Route | Limit |
|---|---|
| `/api/aida` | 12 / minute / IP |
| `/api/apply` | 4 / 10 minutes / IP |
| `/api/upload` | 30 / 10 minutes / user |

If `UPSTASH_REDIS_REST_URL` is unset, the limiter is a no-op (useful for local dev).

## Origin / CSRF

Every `POST /api/*` route checks the `Origin` header against `NEXT_PUBLIC_SITE_URL`. Requests with a mismatched Origin get a 403. Requests with no Origin header (e.g. server-to-server tools) are accepted.

## Env

See `.env.example`. Required for full functionality:

- `ANTHROPIC_API_KEY` (AIDA chat)
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (DB writes, signed URLs)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (auth + SSR)
- `NEXT_PUBLIC_SITE_URL` (origin check + magic-link redirect base)

Optional:

- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — rate limiting
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ADMISSIONS_NOTIFY_EMAIL` — email notifications
- `MINDEE_API_KEY` — OCR

Env is validated at first read via `lib/env.ts` with zod; misconfigurations fail loudly with the offending key.

## Project layout

```
app/
  layout.tsx, page.tsx          home + chrome
  about/, courses/, apply/      public pages
  login/, auth/                 magic-link sign-in flow
  portal/                       auth-gated student portal
  admin/                        admin dashboard + applications/[id]
  api/aida/        Claude chat (rate-limited)
  api/apply/       application insert (rate-limited, emails)
  api/upload/      signed Supabase Storage upload URL
  api/ocr/         Mindee OCR on a stored doc
components/                     UI (Hero, CareerIntel, ApplyForm, Aida, DocumentUpload, …)
data/                           Typed content (courses, career intel)
lib/
  env.ts                        zod-validated env
  ratelimit.ts                  Upstash limiter (no-op fallback)
  email.ts                      Resend wrapper (no-op fallback)
  ocr.ts                        Mindee wrapper (no-op fallback)
  origin.ts                     CSRF origin check
  anthropic.ts                  Claude client + system prompt
  supabase/
    admin.ts                    Service-role client (server only)
    server.ts                   SSR client (RSC + route handlers)
    client.ts                   Browser client
    middleware.ts               Session refresh used by middleware.ts
middleware.ts                   Session refresh + route protection
supabase/migrations/
  0001_applications.sql         Applications table
  0002_auth_and_rls.sql         Profiles, RLS, documents, storage bucket
```

## What's still scaffolded vs production

- OCR — wired end-to-end against Mindee's invoice endpoint as a demonstrator. Swap the call in `lib/ocr.ts` for the document type you actually want (e.g. ID, qualification certificates).
- WhatsApp handoff — not yet wired. Add a Twilio/WhatsApp Business client beside `lib/email.ts` and call it from `notify()` in `app/api/apply/route.ts`.
- Multi-step apply form / auto-save — currently single-step. The form state shape and `/api/apply` schema support extension without breaking changes.
