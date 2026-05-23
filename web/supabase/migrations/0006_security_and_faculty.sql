-- Pass F: tighten submission RLS so students can't self-grade,
-- and grant the 'faculty' role write access to curriculum + grading.
-- Idempotent: safe to re-run.

-- ---------------------------------------------------------------------------
-- 1. helper: admin or faculty
-- ---------------------------------------------------------------------------

create or replace function public.is_admin_or_faculty()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','faculty')
  );
$$;

-- ---------------------------------------------------------------------------
-- 2. submissions: prevent students from self-grading
--    Owner update must keep score/feedback null and stay in draft/submitted.
-- ---------------------------------------------------------------------------

drop policy if exists "submissions_owner_update" on public.submissions;
create policy "submissions_owner_update" on public.submissions
  for update using (
    user_id = auth.uid() and status in ('draft','submitted')
  ) with check (
    user_id = auth.uid()
    and status in ('draft','submitted')
    and score is null
    and feedback is null
    and graded_at is null
  );

-- ---------------------------------------------------------------------------
-- 3. faculty role: same read/write rights as admin for curriculum + grading
--    (but NOT for applications, enrollments, profiles).
-- ---------------------------------------------------------------------------

-- modules
drop policy if exists "modules_faculty_read" on public.modules;
create policy "modules_faculty_read" on public.modules
  for select using (public.is_admin_or_faculty());

drop policy if exists "modules_faculty_write" on public.modules;
create policy "modules_faculty_write" on public.modules
  for all using (public.is_admin_or_faculty())
  with check (public.is_admin_or_faculty());

-- assignments
drop policy if exists "assignments_faculty_read" on public.assignments;
create policy "assignments_faculty_read" on public.assignments
  for select using (public.is_admin_or_faculty());

drop policy if exists "assignments_faculty_write" on public.assignments;
create policy "assignments_faculty_write" on public.assignments
  for all using (public.is_admin_or_faculty())
  with check (public.is_admin_or_faculty());

-- submissions: faculty may read all and update grades (same shape as admin).
drop policy if exists "submissions_faculty_read" on public.submissions;
create policy "submissions_faculty_read" on public.submissions
  for select using (public.is_admin_or_faculty());

drop policy if exists "submissions_faculty_update" on public.submissions;
create policy "submissions_faculty_update" on public.submissions
  for update using (public.is_admin_or_faculty())
  with check (public.is_admin_or_faculty());

-- enrollments: faculty can READ (needed to see who's in a cohort to grade),
-- but only admins can create/modify them.
drop policy if exists "enrollments_faculty_read" on public.enrollments;
create policy "enrollments_faculty_read" on public.enrollments
  for select using (public.is_admin_or_faculty());

-- profiles: faculty can READ (needed to see student names alongside enrollments).
drop policy if exists "profiles_faculty_read" on public.profiles;
create policy "profiles_faculty_read" on public.profiles
  for select using (public.is_admin_or_faculty());
