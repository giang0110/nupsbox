begin;
create extension if not exists pgtap with schema extensions;
select plan(12);

select policies_are('public', 'leads', array['leads_staff_read', 'leads_staff_update'], 'leads exposes only staff policies');
select policies_are('public', 'audit_log', array['audit_log_admin_read'], 'audit log is admin-only');
select policies_are('public', 'profiles', array['profiles_admin_read', 'profiles_admin_update', 'profiles_self_read'], 'profiles has self/admin policies');
select policies_are('public', 'site_settings', array['site_settings_admin_write', 'site_settings_public_read'], 'settings have public-read/admin-write split');

select policy_roles_are('public', 'locations', 'locations_public_read', array['anon', 'authenticated'], 'catalog is publicly readable');
select policy_roles_are('public', 'leads', 'leads_staff_read', array['authenticated'], 'lead read is authenticated only');
select policy_roles_are('public', 'leads', 'leads_staff_update', array['authenticated'], 'lead update is authenticated only');
select policy_roles_are('public', 'site_settings', 'site_settings_admin_write', array['authenticated'], 'settings writes are authenticated only');

select has_function('public', 'current_app_role', array[]::text[], 'role helper exists');
select has_function('public', 'is_admin', array[]::text[], 'admin helper exists');
select ok(
  coalesce((
    select c.relrowsecurity
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'leads'
  ), false),
  'RLS enabled on leads'
);
select ok(
  coalesce((
    select c.relrowsecurity
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'site_settings'
  ), false),
  'RLS enabled on site settings'
);

select * from finish();
rollback;
