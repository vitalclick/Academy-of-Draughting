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
