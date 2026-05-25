-- Phase 9: payments / fees ledger
--
-- A lightweight billing ledger so staff can record fee payments against an
-- enrollment and track outstanding balances. There is no payment processor
-- integration yet — rows are entered by admins via the dashboard. Students
-- can read their own payment rows (for a future portal billing view).

set search_path = public;

create type payment_status as enum ('pending', 'paid', 'overdue', 'waived');

create table if not exists payments (
  id              uuid primary key default gen_random_uuid(),
  enrollment_id   uuid references enrollments(id) on delete set null,
  applicant_id    uuid references applicants(id) on delete set null,
  amount          numeric(12,2) not null,
  currency        text not null default 'ZAR',
  plan            text,                          -- 'Monthly 3/10', 'Upfront', …
  status          payment_status not null default 'pending',
  due_date        date,
  paid_at         timestamptz,
  note            text,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists payments_enrollment_idx on payments (enrollment_id);
create index if not exists payments_status_idx on payments (status, due_date);
create index if not exists payments_created_idx on payments (created_at desc);

create trigger payments_set_updated_at
  before update on payments
  for each row execute procedure set_updated_at();

-- ============================================================================
-- RLS — admins read+write everything; students read their own rows.
-- ============================================================================
alter table payments enable row level security;

create policy payments_admin_all on payments
  for all to authenticated
  using (is_admin())
  with check (is_admin());

create policy payments_student_read on payments
  for select to authenticated
  using (
    is_admin()
    or exists (
      select 1 from public.enrollments e
      where e.id = payments.enrollment_id
        and e.user_id = auth.uid()
    )
  );
