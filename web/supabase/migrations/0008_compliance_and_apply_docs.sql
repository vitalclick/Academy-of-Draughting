-- Pass H: POPIA compliance scaffolding + an upload-token on applications so
-- anonymous applicants can attach required documents at apply-time.
-- Idempotent: safe to re-run.

-- ---------------------------------------------------------------------------
-- 1. applications.upload_token — short-lived, opaque token issued by
--    /api/apply and used by /api/apply-upload to authorize anonymous
--    document uploads against a freshly-created application.
-- ---------------------------------------------------------------------------

alter table public.applications
  add column if not exists upload_token uuid default gen_random_uuid(),
  add column if not exists upload_token_expires_at timestamptz
    default (now() + interval '24 hours');

create index if not exists applications_upload_token_idx
  on public.applications (upload_token);

-- Backfill any prior rows so the column has a deterministic value.
update public.applications
  set upload_token = coalesce(upload_token, gen_random_uuid()),
      upload_token_expires_at = coalesce(upload_token_expires_at, now() + interval '1 hour')
  where upload_token is null;

-- ---------------------------------------------------------------------------
-- 2. data_deletion_requests — POPIA Section 24 right of erasure. Self-
--    service requests land here for admin processing.
-- ---------------------------------------------------------------------------

create table if not exists public.data_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text not null,
  reason text,
  status text not null default 'pending' check (status in ('pending','processing','completed','rejected')),
  requested_at timestamptz not null default now(),
  processed_at timestamptz,
  processed_by uuid references auth.users(id) on delete set null,
  processed_notes text,
  unique (user_id, status) deferrable initially deferred
);
-- Note: the unique(user_id, status) prevents a user from filing two pending
-- requests at the same time. Completed/rejected rows are kept for audit.

create index if not exists data_deletion_requests_status_idx
  on public.data_deletion_requests (status, requested_at);

alter table public.data_deletion_requests enable row level security;

drop policy if exists "deletion_requests_self_read" on public.data_deletion_requests;
create policy "deletion_requests_self_read" on public.data_deletion_requests
  for select using (user_id = auth.uid());

drop policy if exists "deletion_requests_self_insert" on public.data_deletion_requests;
create policy "deletion_requests_self_insert" on public.data_deletion_requests
  for insert with check (user_id = auth.uid());

drop policy if exists "deletion_requests_admin_read" on public.data_deletion_requests;
create policy "deletion_requests_admin_read" on public.data_deletion_requests
  for select using (public.current_user_role() = 'admin');

drop policy if exists "deletion_requests_admin_update" on public.data_deletion_requests;
create policy "deletion_requests_admin_update" on public.data_deletion_requests
  for update using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');
