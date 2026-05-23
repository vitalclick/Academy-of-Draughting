# Build status — phase tracker

## Phase 0 — Foundation ✓
- Next.js 15 (App Router) + TypeScript + Tailwind scaffold
- Geist + Geist Mono via `next/font` (replaces Google Fonts `@import`)
- Tailwind theme mirrors the navy/blue/cyan/paper/ink design tokens
- The original CSS is preserved verbatim and imported globally — design fidelity is intact
- Folder layout per the project spec (`/app /components /sections /lib /seo /data /styles`)
- ESLint + Prettier configs
- Site chrome ported: header, footer, logo, AIDA chat widget, page shell, cookie banner
- AIDA state moved from `window` event bus to a React context

## Phase 1 — Static site parity + SEO ✓
### Pages ported
- `/` — Home with hero, trust strip, AI features grid, courses snapshot, career intel dashboard, outcomes
- `/about` — institution story, timeline, three campus cards (JHB/DBN/Online)
- `/courses` — index with client-side filtering across mode/level/software + search
- `/courses/[id]` — dynamic course detail pages, statically generated for all 6 courses
- `/apply` — multi-step application form with OCR preview, AIDA-prefilled summary aside
- `/career` — Career Intelligence Hub (interactive dashboard + per-pathway cards)
- `/contact` — three support channels + FAQ
- `/portal` — student portal placeholder (noindex)
- `/privacy`, `/terms`, `/popia` — legal pages with shared layout
- `/_not-found` — branded 404

### SEO infrastructure
- App-Router `metadata` API per route with canonical URLs and OG/Twitter cards
- `sitemap.xml` and `robots.txt` generated from the App Router
- JSON-LD helpers: `EducationalOrganization` (global), `Course`, `FAQPage`, `BreadcrumbList`
- Semantic HTML, skip-to-content link, `:focus-visible` styling
- Per-course pages emit Course + FAQ schema for rich results

### Conversion mechanics
- Sticky utility strip with intake status + Apply CTA
- AIDA floating chat assistant on every page
- WhatsApp JHB / WhatsApp DBN links throughout footer + contact + apply
- Cookie consent banner persisted in `localStorage`

### Performance & DX
- Server components by default — only the AIDA widget, courses explorer, apply form, career intel
  dashboard, header, footer, and cookie banner are client components
- `next/image` for the logo with explicit dimensions and AVIF/WebP enabled in `next.config.mjs`
- `generateStaticParams` for course detail pages → all 6 are prerendered at build time
- Build output: **21 routes pre-rendered statically**, ~102 kB shared JS, ~119 kB First Load JS on
  the heaviest interactive routes

### CI
- GitHub Actions workflow: install → typecheck → lint → build on every push and PR

## Phase 2 — Smart Enrollment ✓
### Persistence
- Supabase schema (`applicants`, `applications`, `documents`, `events`) with
  RLS, triggers, enums, indexes — `supabase/migrations/0001_init.sql`
- Private storage bucket for applicant documents — `0002_storage.sql`
- Hand-authored `Database` types matching the schema
- Repository layer (`src/lib/db/applications.ts`) that uses Supabase when
  configured and falls back to a local-filesystem store in dev

### Apply form (rewired)
- Migrated from `useState` blob to **React Hook Form** + **Zod**
  (`@hookform/resolvers/zod`)
- Per-step validation, including a Luhn check for SA ID numbers
- Debounced autosave: localStorage on every change, Supabase on 1.5s idle
  once a valid email is present — survives reloads
- Server action `submitApplicationAction` validates, persists, mints a
  tracking JWT, and fires side-effects via `Promise.allSettled`
- Success state renders inside the page with the tracking link

### Document upload
- Server-minted signed-upload URLs (5 min TTL) via
  `/api/applications/documents` (POST)
- Browser PUTs the file directly to Supabase Storage
- Committed via `/api/applications/documents` (PUT) which writes the
  `documents` row
- MIME whitelist + 10 MB cap enforced on the API route
- Falls back to a mock path that records the file metadata locally without
  Supabase

### Email (Resend)
- Two templates: applicant confirmation (with tracking link) and internal
  admissions alert
- Sends in parallel after submit; logs to console when `RESEND_API_KEY`
  is absent

### WhatsApp Business Cloud API
- Outbound template message on submit, using Meta Graph API v20
- Default template `application_received` with first-name + reference params
- No-op when `WHATSAPP_*` env vars are missing

### HubSpot CRM
- Search-by-email then create-or-update via v3 CRM API
- Stamps custom properties: `aoad_programme`, `aoad_mode`, `aoad_campus`,
  `aoad_application_id`
- No-op when `HUBSPOT_PRIVATE_APP_TOKEN` is missing

### Application tracking
- `/apply/status/[token]` — server component, decodes a signed JWT, looks up
  the application, renders status + progress bar
