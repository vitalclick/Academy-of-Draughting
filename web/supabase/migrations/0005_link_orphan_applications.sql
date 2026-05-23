-- Pass E: auto-link prior applications when a user signs up with the same email.
-- Idempotent: safe to re-run.

create or replace function public.link_orphan_applications()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.email is not null then
    update public.applications
      set user_id = new.id
      where email = new.email
        and user_id is null;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_link_orphan_applications on public.profiles;
create trigger profiles_link_orphan_applications
  after insert on public.profiles
  for each row execute procedure public.link_orphan_applications();
