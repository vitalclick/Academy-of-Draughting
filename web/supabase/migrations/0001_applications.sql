-- Applications table for the admissions form.
-- Run in Supabase SQL editor or via `supabase db push`.

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  phone text not null,
  course_slug text not null,
  study_mode text not null check (study_mode in ('full-time','evening','online')),
  prev_qualification text,
  notes text,
  status text not null default 'received' check (status in ('received','reviewing','accepted','rejected','withdrawn'))
);

create index if not exists applications_email_idx on public.applications (email);
create index if not exists applications_course_idx on public.applications (course_slug);
create index if not exists applications_status_idx on public.applications (status);

-- Tighten RLS: server-side service role bypasses; anon/auth cannot read.
alter table public.applications enable row level security;
