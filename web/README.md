# Academy of Advanced Draughting — Web

Next.js 14 (App Router) + TypeScript + Tailwind + Anthropic + Supabase.

## Quickstart

```bash
cd web
npm install
cp .env.example .env.local   # fill in keys
npm run dev
```

Open http://localhost:3000.

## Stack

- **Next.js 14** App Router, React Server Components by default
- **TypeScript** strict
- **Tailwind** — design tokens (navy + electric blue + cyan) live in `tailwind.config.ts`; component utilities in `app/globals.css`
- **Anthropic SDK** — AIDA chat at `POST /api/aida`, model `claude-sonnet-4-6`
- **Supabase** — applications stored via `POST /api/apply` using the service role key (server only)
- **react-hook-form + zod** — form state + validation

## Project layout

```
app/
  layout.tsx          Root layout: header, footer, AIDA chat
  page.tsx            Home (Hero + AI features + Courses + Career Intel + Outcomes)
  about/              About page
  courses/            Course catalogue
  apply/              Multi-field application form (client component)
  portal/             Student portal preview
  api/aida/route.ts   Claude-backed chat
  api/apply/route.ts  Supabase insert
components/           Composable UI (Hero, CareerIntel, ApplyForm, Aida, …)
data/                 Typed content — courses, career intel
lib/                  Anthropic + Supabase clients
supabase/migrations/  SQL for applications table
```

## AIDA prompt

The system prompt lives in `lib/anthropic.ts`. It explicitly tells the model not to invent fees, dates, or accreditation numbers, and to keep replies under ~120 words with a next-step question.

## Supabase setup

1. Create a project at supabase.com
2. Run `supabase/migrations/0001_applications.sql` in the SQL editor
3. Paste `SUPABASE_URL` and the **service role** key into `.env.local` (server only — never expose to the browser)

## Migration from the old prototype

The original Babel-in-browser prototype lives in `../UI_Design/`. Treat it as a design reference — pages here re-implement the same sections in React Server Components with proper tooling. The single hold-out is the AIDA widget and the Career Intel dashboard, which need client interactivity and use `"use client"`.
