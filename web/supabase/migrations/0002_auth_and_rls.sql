-- Pass A: auth-linked profiles, roles, RLS policies, document storage.

-- 1. profiles ---------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'student' check (role in ('student','admin','faculty')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);

alter table public.profiles enable row level security;

-- Users read their own row; admins read all.
drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_admin_read" on public.profiles;
create policy "profiles_admin_read" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Helper to read current user role without RLS recursion.
create or replace function public.current_user_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Auto-create a profile row when a user signs up via Supabase Auth.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. link applications to users + add policies ------------------------------

alter table public.applications
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists applications_user_idx on public.applications (user_id);

drop policy if exists "applications_owner_read" on public.applications;
create policy "applications_owner_read" on public.applications
  for select using (user_id = auth.uid());

drop policy if exists "applications_admin_read" on public.applications;
create policy "applications_admin_read" on public.applications
  for select using (public.current_user_role() = 'admin');

drop policy if exists "applications_admin_update" on public.applications;
create policy "applications_admin_update" on public.applications
  for update using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- Note: inserts are done server-side with the service role, which bypasses RLS.
-- We deliberately do NOT add an anon-insert policy.

-- 3. documents table for applicant uploads ----------------------------------

create table if not exists public.application_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  storage_path text not null,
  filename text not null,
  mime_type text,
  size_bytes bigint,
  ocr_status text not null default 'pending' check (ocr_status in ('pending','processing','done','failed','skipped')),
  ocr_result jsonb,
  created_at timestamptz not null default now()
);

create index if not exists application_documents_application_idx on public.application_documents (application_id);
create index if not exists application_documents_user_idx on public.application_documents (user_id);

alter table public.application_documents enable row level security;

drop policy if exists "documents_owner_read" on public.application_documents;
create policy "documents_owner_read" on public.application_documents
  for select using (user_id = auth.uid());

drop policy if exists "documents_admin_read" on public.application_documents;
create policy "documents_admin_read" on public.application_documents
  for select using (public.current_user_role() = 'admin');

-- 4. storage bucket for documents (private) ---------------------------------

insert into storage.buckets (id, name, public)
values ('application-documents', 'application-documents', false)
on conflict (id) do nothing;

-- Only the document owner or an admin can read; uploads use signed URLs from the server.
drop policy if exists "documents_storage_owner_read" on storage.objects;
create policy "documents_storage_owner_read" on storage.objects
  for select using (
    bucket_id = 'application-documents'
    and (
      (auth.uid()::text = (storage.foldername(name))[1])
      or public.current_user_role() = 'admin'
    )
  );
