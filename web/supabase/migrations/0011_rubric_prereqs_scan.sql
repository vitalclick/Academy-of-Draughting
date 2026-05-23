-- Pass K: rubric grading, assignment prerequisites, file scan status.
-- Idempotent: safe to re-run.

-- ---------------------------------------------------------------------------
-- 1. Rubric grading
--    rubric_criteria define per-assignment scoring rows; a submission's
--    per-criterion scores live in submission_criterion_scores. When an
--    assignment has criteria, the total score = sum(points). Assignments
--    without criteria keep using the single submissions.score field.
-- ---------------------------------------------------------------------------

create table if not exists public.rubric_criteria (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  label text not null,
  description text,
  max_points int not null check (max_points > 0 and max_points <= 1000),
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists rubric_criteria_assignment_idx
  on public.rubric_criteria (assignment_id, order_index);

alter table public.rubric_criteria enable row level security;

drop policy if exists "rubric_staff_read" on public.rubric_criteria;
create policy "rubric_staff_read" on public.rubric_criteria
  for select using (public.is_admin_or_faculty());

drop policy if exists "rubric_enrolled_read" on public.rubric_criteria;
create policy "rubric_enrolled_read" on public.rubric_criteria
  for select using (
    exists (
      select 1 from public.assignments a
      join public.modules m on m.id = a.module_id
      where a.id = rubric_criteria.assignment_id and public.is_enrolled(m.course_slug)
    )
  );

drop policy if exists "rubric_staff_write" on public.rubric_criteria;
create policy "rubric_staff_write" on public.rubric_criteria
  for all using (public.is_admin_or_faculty())
  with check (public.is_admin_or_faculty());

create table if not exists public.submission_criterion_scores (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  criterion_id uuid not null references public.rubric_criteria(id) on delete cascade,
  points int not null check (points >= 0),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (submission_id, criterion_id)
);

create index if not exists submission_criterion_scores_sub_idx
  on public.submission_criterion_scores (submission_id);

alter table public.submission_criterion_scores enable row level security;

-- Students read scores for their own submissions.
drop policy if exists "criterion_scores_owner_read" on public.submission_criterion_scores;
create policy "criterion_scores_owner_read" on public.submission_criterion_scores
  for select using (
    exists (
      select 1 from public.submissions s
      where s.id = submission_criterion_scores.submission_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "criterion_scores_staff_read" on public.submission_criterion_scores;
create policy "criterion_scores_staff_read" on public.submission_criterion_scores
  for select using (public.is_admin_or_faculty());

drop policy if exists "criterion_scores_staff_write" on public.submission_criterion_scores;
create policy "criterion_scores_staff_write" on public.submission_criterion_scores
  for all using (public.is_admin_or_faculty())
  with check (public.is_admin_or_faculty());

drop trigger if exists criterion_scores_set_updated_at on public.submission_criterion_scores;
create trigger criterion_scores_set_updated_at
  before update on public.submission_criterion_scores
  for each row execute procedure public.tg_set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. Assignment prerequisites
--    A student must have a graded submission for every prerequisite before
--    the dependent assignment unlocks. Enforced server-side on submit and
--    surfaced in the portal.
-- ---------------------------------------------------------------------------

create table if not exists public.assignment_prerequisites (
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  prerequisite_id uuid not null references public.assignments(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (assignment_id, prerequisite_id),
  check (assignment_id <> prerequisite_id)
);

create index if not exists assignment_prereqs_assignment_idx
  on public.assignment_prerequisites (assignment_id);

alter table public.assignment_prerequisites enable row level security;

drop policy if exists "prereqs_staff_read" on public.assignment_prerequisites;
create policy "prereqs_staff_read" on public.assignment_prerequisites
  for select using (public.is_admin_or_faculty());

drop policy if exists "prereqs_enrolled_read" on public.assignment_prerequisites;
create policy "prereqs_enrolled_read" on public.assignment_prerequisites
  for select using (
    exists (
      select 1 from public.assignments a
      join public.modules m on m.id = a.module_id
      where a.id = assignment_prerequisites.assignment_id and public.is_enrolled(m.course_slug)
    )
  );

drop policy if exists "prereqs_staff_write" on public.assignment_prerequisites;
create policy "prereqs_staff_write" on public.assignment_prerequisites
  for all using (public.is_admin_or_faculty())
  with check (public.is_admin_or_faculty());

-- ---------------------------------------------------------------------------
-- 3. File scan status (antivirus)
--    Set to 'pending' on upload; a scanner worker (or inline hook) flips it
--    to clean/infected/skipped/error. Submissions + application documents.
-- ---------------------------------------------------------------------------

alter table public.submissions
  add column if not exists scan_status text not null default 'pending'
    check (scan_status in ('pending','clean','infected','skipped','error'));

alter table public.application_documents
  add column if not exists scan_status text not null default 'pending'
    check (scan_status in ('pending','clean','infected','skipped','error'));
