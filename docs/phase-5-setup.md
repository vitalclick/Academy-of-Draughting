# Phase 5 — Admin workspace + Content Studio

## What got built

### Admin workspace (`/admin`)
- Supabase Auth magic-link sign-in
- Protected route group `(authed)` — every page below it requires an `admins`
  row or an email in `ADMIN_EMAILS`
- Pages:
  - `/admin` — overview with live counts (applications by status, leads,
    24h events, content drafts) plus the five most recent applications
    and ten most recent events
  - `/admin/applications` — filterable table (all / submitted / under review
    / accepted / rejected / drafts)
  - `/admin/applications/[id]` — applicant detail, application details,
    uploaded documents list, status-update sidebar
  - `/admin/leads` — applicants who never completed an application
  - `/admin/events` — filterable event stream (all / submissions / status
    changes / leads / recommender / A/B exposures / CTA clicks)
  - `/admin/content` — Content Studio (next section)

### Content Studio
- Four content kinds: blog post, FAQ, testimonial, page section
- Three states: draft → review → published (archived = soft-delete)
- AI draft generation via Claude with kind-specific prompts grounded on the
  same knowledge base the chatbot uses — no fabricated facts
- Editor saves drafts, lets a human edit, and publishes with a single click
- Publishing triggers `revalidatePath('/blog')` + `revalidatePath('/blog/<slug>')`
  so the public page updates immediately
- All state changes write a row to `events` with the admin's email

### Public blog (`/blog`, `/blog/[slug]`)
- Server-rendered (dynamic), pulls only published rows from
  `content_blocks`
- JSON-LD breadcrumbs, OpenGraph article metadata, canonical URLs
- Minimal in-house markdown renderer (`src/lib/markdown.ts`) — supports
  headings, paragraphs, lists, blockquotes, links, inline code, bold/italic
- Sitemap auto-includes published posts

## Setting up

### 1. Apply the migration

```bash
supabase db push  # runs supabase/migrations/0003_admin.sql
```

This adds:
- `admins` allowlist table (RLS: only admins can read it)
- `content_blocks` table (RLS: anon reads published, admins read+write all)
- `public.is_admin()` helper used by the new RLS policies
- Admin-side RLS on `applicants`, `applications`, `documents`, `events`

### 2. Bootstrap the first admin

Either:
- Set `ADMIN_EMAILS` to a comma-separated list. On first sign-in the user
  is auto-inserted into the `admins` table with role `super`. Remove the
  env var afterwards.

  ```bash
  ADMIN_EMAILS=ops@academydraughting.com,coo@academydraughting.com
  ```

- Or insert directly via the Supabase SQL editor:

  ```sql
  insert into admins (user_id, email, role)
  values ('<uuid from auth.users>', 'ops@academydraughting.com', 'super');
  ```

### 3. Configure Supabase Auth

In Project Settings → Authentication:
- **Site URL**: `https://academydraughting.com`
- **Redirect URLs**: add `https://academydraughting.com/admin/callback`
  and `http://localhost:3000/admin/callback` for local dev
- **Email templates**: customise the magic-link template if desired

Magic links expire in 10 minutes by default — fine.

### 4. Optional: Anthropic for AI drafts

The Content Studio works without Claude (it returns a fallback stub draft).
With `ANTHROPIC_API_KEY` set, Claude drafts go straight into the editor and
the metadata records the model used and the prompt that produced the draft.

## Security model

- **No public API** exposes admin actions. Every mutation goes through a
  server action that calls `currentAdmin()` first.
- The middleware (`src/middleware.ts`) keeps the Supabase Auth session
  cookie fresh on every `/admin/**` and `/api/admin/**` request.
- The service-role Supabase client is `server-only`. Importing it from a
  client component fails at build time.
- Row-level security is the **second** line of defence: even if an admin
  page leaked the wrong query, RLS denies anonymous access to applicants,
  applications, documents, and events.
- The Content Studio's AI prompt-runner does **not** publish on its own.
  Every published row was clicked-published by a human.

## Public-facing implications

- `/blog` is dynamic (server-rendered) — no static export. If you want
  static blog pages, add `export const revalidate = 60` to the page module
  for ISR.
- Published posts flow into `sitemap.xml` automatically (slug-based).
- The markdown renderer is intentionally minimal. If/when you need richer
  content (images, code blocks, callouts), swap `src/lib/markdown.ts` for
  `remark`/`micromark` — the call site is one function.

## Known limitations
- AIDA widget + cookie banner + exit-intent modal still render on `/admin`
  pages because they're wired into the root layout. They're admin-irrelevant
  but harmless; cleanup is a follow-up.
- No bulk actions on applications (yet) — status changes are one at a time.
- No file preview for uploaded documents in the admin detail view yet — the
  Supabase Storage signed-read helper exists (`createSignedReadUrl`) and
  just needs wiring into the document row.
