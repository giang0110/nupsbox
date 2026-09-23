-- P3.49 Admin User & Role Management
-- Defense-in-depth: application code already checks this condition, while the trigger
-- prevents direct profile updates from removing the final active administrator.

create or replace function private.prevent_last_active_admin_loss()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role = 'admin'
     and old.active = true
     and (new.role is distinct from 'admin'::public.app_role or new.active is distinct from true)
     and not exists (
       select 1
       from public.profiles p
       where p.id <> old.id
         and p.role = 'admin'
         and p.active = true
     )
  then
    raise exception 'last_active_admin_required'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function private.prevent_last_active_admin_loss() from public, anon, authenticated;

drop trigger if exists profiles_protect_last_active_admin on public.profiles;
create trigger profiles_protect_last_active_admin
before update of role, active on public.profiles
for each row
execute function private.prevent_last_active_admin_loss();

create or replace function private.audit_profile_access_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role is distinct from new.role or old.active is distinct from new.active then
    insert into public.audit_log (
      actor_id,
      action,
      table_name,
      row_id,
      metadata
    ) values (
      auth.uid(),
      'profile.access_changed',
      'profiles',
      new.id,
      jsonb_build_object(
        'from_role', old.role::text,
        'to_role', new.role::text,
        'from_active', old.active,
        'to_active', new.active
      )
    );
  end if;

  return new;
end;
$$;

revoke all on function private.audit_profile_access_change() from public, anon, authenticated;

drop trigger if exists profiles_audit_access_change on public.profiles;
create trigger profiles_audit_access_change
after update of role, active on public.profiles
for each row
execute function private.audit_profile_access_change();
