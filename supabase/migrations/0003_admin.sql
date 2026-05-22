-- Phase 5: admin workspace + content management
-- Adds:
--   - admins table (allowlist of users who can sign in to /admin)
--   - content_blocks table (CMS-managed posts, FAQs, testimonials)
--   - status transitions tracked on applications
--   - public.is_admin() helper used by RLS policies

set search_path = public;

-- ============================================================================
-- admins — allowlist of staff who can access /admin
-- Populated manually via SQL (or via /admin once at least one row exists).
-- ============================================================================
create table if not exists admins (
  user_id     uuid primary key,
  email       text not null unique,
  role        text not null default 'staff', -- staff | super
  created_at  timestamptz not null default now()
);

-- Helper used in RLS policies. Returns true when the calling user is in `admins`.
create or replace function public.is_admin() returns boolean
  language sql stable security definer
  as $$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;

-- ============================================================================
-- content_blocks — CMS-managed content: blog posts, FAQs, testimonials, pages
-- ============================================================================
create type content_kind  as enum ('blog_post', 'faq', 'testimonial', 'page_section');
create type content_state as enum ('draft', 'review', 'published', 'archived');

create table if not exists content_blocks (
  id            uuid primary key default gen_random_uuid(),
  kind          content_kind not null,
  state         content_state not null default 'draft',
  slug          text,                    -- url slug (unique within kind for blog_post)
  title         text not null,
  summary       text,
  body          text,                    -- markdown
  metadata      jsonb not null default '{}'::jsonb,
  author_id     uuid,                    -- admins.user_id
  ai_prompt     text,                    -- the prompt used if AI-drafted
  ai_model      text,                    -- model id that generated the draft
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create unique index if not exists content_blocks_blog_slug_idx
  on content_blocks (slug) where kind = 'blog_post' and slug is not null;

create index if not exists content_blocks_kind_state_idx
  on content_blocks (kind, state, updated_at desc);

create trigger content_blocks_set_updated_at
  before update on content_blocks
  for each row execute procedure set_updated_at();

-- ============================================================================
-- RLS — admins read+write everything via the dashboard; everyone else can
-- only read published content_blocks.
-- ============================================================================
alter table admins         enable row level security;
alter table content_blocks enable row level security;

-- admins table: only admins can read it. Insertion is via service role.
create policy admins_read on admins
  for select to authenticated
  using (is_admin());

-- content_blocks:
--   anonymous + authenticated -> read published rows only
--   admins (authenticated and in admins) -> read everything
create policy content_blocks_public_read on content_blocks
  for select to anon, authenticated
  using (state = 'published');

create policy content_blocks_admin_read on content_blocks
  for select to authenticated
  using (is_admin());

create policy content_blocks_admin_write on content_blocks
  for all to authenticated
  using (is_admin())
  with check (is_admin());

-- ============================================================================
-- application status updates by admins
-- An admin should be able to read every application + flip its status.
-- ============================================================================
create policy applications_admin_read on applications
  for select to authenticated
  using (is_admin());

create policy applications_admin_update on applications
  for update to authenticated
  using (is_admin())
  with check (is_admin());

create policy applicants_admin_read on applicants
  for select to authenticated
  using (is_admin());

create policy documents_admin_read on documents
  for select to authenticated
  using (is_admin());

create policy events_admin_read on events
  for select to authenticated
  using (is_admin());
