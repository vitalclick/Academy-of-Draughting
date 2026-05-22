-- Phase 2: Smart Enrollment schema
-- All applicant-facing tables are owned by the service role.
-- Anonymous applicants can INSERT into applications but cannot read each other.
-- Authenticated applicants (future: magic link) can read/update their own row.

set search_path = public;

create extension if not exists pgcrypto;

-- ============================================================================
-- applicants — one row per natural person; deduplicated by lowercased email
-- ============================================================================
create table if not exists applicants (
  id              uuid primary key default gen_random_uuid(),
  email           text not null unique,
  first_name      text,
  last_name       text,
  phone           text,
  city            text,
  id_number       text,            -- SA ID (encrypted at rest by Supabase TDE)
  matric_year     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists applicants_email_idx on applicants (lower(email));

-- ============================================================================
-- applications — one row per submitted/draft application
-- Status flow: draft -> submitted -> under_review -> (accepted | rejected | withdrawn)
-- ============================================================================
create type application_status as enum (
  'draft',
  'submitted',
  'under_review',
  'accepted',
  'rejected',
  'withdrawn'
);

create table if not exists applications (
  id              uuid primary key default gen_random_uuid(),
  applicant_id    uuid not null references applicants(id) on delete cascade,
  status          application_status not null default 'draft',
  programme       text not null,
  mode            text not null,
  campus          text not null,
  funding_plan    text not null,
  intake          text,
  submitted_at    timestamptz,
  decided_at      timestamptz,
  draft_payload   jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists applications_applicant_idx on applications (applicant_id);
create index if not exists applications_status_idx on applications (status);

-- ============================================================================
-- documents — references to files in Supabase Storage
-- ============================================================================
create type document_kind as enum ('id', 'matric', 'cv', 'other');

create table if not exists documents (
  id              uuid primary key default gen_random_uuid(),
  application_id  uuid not null references applications(id) on delete cascade,
  kind            document_kind not null,
  filename        text not null,
  storage_path    text not null,
  bytes           bigint not null,
  mime_type       text,
  ocr_payload     jsonb,
  uploaded_at     timestamptz not null default now()
);

create index if not exists documents_application_idx on documents (application_id);

-- ============================================================================
-- events — funnel + analytics events (deliberately denormalised)
-- ============================================================================
create table if not exists events (
  id              bigserial primary key,
  occurred_at     timestamptz not null default now(),
  name            text not null,
  applicant_id    uuid,
  application_id  uuid,
  anonymous_id    text,
  session_id      text,
  payload         jsonb not null default '{}'::jsonb
);

create index if not exists events_name_idx on events (name, occurred_at desc);
create index if not exists events_applicant_idx on events (applicant_id);

-- ============================================================================
-- updated_at triggers
-- ============================================================================
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger applicants_set_updated_at
  before update on applicants
  for each row execute procedure set_updated_at();

create trigger applications_set_updated_at
  before update on applications
  for each row execute procedure set_updated_at();

-- ============================================================================
-- Row-level security
-- The service role bypasses RLS entirely — server actions use it.
-- The anon role can only INSERT into events (client-side funnel tracking).
-- ============================================================================
alter table applicants    enable row level security;
alter table applications  enable row level security;
alter table documents     enable row level security;
alter table events        enable row level security;

-- Anonymous funnel events: allow insert from the browser, no reads
create policy events_anon_insert on events
  for insert to anon
  with check (true);

-- No anon access to applicants/applications/documents — server only.
-- (No policies = deny by default once RLS is enabled.)
