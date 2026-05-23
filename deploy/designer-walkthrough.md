# Designer walkthrough

For the first eyeball pass on the Vercel preview URL. Doesn't assume the
designer knows the codebase — just a clear list of what to open and what
matters at each stop.

**Time budget:** 45–60 min for a thorough pass; 20 min for a quick read.

## 0. Setup

1. Use a real device for at least one route per category — desktop
   (1440px+), tablet (~768px), mobile (~390px).
2. Open the Vercel preview URL in an incognito window so the personalization
   experiments + cookie banner fire fresh.
3. Bookmark `<preview>/?debug=personalization` — adds an overlay showing
   the visitor's segment, anon ID, and which experiment variants they're
   in. Useful when comparing hero copy across reloads.

## 1. Public marketing site

### `/` — home
**Watch for:** hero balance (image-slot placeholder vs blueprint deco),
trust-strip readability against dark navy, the AI feature cards
("Personal Admissions Assistant", "Career Counsellor" etc.) — these
have hand-drawn mini chat / chart visuals that should crisp-render.

Reload twice. The H1 should change between visits — there are 3 variants
× 6 segments. All should read naturally; flag any that feel awkward.

### `/about`
**Watch for:** the 8-row timeline (1981 → 2026), and the three campus
cards. The campus cards have abstract SVG illustrations (skyline for JHB,
coastline for DBN, node-graph for online) — they should feel cohesive.

### `/courses` + per-course pages
**Watch for:**
- Filter chips wrap cleanly at all widths
- Each course card has a unique SVG illustration (`plan`, `compass`,
  `orthographic`, `isometric`, `part`, `contour`) — eyeball each at
  `/courses/mddop`, `/courses/revit`, `/courses/inventor` etc.
- The "MOST POPULAR" / "✓ FIT" pills sit cleanly inside cards
- Course detail pages have FAQ accordions — exercise one

### `/career` + `/career/quiz`
**Watch for:** the interactive dashboard's three KPI tiles and the SVG
chart. Click the sidebar's career-path rows to confirm the chart updates.

On `/career/quiz`: walk through the 4 questions. The result screen
shows ranked programmes with fit bars; rationale paragraph comes from
Claude (or boilerplate if the key isn't set yet).

### `/apply`
**Watch for:** multi-step stepper visual state (active / done / pending),
the AIDA sidebar widget on the right, and the field-error styling when
you submit an empty step. The Field component shows "⚡ PREFILLED" badges
on auto-filled fields and "✓ DOCUMENT VERIFIED" on the ID field after a
matric/ID image is uploaded on step 3.

Don't actually submit unless you want a row in production. The schema
flows correctly; we've smoke-tested the action separately.

### `/contact`
**Watch for:** the three support-channel cards and the FAQ accordion
below. WhatsApp buttons should be obviously primary.

### `/blog`
**Watch for:** if no posts published yet, the empty state styling. Once
content is published from `/admin/content`, the cards should render with
date + summary + CTA.

### `/privacy`, `/terms`, `/popia`, `/data-rights`
**Watch for:** legal-prose readability. These pages use the same shared
`.legal-prose` styling — flag any layout drift between them.

## 2. AIDA chat widget

Click the floating "Admissions Chat" pill in the bottom right of any
public page.

**Watch for:**
- Slide-up animation feels snappy, not floaty
- Streaming cursor (cyan vertical bar) appears as Claude types
- Tool effects render as inline CTAs (e.g. "Open MDDOP →" links after a
  `lookup_course` call)
- Three tabs at top: Chat / Match Pathway / Apply — all functional
- Doesn't overlap critical content on mobile

If `ANTHROPIC_API_KEY` isn't set yet, you'll get a single "I'm AIDA — the
live assistant isn't configured" message + "Talk to a human" CTA. That's
the intentional fallback.

## 3. Exit-intent modal

Move the mouse out of the top of the viewport on the home page (desktop
only, must be ≥900px wide). After 8 seconds of dwell, the modal fires.

**Watch for:**
- Copy varies by segment (matric / career_changer / parent / etc.) — use
  `?utm_campaign=matric_recruit` to force the matric copy, etc.
- Form submits cleanly, success state replaces the form
- The "No thanks" link is unobtrusive but findable

After dismissing, it stays dismissed for 14 days per browser.

## 4. Cookie banner

First visit only. Sits bottom-center.

**Watch for:** legibility on the navy band underneath (which on the home
page is the trust strip); the two buttons should be clearly distinct
(Essential = ghost, Accept = primary).

## 5. Auth flows

You'll need real Supabase to fully test these. With it configured:

- **`/admin/login`** — submit your allowlisted email, check inbox, click
  the magic link, land in `/admin`
- **`/portal/login`** — only works if a student record exists with your
  Supabase Auth user_id (`enrollments` row). Otherwise the dashboard
  redirects back to login.

**Watch for:** the sign-in card centered on a navy background, no flash
of unstyled content.

## 6. Admin workspace (after sign-in)

- **`/admin`** — left sidebar (dark navy) + main content. Stats cards
  at the top, then "recent applications" and "recent events" tables.
- **`/admin/applications`** — filter chips at the top, table below.
  Click an applicant row to drill in.
- **`/admin/applications/[id]`** — two-column layout. Left has
  applicant + application details + documents (signed-URL links).
  Right has the status-update sidebar.
- **`/admin/content`** — table of content rows with state pills. Click
  "New draft" → editor with main column on left, AI draft panel on
  right.

**Watch for:** the admin sidebar should not be overwhelming. The status
pills (draft / submitted / under_review / accepted / rejected) need to
be instantly distinguishable.

## 7. Student portal (after sign-in)

- **`/portal`** — dashboard with one card per enrolment + a "due soon"
  table
- **`/portal/courses/[id]`** — assignment list
- **`/portal/courses/[id]/assignments/[id]`** — brief on left,
  submission form on right; graded state shows feedback inline

## 8. Cross-cutting checks

- **Keyboard:** can you tab from the skip link → nav → main CTA → into
  every interactive form? Focus rings should be visible (blue, 2px).
- **Color:** dim text (`var(--ink-3)`, `var(--ink-4)`) needs to pass
  WCAG AA on white. Likely fine but worth eyeballing on a colour-blind
  simulator.
- **Mobile nav:** the burger menu in the header — open it, close it,
  navigate from it.
- **Sticky elements:** does the AIDA pill obscure anything important on
  mobile? It hides itself on `/admin`, `/portal`, `/apply`,
  `/data-rights/confirm` — verify those routes don't render it.
- **Empty states:** `/blog` (no posts), `/admin/leads` (no leads),
  `/portal` (no enrolments — though you won't see this if you got
  past auth).

## What to flag

- Spacing inconsistencies between sections
- Type-scale jumps that feel jarring
- Colour drift between the prototype and the live build
- Anything that breaks below 360px wide
- Animations that fire on every reload (should fire once per session)
- CTAs that are easy to miss

## What's intentional

- The decorative SVGs on course cards are stylised, not photorealistic
- The hero image is a placeholder (`img-placeholder` diagonal-stripe
  pattern) — real photography goes in `public/assets/`
- The AIDA widget styling reads more "Linear" than "Apple" — that's the
  brand brief
- The blueprint grid background on dark sections is intentional, not a
  rendering bug
