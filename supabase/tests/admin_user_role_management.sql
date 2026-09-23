begin;
create extension if not exists pgtap with schema extensions;
select plan(4);

select ok(
  exists(
    select 1
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'profiles'
      and t.tgname = 'profiles_protect_last_active_admin'
      and not t.tgisinternal
  ),
  'profiles protect the final active admin'
);

select ok(
  exists(
    select 1
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'profiles'
      and t.tgname = 'profiles_audit_access_change'
      and not t.tgisinternal
  ),
  'profile access changes are audited'
);

select ok(
  not has_function_privilege('authenticated', 'private.prevent_last_active_admin_loss()', 'EXECUTE'),
  'authenticated cannot directly execute last-admin trigger helper'
);

select ok(
  not has_function_privilege('authenticated', 'private.audit_profile_access_change()', 'EXECUTE'),
  'authenticated cannot directly execute profile audit trigger helper'
);

select * from finish();
rollback;
