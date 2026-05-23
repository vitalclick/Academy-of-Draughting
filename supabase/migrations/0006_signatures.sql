-- Phase 8: email signature library
-- ============================================================
-- Stores generated HTML email signatures so the admin can see who on the
-- team has one and regenerate when their details change. Pure metadata —
-- the HTML is re-rendered on demand from these fields by the builder.

set search_path = public;

create table if not exists signatures (
  id                  uuid primary key default gen_random_uuid(),
  full_name           text not null,
  role                text not null,
  qualifications      text,
  email               text not null,
  mobile              text,
  office_phone        text,
  office_location     text not null default 'johannesburg',
  linkedin            text,
  website             text not null default 'academydraughting.com',
  template            text not null default 'classic-horizontal',
  show_logo           boolean not null default true,
  show_tagline        boolean not null default true,
  show_accreditations boolean not null default false,
  created_by          uuid references auth.users(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists signatures_full_name_idx  on signatures(full_name);
create index if not exists signatures_created_at_idx on signatures(created_at desc);

create trigger signatures_set_updated_at
  before update on signatures
  for each row execute procedure set_updated_at();

alter table signatures enable row level security;

create policy signatures_admin_all on signatures
  for all to authenticated
  using (is_admin())
  with check (is_admin());