- 30-day TTL JWT, signed via `jose` with `TRACKING_TOKEN_SECRET`
- Tampered or expired tokens return 404
- `noindex,nofollow` metadata

### Analytics
- Anonymous-ID + session-ID generation in `localStorage`/`sessionStorage`
- Fire-and-forget client tracker (`track()`) that writes to `/api/events`
  *and* forwards to `gtag`/`fbq` when loaded
- GA4 + Meta Pixel scripts are gated on cookie-banner consent (`choice: 'all'`)

### Env handling
- `src/lib/env.ts` parses all env vars through Zod with optional defaults
- `features` flags derived from which vars are present — every adapter
  checks its feature flag and degrades gracefully

### Tests passed
- `npm run typecheck` ✓
- `npm run lint` ✓
- `npm run build` ✓ — **23 routes**, including 2 dynamic API routes
- Smoke tests: `/apply` → 200, `/apply/status/junk` → 404,
  `POST /api/events` → 200 + persistence, `POST /api/applications/documents`
  with bad UUID → 400 with helpful message

## Phase 3 — AI layer v1 ✓
### AIDA chatbot (Claude-powered)
- `POST /api/chat` streams SSE: `text | effect | tool | error | done`
- System prompt grounded on a compiled knowledge base of all programmes +
  careers (`src/lib/ai/corpus.ts`) — no fabrication of fees or modules
- Six tools: `lookup_course`, `list_courses`, `get_career_data`,
  `recommend_pathway`, `start_application`, `hand_off_to_human`
- Tool-use loop capped at 4 iterations to bound latency + cost
- Per-IP rate limit via in-memory token bucket (20 msg/min)
- AIDA widget rewritten to consume the SSE stream and render tool effects as
  inline CTAs (apply, deep-link, hand-off)
- Streaming cursor in the bubble while Claude is generating
- Graceful no-key fallback: streams a single hand-off message

### Programme recommender
- `POST /api/recommend` — deterministic scoring + Claude-written rationale
- Page `/career/quiz`: 4-question quiz, ranks top three programmes with bars,
  CTA chains into the application flow with the course pre-selected via
  query string
- Per-IP rate limit (10 runs/min); each run logged to `events`

### Career intelligence dataset
- `src/data/careers.ts` — six SA draughting careers with median, band,
  growth, software, top employers, day-to-day, demand
- Shared by the chatbot (`get_career_data` tool), recommender, and the
  existing Career Hub page

### Document OCR (Claude vision)
- `POST /api/applications/ocr` (multipart) — extracts structured JSON from
  ID or matric images using Haiku 4.5
- Wired into Apply step 3: uploading an ID auto-fills `idNumber`,
  `firstName`, `lastName` on step 1; matric uploads fill `matricYear`
- 6 MB cap, MIME whitelist, per-IP rate limit (6/min)

### Tests passed
- `npm run build` ✓ — **27 routes** including 5 dynamic API routes
- `npm run lint` clean
- Smoke tests with no API key:
  - `POST /api/chat` streams the fallback SSE
  - `POST /api/recommend` returns ranked courses with boilerplate rationale
  - `POST /api/applications/ocr` validates multipart and returns empty fields
  - Invalid payloads → 400; rate limit returns 429 with `Retry-After`

## Phase 4 — Personalization & conversion ✓
### Visitor segmentation
- `src/lib/personalization/segment.ts` — pure inference from UTM + referrer +
  device + history, persisted to localStorage with 30-day TTL
- Six segments: `matric`, `career_changer`, `working_pro`, `parent`,
  `returning`, `unknown`
- `?debug=personalization` query param renders a live overlay showing the
  segment, signals, anon ID, and experiment assignments — invaluable for
  marketing QA without writing internal tools

### A/B test harness
- `src/lib/personalization/experiments.ts` — deterministic FNV-1a hash of
  `anonId::experimentKey` mod variants.length → stable bucket without a
  server round-trip
- Two experiments registered:
  - `home_hero_headline` × 3 — copy variants per segment
  - `apply_cta_label` × 3 — "Apply Now" vs "Start application" vs "Check
    eligibility" across all CTA placements
- `experiment_exposed` and `apply_cta_clicked` events fire to `/api/events`
  for funnel analysis
- Optional `force` field lets you pin a variant during ramps or rollbacks

### Personalized content
- `HeroHeadline` ships a 6 segments × 3 variants = 18-headline matrix on the
  home hero (eyebrow, title, sub) — every combination is hand-written, no
  fabricated copy
- `ApplyCta` is a drop-in replacement that swaps label by experiment variant
  and reports both exposure and click events; used in chrome and hero
- All personalization fails safe to the `unknown::careers_start` cell

