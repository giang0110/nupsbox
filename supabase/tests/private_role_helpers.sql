begin;
create extension if not exists pgtap with schema extensions;
select plan(8);

select has_schema('private', 'private helper schema exists');
select has_function('private', 'current_app_role', array[]::text[], 'role helper moved to private');
select has_function('private', 'is_admin', array[]::text[], 'admin helper moved to private');

select ok(
  not exists(
    select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname in ('current_app_role','is_admin')
  ),
  'role helpers are absent from public schema'
);

select ok(
  has_function_privilege('authenticated', 'private.current_app_role()', 'EXECUTE'),
  'authenticated may execute private role helper for RLS'
);
select ok(
  has_function_privilege('authenticated', 'private.is_admin()', 'EXECUTE'),
  'authenticated may execute private admin helper for RLS'
);
select ok(
  not has_function_privilege('anon', 'private.current_app_role()', 'EXECUTE'),
  'anon cannot execute private role helper'
);
select ok(
  not has_function_privilege('anon', 'private.is_admin()', 'EXECUTE'),
  'anon cannot execute private admin helper'
);

select * from finish();
rollback;
