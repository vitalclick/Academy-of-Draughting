# Provisioning checklist

## Order of operations

1. **Meta WhatsApp Business** ⬅ start first (waits weeks for Meta review)
2. **Supabase** ⬅ critical, unblocks everything
3. **Anthropic** (Claude API)
4. **Resend** (transactional email — domain DNS propagation eats time)
5. **HubSpot** (CRM sync)
6. **Vercel** (deploy)

Skip steps you don't need. The app reads every integration through a
feature flag; missing keys mean that surface degrades to a safe stub.

---

## 1. Meta WhatsApp Business Cloud API

**Why first:** Meta verification can take 1–2 weeks. You can launch the
rest of the site without it; WhatsApp confirmations just become no-ops
until the keys land.

1. Go to <https://business.facebook.com/wa/manage> → "Get Started".
2. Create or pick a Meta Business Account; verify your business
   identity (CIPC docs for SA companies).
3. Add a WhatsApp Business Account → add a phone number → request a
   permanent access token (Settings → System Users → Generate Token,
   grant `whatsapp_business_messaging` + `whatsapp_business_management`).
4. Create an approved message template named `application_received`
   with two body parameters:
   - `{{1}}` first name
   - `{{2}}` short reference
   Suggested body:
   > Hi {{1}}, we've received your draughting application at the
   > Academy. Reference: {{2}}. Our admissions team will reply within
   > one business day. Reply STOP to opt out.
5. Once approved, collect:
   - `WHATSAPP_PHONE_ID` (the numeric Phone Number ID)
   - `WHATSAPP_TOKEN` (permanent access token, starts with `EAAJ…`)
   - `WHATSAPP_TEMPLATE_NAME=application_received`

---

## 2. Supabase

**Why critical:** without it, no applications are saved, no admin, no
content studio, no portal. Falls back to a local-fs stub which is fine
for dev but useless in prod.

1. <https://supabase.com> → New project. Pick the closest region —
   `ap-south-1` (Mumbai) is currently the fastest hop for SA users from
   Supabase's options.
2. Save the database password somewhere safe.
3. Settings → API → copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY` (NEVER paste
     this into a `NEXT_PUBLIC_*` slot)
4. SQL Editor → paste `deploy/supabase-cutover.sql` → Run.
5. Authentication → URL Configuration:
   - Site URL: `https://academydraughting.com`
   - Redirect URLs:
     - `https://academydraughting.com/admin/callback`
     - `https://academydraughting.com/portal/callback`
     - `https://<your-preview>.vercel.app/admin/callback`
     - `https://<your-preview>.vercel.app/portal/callback`
     - `http://localhost:3000/admin/callback` (dev)
     - `http://localhost:3000/portal/callback` (dev)
6. Authentication → Email Templates → tweak the magic-link template
   wording if you want it on Academy letterhead.
7. (Optional) Database → Extensions → enable `pg_cron`, then run:
   ```sql
   select cron.schedule(
     'purge-old-documents',
     '0 3 * * *',
     $$ select public.purge_old_documents(90) $$
   );
   ```

---

## 3. Anthropic (Claude API)

**Why third:** fastest to set up; unblocks AIDA, recommender, OCR, and the
Content Studio's AI drafts.

1. <https://console.anthropic.com> → sign up with the company email.
2. Billing → add a card and pick a soft monthly cap (start at $100/mo;
   the cost model in `docs/phase-3-setup.md` shows you what to expect).
3. Settings → API Keys → Create Key → copy:
   - `ANTHROPIC_API_KEY` (starts with `sk-ant-`)
4. (Optional overrides; sane defaults exist in `src/lib/env.ts`)
   - `ANTHROPIC_MODEL=claude-sonnet-4-6` (chat + content drafts)
   - `ANTHROPIC_OCR_MODEL=claude-haiku-4-5-20251001` (cheaper for vision)

---

## 4. Resend (transactional email)

**Why fourth:** domain verification needs DNS — start the records now so
they propagate while you do other things.

1. <https://resend.com> → sign up → create an organization.
2. Domains → Add Domain → `academydraughting.com`.
3. Copy the four DNS records Resend gives you (TXT + DKIM CNAMEs) and
   add them to your DNS provider. Propagation is usually <1h on
   Cloudflare, up to 24h elsewhere.
4. While DNS propagates: API Keys → Create → "Send only" → copy:
   - `RESEND_API_KEY` (starts with `re_`)
5. Once DNS verifies, set:
   - `RESEND_FROM=admissions@academydraughting.com`
   - `ADMISSIONS_INBOX=enroll@academydraughting.com`

---

## 5. HubSpot

**Why last:** the lead sync is best-effort; failures don't block
applications. You can launch without it and add it in a follow-up.

1. <https://app.hubspot.com> → Settings → Integrations → Private Apps.
2. Create app → "Academy Admissions Sync".
3. Scopes: tick `crm.objects.contacts.read` and
   `crm.objects.contacts.write`.
4. Create → copy:
   - `HUBSPOT_PRIVATE_APP_TOKEN` (starts with `pat-na1-…`)
5. (Optional but recommended) Settings → Properties → Contacts → add
   four custom properties so the synced data has somewhere to land:
   - `aoad_programme` (single-line text)
   - `aoad_mode` (single-line text)
   - `aoad_campus` (single-line text)
   - `aoad_application_id` (single-line text)

---

## 6. Tracking-token secret

Generate a long random string used to sign the application status JWT
and the data-rights confirmation JWT:

```bash
openssl rand -base64 48
```

Set as `TRACKING_TOKEN_SECRET`. **Rotating this invalidates every
tracking link and data-rights confirmation in flight** — document the
rotation in your ops runbook.

---

## 7. Admin allowlist

Before any admins are seeded in the database, the app bootstraps the first
sign-in via an env-var allowlist. Set:

```
ADMIN_EMAILS=ops@academydraughting.com,coo@academydraughting.com
```

On first sign-in via `/admin/login`, those users are auto-promoted into
the `admins` table with role `super`. Remove the env var after that.

---

## 8. Vercel

1. <https://vercel.com> → New Project → import the
   `vitalclick/academy-of-draughting` GitHub repo.
2. Framework Preset: Next.js (auto-detected).
3. Root Directory: `./` (default).
4. Environment Variables: paste from `deploy/vercel-env.md`. Tag each
   var with the environments it applies to (typically all three:
   Production, Preview, Development).
5. Deploy.
6. Once the first deploy is green, Settings → Domains → add
   `academydraughting.com` and follow the DNS instructions.
7. Make sure HSTS doesn't lock out staging — staging should be on a
   distinct hostname like `staging.academydraughting.com` or a
   `.vercel.app` URL.

---

## 9. Observability (optional but recommended)

Pick one and set `ERROR_SINK_URL`:

- **Sentry**: project → Settings → Client Keys → use the DSN as the URL
- **Slack**: Apps → Incoming Webhooks → use the webhook URL
- **Discord**: Channel → Edit Channel → Integrations → Webhooks
- **Custom**: any HTTPS endpoint that accepts JSON `{level, message,
  timestamp, env, context}`

`ERROR_SINK_TOKEN` is the optional bearer token if your endpoint needs it.

Then point an uptime monitor (UptimeRobot, BetterStack, Healthchecks.io —
all have free tiers) at:

```
https://academydraughting.com/api/health?check=ready
```

Polling every 30 seconds with an alert on 503 is the right cadence.