### Exit-intent capture
- `src/components/personalization/exit-intent.tsx` — fires on mouse-leave
  through the top of the viewport, desktop only, ≥8 s after pageload, max
  once per 14 days per visitor
- Per-segment lead-magnet copy (matric / career-changer / working-pro /
  parent / returning / fallback)
- `POST /api/leads` validates the email, upserts the applicant, fires the
  lead-magnet email via Resend and an internal alert, logs a `lead_captured`
  event — graceful no-op for email when Resend isn't configured
- 5 leads/minute/IP rate limit; events logged whether email succeeds or not

### Tests passed
- `npm run build` ✓ — **28 routes** (`/api/leads` added)
- `npm run lint` clean
- Smoke tests:
  - `POST /api/leads` valid → 200 + applicant row + event
  - Bad email → 400
  - Burst > capacity → 429 with `Retry-After`
  - Home page renders the personalization provider, exit-intent mount,
    and `?utm_campaign=…` still returns 200

## Phase 5 — Admin workspace + Content Studio ✓
### Auth + access control
- Supabase Auth magic-link sign-in at `/admin/login`
- `currentAdmin()` gates on Supabase session *and* either an `admins` row
  OR membership in the `ADMIN_EMAILS` bootstrap allowlist
- First sign-in via the allowlist auto-inserts the user into `admins`
- `src/middleware.ts` refreshes the Supabase session cookie on every
  `/admin/**` and `/api/admin/**` request
- Route group `(authed)` so the protected shell only wraps protected
  pages — login + callback inherit the root layout

### Admin pages
- `/admin` overview: live counts (apps by status, leads, 24h events,
  content drafts) + recent applications + recent events
- `/admin/applications` filterable table; `/admin/applications/[id]`
  detail with applicant info, documents list and a status-update sidebar
- `/admin/leads`: applicants who never completed an application
- `/admin/events`: filterable event stream
- Status changes write `application_status_changed` / `content_state_changed`
  events with the admin's email attached

### Content Studio
- Four kinds (blog post, FAQ, testimonial, page section), three states
  (draft → review → published; archived = soft delete)
- Editor with AI draft generator using Claude with kind-specific prompts
  grounded on the same knowledge base as the chatbot
- Save / publish triggers `revalidatePath` so the public `/blog` route
  updates immediately
- AI metadata recorded on every row (`ai_prompt`, `ai_model`)

### Public blog
- `/blog` index + `/blog/[slug]` post pages, server-rendered, dynamic
- Breadcrumb + article JSON-LD, OpenGraph metadata, canonical URL
- Minimal in-house markdown renderer (`src/lib/markdown.ts`)
- `sitemap.xml` automatically includes every published post

### Database
- `supabase/migrations/0003_admin.sql`:
  - `admins` + `is_admin()` RPC
  - `content_blocks` (kind + state enums, slug uniqueness for blog posts,
    indexes on `(kind, state, updated_at)`)
  - RLS: anon reads published `content_blocks`; admins read + write all;
    admins read/update applications + read applicants/documents/events

### Tests passed
- `npm run build` ✓ — **38 routes** (5 protected admin pages, 2 new public
  blog routes, Supabase middleware)
- `npm run lint` clean
- Smoke tests: `/admin` → 307 to login, `/admin/login` → 200 with the
  "Supabase not configured" notice, `/blog` → 200 empty state,
  `/blog/missing-post` → 404

## Phase 6 — Hardening + launch ✓
### Security headers
- CSP locked to `default-src 'self'` with narrow allowlists per integration
  (Anthropic, Resend, HubSpot, WhatsApp, Supabase, GA4, Meta Pixel) — no
  `unsafe-inline` in `script-src`
- X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy
  strict-origin-when-cross-origin, Permissions-Policy disables camera /
  mic / geolocation / FLoC, HSTS for 2 years with preload
- `/admin/**` gets `X-Robots-Tag: noindex, nofollow` for belt-and-braces

### Health + observability
- `GET /api/health` liveness (always 200 with feature flags)
- `GET /api/health?check=ready` pings Supabase, 503s if it can't reach
- `captureError()` / `captureWarn()` (`src/lib/observability.ts`) posts to
  any HTTPS sink (Sentry DSN / Slack / Discord / custom) when
  `ERROR_SINK_URL` is set; always console-logs
- Wired into `submitApplicationAction`; helpers ready for the rest
- `error.tsx` + `global-error.tsx` route boundaries; both report
  `client_error` / `global_error` to `/api/events`

### POPIA data-subject rights
- Public `/data-rights` page with access + delete request form
- `POST /api/data-rights` returns **200 regardless of email existence** so
  membership isn't leaked; emails a magic-link confirmation when there's
  a record
- `/data-rights/confirm?token=…` verifies a 48-hour JWT and either
  renders the export inline (with JSON download) or anonymises the
  applicant row
