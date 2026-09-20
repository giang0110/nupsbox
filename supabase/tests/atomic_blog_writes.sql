begin;
create extension if not exists pgtap with schema extensions;
select plan(8);

select has_function(
  'public',
  'create_blog_post_atomic',
  array['text','uuid','text','uuid','jsonb','jsonb'],
  'atomic blog create RPC exists'
);
select has_function(
  'public',
  'update_blog_post_atomic',
  array['uuid','text','uuid','text','jsonb','jsonb'],
  'atomic blog update RPC exists'
);

select ok(
  not has_function_privilege('anon', 'public.create_blog_post_atomic(text,uuid,text,uuid,jsonb,jsonb)', 'EXECUTE'),
  'anon cannot create blogs through atomic RPC'
);
select ok(
  not has_function_privilege('anon', 'public.update_blog_post_atomic(uuid,text,uuid,text,jsonb,jsonb)', 'EXECUTE'),
  'anon cannot update blogs through atomic RPC'
);
select ok(
  has_function_privilege('authenticated', 'public.create_blog_post_atomic(text,uuid,text,uuid,jsonb,jsonb)', 'EXECUTE'),
  'authenticated callers can use atomic create subject to RLS'
);
select ok(
  has_function_privilege('authenticated', 'public.update_blog_post_atomic(uuid,text,uuid,text,jsonb,jsonb)', 'EXECUTE'),
  'authenticated callers can use atomic update subject to RLS'
);

select ok(
  not (select prosecdef from pg_proc p join pg_namespace n on n.oid=p.pronamespace
       where n.nspname='public' and p.proname='create_blog_post_atomic'),
  'atomic create is SECURITY INVOKER'
);
select ok(
  not (select prosecdef from pg_proc p join pg_namespace n on n.oid=p.pronamespace
       where n.nspname='public' and p.proname='update_blog_post_atomic'),
  'atomic update is SECURITY INVOKER'
);

select * from finish();
rollback;
