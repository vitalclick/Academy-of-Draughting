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
