-- P3.33 auth/profile integrity hardening.
-- New Auth users receive an inactive viewer profile by default.
-- This keeps authorization fail-closed while preventing orphan auth identities.

alter table public.profiles
  alter column active set default false;

create or replace function public.handle_new_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role, active)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    'viewer'::public.app_role,
    false
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_auth_user_profile() from public, anon, authenticated;

drop trigger if exists on_auth_user_profile_created on auth.users;
create trigger on_auth_user_profile_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user_profile();

insert into public.profiles (id, full_name, role, active)
select
  u.id,
  nullif(trim(coalesce(u.raw_user_meta_data ->> 'full_name', '')), ''),
  'viewer'::public.app_role,
  false
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;
