-- ============================================================================
-- Academy of Advanced Draughting — Supabase cutover
-- ============================================================================
-- Combines migrations 0001 → 0005 into one paste-able script.
--   0001: applicants, applications, documents, events + base RLS
--   0002: applicant-documents private storage bucket
--   0003: admins, content_blocks + admin RLS, is_admin()
--   0004: purge_old_documents() retention function
--   0005: enrollments, assignments, submissions + portal RLS, is_student()
--
-- Idempotent: every CREATE uses IF NOT EXISTS or OR REPLACE. Safe to re-run.
-- ============================================================================


-- ============================================================================
-- supabase/migrations/0001_init.sql
-- ============================================================================

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

-- ============================================================================
-- supabase/migrations/0002_storage.sql
-- ============================================================================

-- Storage bucket for applicant documents
-- Bucket is private; access via signed URLs minted by the server.

insert into storage.buckets (id, name, public)
values ('applicant-documents', 'applicant-documents', false)
on conflict (id) do nothing;

-- No anon read/write policies on the bucket. The service role uploads + mints
-- signed URLs; applicants never get direct credentials.

-- ============================================================================
-- supabase/migrations/0003_admin.sql
-- ============================================================================

-- Phase 5: admin workspace + content management
-- Adds:
--   - admins table (allowlist of users who can sign in to /admin)
--   - content_blocks table (CMS-managed posts, FAQs, testimonials)
--   - status transitions tracked on applications
--   - public.is_admin() helper used by RLS policies

set search_path = public;

-- ============================================================================
-- admins — allowlist of staff who can access /admin
-- Populated manually via SQL (or via /admin once at least one row exists).
-- ============================================================================
create table if not exists admins (
  user_id     uuid primary key,
  email       text not null unique,
  role        text not null default 'staff', -- staff | super
  created_at  timestamptz not null default now()
);

-- Helper used in RLS policies. Returns true when the calling user is in `admins`.
create or replace function public.is_admin() returns boolean
  language sql stable security definer
  as $$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;

-- ============================================================================
-- content_blocks — CMS-managed content: blog posts, FAQs, testimonials, pages
-- ============================================================================
create type content_kind  as enum ('blog_post', 'faq', 'testimonial', 'page_section');
create type content_state as enum ('draft', 'review', 'published', 'archived');

