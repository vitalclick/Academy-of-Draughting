-- Pass D: submission storage bucket, storage RLS, auto-enroll on accept.
-- Idempotent: safe to re-run.

-- ---------------------------------------------------------------------------
-- 1. private storage bucket for submissions
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', false)
on conflict (id) do nothing;

-- Path convention: {user_id}/{assignment_id}/{timestamp}-{filename}
-- Owner-read: the first path segment must equal auth.uid().
drop policy if exists "submissions_storage_owner_read" on storage.objects;
create policy "submissions_storage_owner_read" on storage.objects
  for select using (
    bucket_id = 'submissions'
    and (
      (auth.uid()::text = (storage.foldername(name))[1])
      or public.current_user_role() = 'admin'
    )
  );

-- Owner-insert: students may upload only into their own prefix.
drop policy if exists "submissions_storage_owner_insert" on storage.objects;
create policy "submissions_storage_owner_insert" on storage.objects
  for insert with check (
    bucket_id = 'submissions'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Owner-update: replace own files. (Used if a student re-uploads.)
drop policy if exists "submissions_storage_owner_update" on storage.objects;
create policy "submissions_storage_owner_update" on storage.objects
  for update using (
    bucket_id = 'submissions'
    and auth.uid()::text = (storage.foldername(name))[1]
  ) with check (
    bucket_id = 'submissions'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ---------------------------------------------------------------------------
-- 2. auto-enroll trigger: when an application flips to 'accepted',
--    create a matching enrollment if one doesn't already exist.
-- ---------------------------------------------------------------------------

create or replace function public.handle_application_accepted()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'accepted'
     and coalesce(old.status, '') <> 'accepted'
     and new.user_id is not null then
    insert into public.enrollments (user_id, course_slug, cohort_label)
    values (new.user_id, new.course_slug, 'Auto-enrolled on application accept')
    on conflict (user_id, course_slug) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists applications_auto_enroll on public.applications;
create trigger applications_auto_enroll
  after update of status on public.applications
  for each row execute procedure public.handle_application_accepted();
