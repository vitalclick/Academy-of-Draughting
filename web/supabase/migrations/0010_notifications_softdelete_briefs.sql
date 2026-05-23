-- Pass J: soft-delete on curriculum tables, in-app notifications,
-- AI conversation history, assignment brief attachments, late-penalty config.
-- Idempotent: safe to re-run.

-- ---------------------------------------------------------------------------
-- 1. Soft delete on curriculum tables
--    Prevents the "faculty fat-fingers Delete Module → all student work gone"
--    failure mode. Reads filter `deleted_at is null` at the application layer.
-- ---------------------------------------------------------------------------

alter table public.modules add column if not exists deleted_at timestamptz;
alter table public.assignments add column if not exists deleted_at timestamptz;

create index if not exists modules_active_idx
  on public.modules (course_slug, order_index)
  where deleted_at is null;
create index if not exists assignments_active_idx
  on public.assignments (module_id, order_index)
  where deleted_at is null;

-- ---------------------------------------------------------------------------
-- 2. Assignment brief attachments + late-penalty config
-- ---------------------------------------------------------------------------

alter table public.assignments
  add column if not exists brief_storage_path text,
  add column if not exists late_penalty_pct_per_day int default 0 check (late_penalty_pct_per_day between 0 and 100),
  add column if not exists late_grace_days int default 0 check (late_grace_days >= 0);

-- A public bucket for assignment briefs (small PDFs/images, classroom-grade
-- material, not student-private). Read is open; writes are admin/faculty.
insert into storage.buckets (id, name, public)
values ('assignment-briefs', 'assignment-briefs', true)
on conflict (id) do nothing;

drop policy if exists "briefs_public_read" on storage.objects;
create policy "briefs_public_read" on storage.objects
  for select using (bucket_id = 'assignment-briefs');

drop policy if exists "briefs_staff_write" on storage.objects;
create policy "briefs_staff_write" on storage.objects
  for insert with check (
    bucket_id = 'assignment-briefs' and public.is_admin_or_faculty()
  );

drop policy if exists "briefs_staff_update" on storage.objects;
create policy "briefs_staff_update" on storage.objects
  for update using (
    bucket_id = 'assignment-briefs' and public.is_admin_or_faculty()
  ) with check (
    bucket_id = 'assignment-briefs' and public.is_admin_or_faculty()
  );

drop policy if exists "briefs_staff_delete" on storage.objects;
create policy "briefs_staff_delete" on storage.objects
  for delete using (
    bucket_id = 'assignment-briefs' and public.is_admin_or_faculty()
  );

-- ---------------------------------------------------------------------------
-- 3. In-app notifications
-- ---------------------------------------------------------------------------

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_unread_idx
  on public.notifications (user_id, created_at desc)
  where read_at is null;
create index if not exists notifications_user_idx
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "notifications_self_read" on public.notifications;
create policy "notifications_self_read" on public.notifications
  for select using (user_id = auth.uid());

drop policy if exists "notifications_self_update" on public.notifications;
create policy "notifications_self_update" on public.notifications
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid() and id = id); -- mark-read only

-- Service role inserts. No insert policy needed.

-- Publish to realtime so the bell can stream new notifications live.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
     )
  then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 4. AI conversation history (foundation; UI can come later)
-- ---------------------------------------------------------------------------

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scope_type text not null check (scope_type in ('admissions','tutor')),
  scope_id text,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_conversations_user_idx
  on public.ai_conversations (user_id, updated_at desc);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists ai_messages_conv_idx
  on public.ai_messages (conversation_id, created_at);

alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;

drop policy if exists "ai_conv_self_read" on public.ai_conversations;
create policy "ai_conv_self_read" on public.ai_conversations
  for select using (user_id = auth.uid());

drop policy if exists "ai_msg_self_read" on public.ai_messages;
create policy "ai_msg_self_read" on public.ai_messages
  for select using (
    exists (
      select 1 from public.ai_conversations c
      where c.id = ai_messages.conversation_id and c.user_id = auth.uid()
    )
  );

-- Admin/faculty may read all (for moderation review).
drop policy if exists "ai_conv_staff_read" on public.ai_conversations;
create policy "ai_conv_staff_read" on public.ai_conversations
  for select using (public.is_admin_or_faculty());

drop policy if exists "ai_msg_staff_read" on public.ai_messages;
create policy "ai_msg_staff_read" on public.ai_messages
  for select using (public.is_admin_or_faculty());

-- Inserts are server-side via service role.

-- ---------------------------------------------------------------------------
-- 5. updated_at trigger for ai_conversations
-- ---------------------------------------------------------------------------

drop trigger if exists ai_conversations_set_updated_at on public.ai_conversations;
create trigger ai_conversations_set_updated_at
  before update on public.ai_conversations
  for each row execute procedure public.tg_set_updated_at();
