# Phase 4 — Personalization setup

Phase 4 ships entirely client-side personalization plus one new server endpoint
(`POST /api/leads`). There are no new env vars to set — it reuses Supabase,
Resend, and the cookie-consent flow from earlier phases.

## What runs out of the box

- Visitor-segment inference on every page (`src/lib/personalization/segment.ts`)
- A/B harness with deterministic bucketing (`experiments.ts`)
- Personalized hero copy (6 segments × 3 variants)
- Personalized "Apply" CTA labels across the chrome
- Exit-intent modal with per-segment lead-magnet copy
- `lead_captured` events in the database / local store
- Lead magnet email via Resend when configured (otherwise console-logs)

## Debug overlay

Append `?debug=personalization` to any page URL to see:

- The resolved segment + the signals that produced it
- Device class, page-views this session, UTM source/campaign, referrer
- The anonymous ID this visitor was assigned
- Every active experiment and the variant the current visitor is in

Useful for QA — marketing can paste a UTM-tagged URL into a private tab and
see the segment / variant resolution live.

## Adding a new experiment

1. Add an entry to `EXPERIMENTS` in `src/lib/personalization/experiments.ts`:
   ```ts
   apply_funnel_step_count: {
     key: 'apply_funnel_step_count',
     description: 'Test 3-step vs 4-step apply',
     variants: ['three', 'four'] as const,
   },
   ```
2. In the component, call `const variant = variantFor('apply_funnel_step_count')`
3. Branch on the variant. Always log exposure once per mount via `track('experiment_exposed', …)`.
4. Add the conversion event your experiment moves the needle on. The
   `(experiment, variant)` cohort can be reconstructed from the `events` table.

## Adding a new segment

1. Add the literal to the `Segment` union in `segment.ts`.
2. Extend `inferSegment(signals)` with the rule that picks it out.
3. Extend `SEGMENT_LABEL` and the segment-keyed maps in
   `hero-headline.tsx` and `exit-intent.tsx` (`COPY`).
4. The TypeScript compiler will refuse to build until every map is complete —
   no missing-segment fallbacks slip through.

## Stopping an experiment

Two options:
1. Delete the entry from `EXPERIMENTS`. Components using it will throw at
   build time (good — surfaces stale references).
2. Pin it via `force: 'variant_x'` to keep the API stable while you migrate
   the codebase off the variant logic.

## The lead-magnet PDF

`/api/leads` emails a link to `/downloads/sa-draughting-careers-2026.pdf`.
Place the real PDF at `public/downloads/` before going live — without it the
link 404s. Until then, the form still captures the lead, the email still
sends, and the link is harmless (it just shows the branded 404).

## Privacy

- The segment + experiment harness writes only to `localStorage`. Nothing
  syncs to the server unless the visitor takes an action that triggers a
  `track()` call.
- Cookie banner consent gates GA4 and Meta Pixel — those scripts only load
  after explicit `Accept all`. Internal `/api/events` writes are first-party
  and considered functional (POPIA Section 11 — for service operation), but
  if you want to gate them too, check `localStorage.aoad_cookie_consent_v1`
  inside `track()`.
- Exit-intent suppression timestamp is also local — no server tracking of
  who saw the modal.
