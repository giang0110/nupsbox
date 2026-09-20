begin;
create extension if not exists pgtap with schema extensions;
select plan(5);

select is(
  (select column_default from information_schema.columns
   where table_schema='public' and table_name='profiles' and column_name='active'),
  'false',
  'profiles default to inactive'
);

select ok(
  exists(
    select 1
    from pg_trigger t
    join pg_class c on c.oid=t.tgrelid
    join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='auth'
      and c.relname='users'
      and t.tgname='on_auth_user_profile_created'
      and not t.tgisinternal
  ),
  'auth user profile trigger exists'
);

select ok(
  not has_function_privilege('anon', 'public.handle_new_auth_user_profile()', 'EXECUTE'),
  'anon cannot execute profile trigger helper'
);

select ok(
  not has_function_privilege('authenticated', 'public.handle_new_auth_user_profile()', 'EXECUTE'),
  'authenticated cannot execute profile trigger helper'
);

select is(
  (select count(*)::bigint
   from auth.users u
   left join public.profiles p on p.id=u.id
   where p.id is null),
  0::bigint,
  'no auth users are missing profiles after migration'
);

select * from finish();
rollback;
