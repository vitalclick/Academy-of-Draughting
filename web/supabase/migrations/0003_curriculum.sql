-- Pass C: curriculum schema — modules, enrollments, assignments, submissions.
-- Idempotent: safe to re-run.

-- ---------------------------------------------------------------------------
-- 1. modules: curriculum units scoped to a course (matches courses.ts slugs)
-- ---------------------------------------------------------------------------

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_slug text not null,
  title text not null,
  description text,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists modules_course_idx on public.modules (course_slug, order_index);

alter table public.modules enable row level security;

-- ---------------------------------------------------------------------------
-- 2. enrollments: which students are in which course
-- ---------------------------------------------------------------------------

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  cohort_label text,
  status text not null default 'active' check (status in ('active','completed','withdrawn')),
  enrolled_at timestamptz not null default now(),
  unique (user_id, course_slug)
);

create index if not exists enrollments_user_idx on public.enrollments (user_id);
create index if not exists enrollments_course_idx on public.enrollments (course_slug);

alter table public.enrollments enable row level security;

-- ---------------------------------------------------------------------------
-- 3. assignments: work attached to a module
-- ---------------------------------------------------------------------------

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  description text,
  due_at timestamptz,
  max_score int not null default 100,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists assignments_module_idx on public.assignments (module_id, order_index);

alter table public.assignments enable row level security;

-- ---------------------------------------------------------------------------
-- 4. submissions: a student's work for an assignment (one per pair)
-- ---------------------------------------------------------------------------

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft','submitted','graded','returned')),
  storage_path text,
  notes text,
  score int,
  feedback text,
  submitted_at timestamptz,
  graded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assignment_id, user_id)
);

create index if not exists submissions_user_idx on public.submissions (user_id);
create index if not exists submissions_assignment_idx on public.submissions (assignment_id);

alter table public.submissions enable row level security;

-- ---------------------------------------------------------------------------
-- 5. helper: is the current user enrolled in this course?
-- ---------------------------------------------------------------------------

create or replace function public.is_enrolled(course text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.enrollments
    where user_id = auth.uid() and course_slug = course and status = 'active'
  );
$$;

-- ---------------------------------------------------------------------------
-- 6. RLS policies
-- ---------------------------------------------------------------------------

-- modules: visible to admins; visible to students enrolled in that course.
drop policy if exists "modules_admin_read" on public.modules;
create policy "modules_admin_read" on public.modules
  for select using (public.current_user_role() = 'admin');

drop policy if exists "modules_enrolled_read" on public.modules;
create policy "modules_enrolled_read" on public.modules
  for select using (public.is_enrolled(course_slug));

drop policy if exists "modules_admin_write" on public.modules;
create policy "modules_admin_write" on public.modules
  for all using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- enrollments: students read their own; admins read/write all.
drop policy if exists "enrollments_self_read" on public.enrollments;
create policy "enrollments_self_read" on public.enrollments
  for select using (user_id = auth.uid());

drop policy if exists "enrollments_admin_read" on public.enrollments;
create policy "enrollments_admin_read" on public.enrollments
  for select using (public.current_user_role() = 'admin');

drop policy if exists "enrollments_admin_write" on public.enrollments;
create policy "enrollments_admin_write" on public.enrollments
  for all using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- assignments: admins always; students only if enrolled in the module's course.
drop policy if exists "assignments_admin_read" on public.assignments;
create policy "assignments_admin_read" on public.assignments
  for select using (public.current_user_role() = 'admin');

drop policy if exists "assignments_enrolled_read" on public.assignments;
create policy "assignments_enrolled_read" on public.assignments
  for select using (
    exists (
      select 1 from public.modules m
      where m.id = assignments.module_id and public.is_enrolled(m.course_slug)
    )
  );

drop policy if exists "assignments_admin_write" on public.assignments;
create policy "assignments_admin_write" on public.assignments
  for all using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- submissions: student RW their own; admin read all + update score/feedback.
drop policy if exists "submissions_owner_read" on public.submissions;
create policy "submissions_owner_read" on public.submissions
  for select using (user_id = auth.uid());

