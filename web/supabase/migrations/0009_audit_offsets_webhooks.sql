-- Pass I: audit log, Resend delivery tracking, per-cohort offsets via
-- enrollments.starts_on + assignment release/due offsets. Idempotent.

-- ---------------------------------------------------------------------------
-- 1. audit_log — append-only record of sensitive operations.
--    Service-role inserts only. Admins read. No update / delete policies.
-- ---------------------------------------------------------------------------

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_email text,
  actor_role text,
  action text not null,
  entity_type text,
  entity_id text,
  details jsonb,
  ip text
);

create index if not exists audit_log_created_idx on public.audit_log (created_at desc);
create index if not exists audit_log_action_idx on public.audit_log (action, created_at desc);
create index if not exists audit_log_entity_idx on public.audit_log (entity_type, entity_id);

alter table public.audit_log enable row level security;

drop policy if exists "audit_log_admin_read" on public.audit_log;
create policy "audit_log_admin_read" on public.audit_log
  for select using (public.current_user_role() = 'admin');

-- No insert policy: only service-role writes (bypasses RLS).
-- No update/delete policies: log is append-only.

-- ---------------------------------------------------------------------------
-- 2. email_deliveries — Resend webhook events.
-- ---------------------------------------------------------------------------

create table if not exists public.email_deliveries (
  id uuid primary key default gen_random_uuid(),
  resend_id text,
  recipient text,
  subject text,
  event text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists email_deliveries_recipient_idx on public.email_deliveries (recipient, created_at desc);
create index if not exists email_deliveries_resend_id_idx on public.email_deliveries (resend_id);
create index if not exists email_deliveries_event_idx on public.email_deliveries (event, created_at desc);

alter table public.email_deliveries enable row level security;

drop policy if exists "email_deliveries_admin_read" on public.email_deliveries;
create policy "email_deliveries_admin_read" on public.email_deliveries
  for select using (public.current_user_role() = 'admin');

-- ---------------------------------------------------------------------------
-- 3. Per-cohort timing without a heavy cohorts table:
--    enrollments.starts_on  — the date this student's cohort began
--    assignments.release_offset_days / due_offset_days — relative timing
--    Effective release_at = enrollment.starts_on + release_offset_days
--    Effective due_at     = enrollment.starts_on + due_offset_days
--    Both fall back to assignment.due_at (absolute) if offsets are null.
-- ---------------------------------------------------------------------------

alter table public.enrollments
  add column if not exists starts_on date;

update public.enrollments
  set starts_on = enrolled_at::date
  where starts_on is null;

alter table public.assignments
  add column if not exists release_offset_days int,
  add column if not exists due_offset_days int;
