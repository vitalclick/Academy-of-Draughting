# Deploy bundle — Academy of Advanced Draughting

Everything you need to take the codebase from "merged into main" to "live in
production". Designed for one human to run in a single sitting, in this order:

1. **`provisioning-checklist.md`** — accounts to create + exact order.
   Two of the five (Supabase, Anthropic) take ~10 min each and unblock 95%
   of features. WhatsApp Business takes 1–2 weeks of Meta review — start it
   first, finish it last.
2. **`supabase-cutover.sql`** — paste into Supabase SQL Editor on the new
   project, or run via `supabase db push`. Idempotent: safe to re-run.
3. **`vercel-env.md`** — copy-paste table of env vars to add in Vercel.
4. **`smoke-test.sh`** — hit the deployed URL and verify every route +
   health check + security headers.
5. **`designer-walkthrough.md`** — exact URLs and what to look at, for a
   designer's first pass on the Vercel preview.

You don't need anything else from this repo to deploy. The app reads only
the env vars listed in `vercel-env.md` and degrades to safe stubs for any
that aren't set, so you can ship in stages.

## Recommended sequence (one afternoon)

| Step | Owner | Time |
|---|---|---|
| Start Meta WhatsApp Business verification | you | 5 min submit, then weeks of waiting |
| Create Supabase project, apply `supabase-cutover.sql`, copy keys | you | 15 min |
| Sign up Resend, verify domain DNS, copy API key | you | 20 min (DNS prop wait) |
| Sign up Anthropic, generate API key | you | 5 min |
| Import repo into Vercel, paste env vars from `vercel-env.md` | you | 10 min |
| First Vercel deploy → preview URL | Vercel | 2 min |
| Run `smoke-test.sh` against the preview URL | you | 1 min |
| Send the preview URL to your designer with `designer-walkthrough.md` | you | n/a |
| HubSpot Private App setup + paste token into Vercel | you | 10 min |
| Promote preview → production (custom domain) | you | 5 min |

You don't have to do them serially — domain DNS, Anthropic, and HubSpot can
all run in parallel.
