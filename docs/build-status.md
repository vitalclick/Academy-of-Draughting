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

## Pending phases
- **Phase 2** — Smart Enrollment (Supabase, Resend, WhatsApp Business API, HubSpot, OCR)
- **Phase 3** — AI layer v1 (real chatbot, recommender, career hub data pipeline)
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