- Both actions log audit events
- Linked from the public footer

### Document retention
- `supabase/migrations/0004_retention.sql` adds
  `public.purge_old_documents(retention_days)`
- Deletes storage objects + `documents` rows for files older than the
  window whose application is decided or stale
- Schedulable via pg_cron — runbook in `docs/phase-6-setup.md`

### Route-aware overlay components
- `AidaWidget`, `ExitIntent`, `CookieBanner` use `usePathname()` and hide on
  `/admin/**` and `/data-rights/confirm`; `ExitIntent` also avoids `/apply`
- Closes the known Phase 5 limitation

### Admin completeness
- Document table in `/admin/applications/[id]` now renders signed-read URLs
  per file via the Storage signed-URL helper
- 5-minute TTL on the signed URLs; admins click → opens in a new tab

### Tests passed
- `npm run build` ✓ — **42 routes** including `/api/health`,
  `/api/data-rights`, `/data-rights`, `/data-rights/confirm`,
  `error.tsx`, `global-error.tsx`
- `npm run lint` clean
- Smoke tests:
  - Security headers present on `/` (full CSP, HSTS, all extras)
  - `/admin` adds X-Robots-Tag noindex
  - `GET /api/health` → 200 with feature flags
  - `GET /api/health?check=ready` → 200 with Supabase=not_configured
  - `POST /api/data-rights` valid → 200, bad email → 400
  - `/data-rights` → 200, `/data-rights/confirm` (no token) → 200 (renders
    the "link expired" branch)

## Phase 7 — Student portal ✓
### Auth
- Magic-link sign-in at `/portal/login` (separate from `/admin/login` —
  same Supabase Auth, different post-sign-in routing)
- `currentStudent()` helper: requires a Supabase session **and** at least
  one `enrollments` row for that user; returns the student's enrollments
- Middleware refreshes the Supabase cookie on every `/portal/**` request
- Route group `(authed)` so login + callback render without the portal
  shell

### Pages
- `/portal` dashboard: per-enrolment summary cards (open / overdue / total
  assignments) and a "due soon" table
- `/portal/courses/[id]` per-enrolment assignment list with state +
  grade columns
- `/portal/courses/[id]/assignments/[assignmentId]` brief + submission
  panel; shows feedback + grade when graded, otherwise the submit form

### Submissions
- Comment-based submission (file upload deferred to 7.1 — the schema +
  storage bucket are already in place)
- Server action upserts the `submissions` row, flips between
  `draft` and `submitted`, logs `submission_saved` /
  `submission_submitted` events
- Triggers `revalidatePath` on all three portal routes so the dashboard
  updates immediately

### Schema (`supabase/migrations/0005_portal.sql`)
- `enrollments` (user_id → applicant_id → application_id chain, programme
  + cohort, state enum)
- `assignments` (programme + optional cohort, kind enum, weight, published
  flag)
- `submissions` (one row per enrollment×assignment, state enum, optional
  storage_path for future file upload, grade + feedback fields)
- `student-submissions` private storage bucket
- `public.is_student()` helper
- RLS:
  - Students read only their own enrollments + submissions
  - Students see published assignments for programmes they're enrolled in
  - Students insert / update only their own draft submissions
  - Admins (via `is_admin()`) see + write everything

### Tests passed
- `npm run build` ✓ — **46 routes**, including 4 new portal routes
- `npm run lint` clean
- Smoke tests:
  - `/portal` → 307 → `/portal/login`
  - `/portal/login` → 200 with STUDENT PORTAL branding
  - `/portal/courses/anything` → 307 (redirected by `(authed)` layout)
- Route-aware overlays (AIDA, ExitIntent, cookie banner) hidden on
  `/portal` just like `/admin`

## Pending
Phase 7 closes out the planned roadmap. See `docs/phase-6-setup.md` for
the launch checklist; the student portal can launch alongside or
behind a feature flag.

Likely follow-ups:
- **7.1** — File-upload submissions (storage bucket + signed URLs already
  there, just needs the UI + OCR/preview)
- **7.2** — Admin grading view at `/admin/submissions`
- **7.3** — AI drawing critique (Claude vision against drawing-office
  standards)

## How to add a new page
1. Add the route under `src/app/<route>/page.tsx`.
2. Add it to `NAV_ITEMS` in `src/lib/site.ts` if it should appear in the nav.
3. Add to `src/app/sitemap.ts`.
4. Set `metadata` with `title`, `description`, and a canonical `alternates`.
5. If applicable, add JSON-LD via the helpers in `src/seo/json-ld.tsx`.

## How to add a new course
Edit `src/data/courses.ts` — the entry will automatically:
- appear in the `/courses` filter grid,
- get its own statically generated `/courses/<id>` route,
- be added to the sitemap,
- emit `Course` + `FAQPage` JSON-LD.
