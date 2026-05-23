-- Pass G: realtime publication for submissions + cohort progress RPC.
-- Idempotent: safe to re-run.

-- ---------------------------------------------------------------------------
-- 1. Add submissions to the supabase_realtime publication so authenticated
--    clients (admin/faculty) can subscribe to postgres_changes events.
--    The publication itself is managed by Supabase; we only add the table.
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'submissions'
     )
  then
    alter publication supabase_realtime add table public.submissions;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2. cohort_progress(course): per-call aggregate stats for an enrolled
--    student. Returns the student's totals + cohort context (size, average,
--    top, rank) without exposing other students' rows.
--    SECURITY DEFINER so the function can read submissions across the cohort
--    while keeping the caller bound to their own enrollment.
-- ---------------------------------------------------------------------------

create or replace function public.cohort_progress(course text)
returns json
language plpgsql stable security definer set search_path = public as $$
declare
  my_id uuid := auth.uid();
  enrolled boolean;
  result json;
begin
  if my_id is null then
    raise exception 'not_authenticated';
  end if;

  select exists (
    select 1 from public.enrollments
    where user_id = my_id and course_slug = course and status = 'active'
  ) into enrolled;
  if not enrolled then
    raise exception 'not_enrolled';
  end if;

  with course_assignments as (
    select a.id, a.max_score
    from public.assignments a
    join public.modules m on m.id = a.module_id
    where m.course_slug = course
  ),
  totals as (
    select coalesce(sum(max_score), 0)::int as max_possible,
           count(*)::int as assignment_count
    from course_assignments
  ),
  per_student as (
    select e.user_id,
           coalesce(sum(case when s.status = 'graded' then s.score end), 0)::int as score_total,
           count(*) filter (where s.status = 'graded')::int as graded_count
    from public.enrollments e
    left join public.submissions s
      on s.user_id = e.user_id
     and s.assignment_id in (select id from course_assignments)
    where e.course_slug = course and e.status = 'active'
    group by e.user_id
  ),
  ranked as (
    select user_id, score_total, graded_count,
           rank() over (order by score_total desc) as rank
    from per_student
  )
  select json_build_object(
    'cohort_size', (select count(*) from ranked),
    'my_score_total', coalesce((select score_total from ranked where user_id = my_id), 0),
    'my_graded_count', coalesce((select graded_count from ranked where user_id = my_id), 0),
    'my_rank', (select rank from ranked where user_id = my_id),
    'cohort_avg_score', coalesce(round(((select avg(score_total) from ranked))::numeric, 1), 0),
    'cohort_top_score', coalesce((select max(score_total) from ranked), 0),
    'max_possible', (select max_possible from totals),
    'assignment_count', (select assignment_count from totals)
  ) into result;

  return result;
end;
$$;

revoke all on function public.cohort_progress(text) from public;
grant execute on function public.cohort_progress(text) to authenticated;