drop policy if exists "submissions_owner_insert" on public.submissions;
create policy "submissions_owner_insert" on public.submissions
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.assignments a
      join public.modules m on m.id = a.module_id
      where a.id = submissions.assignment_id and public.is_enrolled(m.course_slug)
    )
  );

drop policy if exists "submissions_owner_update" on public.submissions;
create policy "submissions_owner_update" on public.submissions
  for update using (user_id = auth.uid() and status in ('draft','submitted'))
  with check (user_id = auth.uid());

drop policy if exists "submissions_admin_read" on public.submissions;
create policy "submissions_admin_read" on public.submissions
  for select using (public.current_user_role() = 'admin');

drop policy if exists "submissions_admin_update" on public.submissions;
create policy "submissions_admin_update" on public.submissions
  for update using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- ---------------------------------------------------------------------------
-- 7. updated_at trigger for submissions
-- ---------------------------------------------------------------------------

create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists submissions_set_updated_at on public.submissions;
create trigger submissions_set_updated_at
  before update on public.submissions
  for each row execute procedure public.tg_set_updated_at();

-- ---------------------------------------------------------------------------
-- 8. Seed: demo cohort for the flagship course (mddop-n4-n5)
--    Stable UUIDs so re-running this migration doesn't create duplicates.
-- ---------------------------------------------------------------------------

insert into public.modules (id, course_slug, title, description, order_index) values
  ('11111111-1111-4111-8111-000000000001', 'mddop-n4-n5',
   'Module 1 · Drawing Office Foundations',
   'ISO 128/129, line work, lettering, layout standards. The non-negotiables every draughtsperson knows cold.',
   1),
  ('11111111-1111-4111-8111-000000000002', 'mddop-n4-n5',
   'Module 2 · Orthographic & Sectioning',
   'First-angle projection, auxiliary views, full/half/offset sectioning. Reading and producing detail drawings.',
   2),
  ('11111111-1111-4111-8111-000000000003', 'mddop-n4-n5',
   'Module 3 · GD&T and Tolerancing',
   'ASME Y14.5 fundamentals — datums, feature control frames, MMC/LMC. Tolerance stack-ups.',
   3),
  ('11111111-1111-4111-8111-000000000004', 'mddop-n4-n5',
   'Module 4 · Assemblies & BOM',
   'Assembly drawings, item bubbles, balloons, parts lists, revision control. Working from a real engineering brief.',
   4)
on conflict (id) do nothing;

insert into public.assignments (id, module_id, title, description, due_at, max_score, order_index) values
  ('22222222-2222-4222-8222-000000000001',
   '11111111-1111-4111-8111-000000000001',
   'A1.1 · Title Block & Layout',
   'Produce an A3 sheet with a compliant ISO title block, border, and revision table. Submit as PDF.',
   now() + interval '7 days', 100, 1),
  ('22222222-2222-4222-8222-000000000002',
   '11111111-1111-4111-8111-000000000001',
   'A1.2 · Line Conventions Exercise',
   'Twelve-line worksheet demonstrating visible, hidden, centre, phantom, break, and section lines per ISO 128.',
   now() + interval '14 days', 50, 2),
  ('22222222-2222-4222-8222-000000000003',
   '11111111-1111-4111-8111-000000000002',
   'A2.1 · Three-View Bracket',
   'Front, top, and right-side views of the supplied bracket. Full dimensioning, no GD&T yet.',
   now() + interval '21 days', 100, 1),
  ('22222222-2222-4222-8222-000000000004',
   '11111111-1111-4111-8111-000000000003',
   'A3.1 · Datum Reference Frame',
   'Apply a primary/secondary/tertiary datum scheme to the supplied housing. Justify your choice in 200 words.',
   now() + interval '28 days', 100, 1),
  ('22222222-2222-4222-8222-000000000005',
   '11111111-1111-4111-8111-000000000004',
   'A4.1 · Five-Part Assembly',
   'Full assembly drawing of the gearbox-mount sub-assembly with BOM, balloons, and a section through the bearing seat.',
   now() + interval '42 days', 150, 1)
on conflict (id) do nothing;
