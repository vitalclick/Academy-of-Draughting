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

## Pending phases
- **Phase 3** — AI layer v1 (real chatbot via Claude/OpenAI, RAG against
  course data, real recommender, career-hub data pipeline, OCR for uploaded
  docs)
- **Phase 4** — Personalization & conversion experiments
- **Phase 5** — Admin + AI Content Studio (CMS)
- **Phase 6** — Hardening, security review, launch

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
