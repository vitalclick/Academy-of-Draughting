# Phase 2 — Smart Enrollment setup

The app runs without any of the integrations below — applications save to a
local-filesystem store under `.local-store/`, emails log to the console,
WhatsApp/HubSpot calls are mocked. That lets a contributor see the full
end-to-end UX before production credentials are minted.

To enable the real pipeline in staging or production, follow this guide.

## 1. Supabase

1. Create a Supabase project. Copy the URL, anon key and **service-role** key
   to environment variables:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
2. Apply the migrations from `supabase/migrations/` either via the Supabase
   dashboard SQL editor or the Supabase CLI:
   ```bash
   supabase link --project-ref YOUR_PROJECT
   supabase db push
   ```
3. Confirm RLS is enabled on all four tables (`applicants`, `applications`,
   `documents`, `events`). The only policy is `events_anon_insert` — every
   other access requires the service role, which only the server uses.

## 2. Resend (transactional email)

1. Create a Resend account and add `academydraughting.com` (or your domain).
2. Verify the DNS records.
3. Create an API key with `Send` permission and set:
   ```bash
   RESEND_API_KEY=re_...
   RESEND_FROM=admissions@academydraughting.com
   ADMISSIONS_INBOX=enroll@academydraughting.com
   ```
   The applicant receives a confirmation with a tracking link; `ADMISSIONS_INBOX`
   gets a separate internal alert with the application details.

## 3. WhatsApp Business Cloud API

1. Set up a WhatsApp Business Account in Meta Business Manager.
2. Add a phone number, get its Phone Number ID and a Permanent Access Token.
3. Create an approved template named (default) `application_received` with two
   body parameters: `{{1}}` first name, `{{2}}` short reference.
   Example body:
   > Hi {{1}}, we've received your draughting application. Reference: {{2}}.
   > Our admissions team will reply within one business day.
4. Set:
   ```bash
   WHATSAPP_PHONE_ID=...
   WHATSAPP_TOKEN=EAAJ...
   WHATSAPP_TEMPLATE_NAME=application_received
   ```

## 4. HubSpot CRM

1. Create a Private App with the CRM scopes
   `crm.objects.contacts.read` and `crm.objects.contacts.write`.
2. (Optional but recommended) add the custom contact properties:
   `aoad_programme`, `aoad_mode`, `aoad_campus`, `aoad_application_id`.
3. Set:
   ```bash
   HUBSPOT_PRIVATE_APP_TOKEN=pat-na1-...
   ```

## 5. Tracking-link signing

The application status page (`/apply/status/[token]`) reads a signed JWT.
Generate a long random secret and set it:

```bash
TRACKING_TOKEN_SECRET=$(openssl rand -base64 48)
```

Without this, tokens are signed with a development-only key that doesn't
survive a deploy — applicants would lose access to their tracking link.

## 6. Analytics

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=1234567890
```

These scripts only load **after** the visitor accepts cookies via the banner.

## Verifying the pipeline

After setting the env vars, restart the dev server (or redeploy) and submit a
test application. You should see, in this order:

1. A row in `public.applicants` (look up by email).
2. A row in `public.applications` linked by `applicant_id`.
3. An event in `public.events` with `name = 'application_submitted'`.
4. A confirmation email in the applicant's inbox.
5. An internal alert at `ADMISSIONS_INBOX`.
6. A WhatsApp template message to the applicant's phone.
7. A contact in HubSpot (existing or new) with the four custom properties set.

If anything in steps 4–7 fails, the submit still succeeds — failures are
isolated via `Promise.allSettled` so a flaky downstream never blocks an
applicant. Check the server logs for `[email]`, `[whatsapp]`, `[hubspot]`
warnings.

## Local development without integrations

If you don't set any of the above, you still get:

- Applications written to `.local-store/applications/*.json`
- Applicants deduped by lowercased email in `.local-store/applicants/*.json`
- Events appended to `.local-store/events.ndjson`
- A working tracking URL (`/apply/status/<token>`) signed with a dev secret
- Console logs for what email / WhatsApp / HubSpot calls *would* have made

The `.local-store/` directory is gitignored.

## Security notes

- The service-role key bypasses RLS. It must never appear in the browser
  bundle. It's only imported from `src/lib/supabase/server.ts`, which has
  `import 'server-only'` at the top so any accidental client import fails at
  build time.
- Documents go to a private Storage bucket. The browser uploads using a
  short-lived signed URL minted by the server — no Supabase credentials
  ever leave the server.
- The 10 MB upload size and MIME whitelist are enforced on the API route, not
  just the input element.
- POPIA Section 19 retention: the migration includes a comment marker for the
  90-day document purge job; implement as a Supabase scheduled function before
  going live.