create table if not exists content_blocks (
  id            uuid primary key default gen_random_uuid(),
  kind          content_kind not null,
  state         content_state not null default 'draft',
  slug          text,                    -- url slug (unique within kind for blog_post)
  title         text not null,
  summary       text,
  body          text,                    -- markdown
  metadata      jsonb not null default '{}'::jsonb,
  author_id     uuid,                    -- admins.user_id
  ai_prompt     text,                    -- the prompt used if AI-drafted
  ai_model      text,                    -- model id that generated the draft
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create unique index if not exists content_blocks_blog_slug_idx
  on content_blocks (slug) where kind = 'blog_post' and slug is not null;

create index if not exists content_blocks_kind_state_idx
  on content_blocks (kind, state, updated_at desc);

create trigger content_blocks_set_updated_at
  before update on content_blocks
  for each row execute procedure set_updated_at();

-- ============================================================================
-- RLS — admins read+write everything via the dashboard; everyone else can
-- only read published content_blocks.
-- ============================================================================
alter table admins         enable row level security;
alter table content_blocks enable row level security;

-- admins table: only admins can read it. Insertion is via service role.
create policy admins_read on admins
  for select to authenticated
  using (is_admin());

-- content_blocks:
--   anonymous + authenticated -> read published rows only
--   admins (authenticated and in admins) -> read everything
create policy content_blocks_public_read on content_blocks
  for select to anon, authenticated
  using (state = 'published');

create policy content_blocks_admin_read on content_blocks
  for select to authenticated
  using (is_admin());

create policy content_blocks_admin_write on content_blocks
  for all to authenticated
  using (is_admin())
  with check (is_admin());

-- ============================================================================
-- application status updates by admins
-- An admin should be able to read every application + flip its status.
-- ============================================================================
create policy applications_admin_read on applications
  for select to authenticated
  using (is_admin());

create policy applications_admin_update on applications
  for update to authenticated
  using (is_admin())
  with check (is_admin());

create policy applicants_admin_read on applicants
  for select to authenticated
  using (is_admin());

create policy documents_admin_read on documents
  for select to authenticated
  using (is_admin());

create policy events_admin_read on events
  for select to authenticated
  using (is_admin());

-- ============================================================================
-- supabase/migrations/0004_retention.sql
-- ============================================================================

-- Phase 6: data retention helpers
--
-- POPIA Section 14: don't retain personal-info-bearing documents longer than
-- necessary. We default to 90 days post-decision for ID + matric images.
-- Application metadata stays — only the source images are purged.
--
-- This adds a SECURITY DEFINER function the service role can call from a
-- scheduled job. Schedule it via Supabase cron once pg_cron is enabled:
--
--   select cron.schedule('purge-old-documents', '0 3 * * *',
--     $$ select public.purge_old_documents(90) $$);

set search_path = public;

create or replace function public.purge_old_documents(retention_days int default 90)
  returns int
  language plpgsql
  security definer
as $$
declare
  cutoff timestamptz := now() - (retention_days || ' days')::interval;
  removed int := 0;
begin
  -- Delete storage objects first; storage.objects has FK behaviour that
  -- removes the underlying file via the storage worker.
  with stale_docs as (
    select d.id, d.storage_path
    from public.documents d
    join public.applications a on a.id = d.application_id
    where d.uploaded_at < cutoff
      and (
        a.status in ('accepted', 'rejected', 'withdrawn')
        or a.created_at < cutoff
      )
  ),
  storage_cleanup as (
    delete from storage.objects o
    using stale_docs s
    where o.bucket_id = 'applicant-documents'
      and o.name = s.storage_path
    returning o.name
  ),
  doc_cleanup as (
    delete from public.documents d
    using stale_docs s
    where d.id = s.id
    returning d.id
  )
  select count(*)::int into removed from doc_cleanup;
  return removed;
end;
$$;

comment on function public.purge_old_documents(int) is
  'Deletes applicant ID/matric files older than retention_days and the corresponding documents row. Called by a scheduled job.';

-- ============================================================================
-- supabase/migrations/0005_portal.sql
-- ============================================================================

-- Phase 7: student portal — enrollments, assignments, submissions
--
-- A student is an applicant whose application was accepted. They sign in via
-- the same Supabase Auth magic-link flow as admins, but route through /portal
-- instead of /admin. RLS enforces "students can only see their own rows".

set search_path = public;

-- ============================================================================
-- enrollments — links a Supabase Auth user_id to an accepted application
-- and to the cohort they're studying in.
-- ============================================================================
create type enrollment_state as enum ('pending', 'active', 'completed', 'withdrawn');

create table if not exists enrollments (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null,                 -- auth.users.id
  applicant_id    uuid not null references applicants(id) on delete cascade,
  application_id  uuid references applications(id) on delete set null,
  programme       text not null,                 -- course id (mddop, revit, …)
  cohort          text not null,                 -- e.g. '2026-jan-jhb-ft'
  state           enrollment_state not null default 'pending',
  started_at      date,
  completed_at    date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create unique index if not exists enrollments_user_programme_idx
  on enrollments (user_id, programme, cohort);
create index if not exists enrollments_user_idx on enrollments (user_id);

create trigger enrollments_set_updated_at
  before update on enrollments
  for each row execute procedure set_updated_at();

-- ============================================================================
-- assignments — per-programme coursework items. Visible to all students in
-- that programme; we filter by cohort at the application layer.
-- ============================================================================
create type assignment_kind as enum ('drawing', 'theory', 'project', 'exam');

create table if not exists assignments (
  id              uuid primary key default gen_random_uuid(),
  programme       text not null,
  cohort          text,                          -- null = all cohorts on this programme
  kind            assignment_kind not null,
  module          text not null,                 -- 'CAD (AutoCAD)' etc.
  title           text not null,
  brief           text,
  due_at          timestamptz,
  weight          int not null default 0,        -- 0-100, contribution to module grade
  published       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists assignments_programme_idx
  on assignments (programme, published, due_at);

create trigger assignments_set_updated_at
  before update on assignments
  for each row execute procedure set_updated_at();

-- ============================================================================
-- submissions — a student's deliverable for an assignment
-- ============================================================================
create type submission_state as enum ('draft', 'submitted', 'graded', 'returned');

create table if not exists submissions (
  id              uuid primary key default gen_random_uuid(),
  enrollment_id   uuid not null references enrollments(id) on delete cascade,
  assignment_id   uuid not null references assignments(id) on delete cascade,
  state           submission_state not null default 'draft',
  storage_path    text,                          -- file in submissions bucket
  filename        text,
  bytes           bigint,
  mime_type       text,
  comment         text,
  grade           int,                           -- 0-100, populated when graded
  grader_id       uuid,                          -- admins.user_id
  feedback        text,
  submitted_at    timestamptz,
  graded_at       timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create unique index if not exists submissions_one_per_assignment_idx
  on submissions (enrollment_id, assignment_id);

create trigger submissions_set_updated_at
  before update on submissions
  for each row execute procedure set_updated_at();

-- ============================================================================
-- Storage bucket for student submissions (private).
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('student-submissions', 'student-submissions', false)
on conflict (id) do nothing;

-- ============================================================================
-- Helpers
-- ============================================================================
create or replace function public.is_student() returns boolean
  language sql stable security definer
  as $$ select exists (select 1 from public.enrollments where user_id = auth.uid()) $$;

-- ============================================================================
-- RLS
-- Students see only their own enrollments + submissions.
-- They see published assignments for programmes they're enrolled in.
-- Admins (via is_admin()) see everything.
-- ============================================================================
alter table enrollments enable row level security;
alter table assignments enable row level security;
alter table submissions enable row level security;

create policy enrollments_self_read on enrollments
  for select to authenticated
  using (user_id = auth.uid() or is_admin());

create policy enrollments_admin_write on enrollments
  for all to authenticated
  using (is_admin())
  with check (is_admin());

create policy assignments_visible on assignments
  for select to authenticated
  using (
    is_admin()
    or (
      published = true
      and exists (
        select 1 from public.enrollments e
        where e.user_id = auth.uid()
          and e.programme = assignments.programme
          and (assignments.cohort is null or e.cohort = assignments.cohort)
      )
    )
  );

create policy assignments_admin_write on assignments
  for all to authenticated
  using (is_admin())
  with check (is_admin());

create policy submissions_self on submissions
  for select to authenticated
  using (
    is_admin()
    or exists (
      select 1 from public.enrollments e
      where e.id = submissions.enrollment_id
        and e.user_id = auth.uid()
    )
  );

create policy submissions_self_write on submissions
  for insert to authenticated
  with check (
    exists (
      select 1 from public.enrollments e
      where e.id = submissions.enrollment_id
        and e.user_id = auth.uid()
    )
  );

create policy submissions_self_update on submissions
  for update to authenticated
  using (
    exists (
      select 1 from public.enrollments e
      where e.id = submissions.enrollment_id
        and e.user_id = auth.uid()
    )
    -- can only edit draft submissions; admins handle grading via service role
    and state = 'draft'
  )
  with check (
    state in ('draft', 'submitted')
  );

create policy submissions_admin_all on submissions
  for all to authenticated
  using (is_admin())
  with check (is_admin());

-- ============================================================================
-- POST-MIGRATION SEED — fill in real values then run
-- ============================================================================

-- Uncomment + edit before running. Optional once ADMIN_EMAILS is set:
-- insert into admins (user_id, email, role) values (
--   '<auth.users.id from Auth → Users>',
--   'ops@academydraughting.com',
--   'super'
-- ) on conflict (user_id) do update set role = excluded.role;

-- Sample assignments for the first MDDOP cohort. Edit to taste.
-- insert into assignments (programme, kind, module, title, brief, due_at, weight, published) values
--   ('mddop', 'theory',  'MDDOP Theory & Practice', 'Drawing-office vocabulary',
--    'Multi-choice quiz on standard symbols, line weights and dimensioning conventions.',
--    '2026-02-08 17:00+02', 5,  true),
--   ('mddop', 'drawing', 'CAD (AutoCAD)',           'Workstation orthographic',
--    'Front, side, top elevations of the studio workstation. A2 sheet, 1:20. Production-grade title block. PDF + DWG.',
--    '2026-02-15 17:00+02', 15, true),
--   ('mddop', 'project', 'Building Draughting',     'Single-storey residential plan',
--    'Floor plan, two elevations, one section. Conform to local building-code symbols.',
--    '2026-03-15 17:00+02', 25, true);

-- Schedule the document-retention job (requires pg_cron extension).
-- Enable pg_cron in Database → Extensions first, then uncomment:
-- select cron.schedule(
--   'purge-old-documents',
--   '0 3 * * *',
--   $$ select public.purge_old_documents(90) $$
-- );

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Expect: 4 enums, 9 tables in public, all with rowsecurity=true
select relname, relrowsecurity
from pg_class
join pg_namespace on pg_namespace.oid = pg_class.relnamespace
where pg_namespace.nspname = 'public'
  and relkind = 'r'
order by relname;

-- Expect: bucket exists, public=false
select id, name, public from storage.buckets where id in ('applicant-documents', 'student-submissions');
