begin;
create extension if not exists pgtap with schema extensions;
select plan(24);

select policies_are('public', 'leads', array['leads_authenticated_read', 'leads_staff_update'], 'leads exposes Phase 2 read/update policies');
select policies_are('public', 'audit_log', array['audit_log_admin_read'], 'audit log is admin-only');
select policies_are('public', 'profiles', array['profiles_admin_read', 'profiles_admin_update', 'profiles_operational_read', 'profiles_self_read'], 'profiles has self/admin/operational policies');
select policies_are('public', 'site_settings', array['site_settings_admin_write', 'site_settings_public_read'], 'settings have public-read/admin-write split');
select policies_are('public', 'lead_notes', array['lead_notes_authenticated_read', 'lead_notes_staff_insert'], 'lead notes are read-only for viewer and writable by staff/admin');
select policies_are('public', 'lead_status_history', array['lead_status_history_authenticated_read'], 'lead history is trigger-owned and read-only to authenticated clients');

select policy_roles_are('public', 'locations', 'locations_public_read', array['anon', 'authenticated'], 'catalog is publicly readable');
select policy_roles_are('public', 'leads', 'leads_authenticated_read', array['authenticated'], 'lead read is authenticated only');
select policy_roles_are('public', 'leads', 'leads_staff_update', array['authenticated'], 'lead update is authenticated only');
select policy_roles_are('public', 'lead_notes', 'lead_notes_authenticated_read', array['authenticated'], 'lead note read is authenticated only');
select policy_roles_are('public', 'lead_notes', 'lead_notes_staff_insert', array['authenticated'], 'lead note insert is authenticated only');
select policy_roles_are('public', 'lead_status_history', 'lead_status_history_authenticated_read', array['authenticated'], 'lead history read is authenticated only');
select policy_roles_are('public', 'profiles', 'profiles_operational_read', array['authenticated'], 'assignment-target profile read is authenticated only');
select policy_roles_are('public', 'site_settings', 'site_settings_admin_write', array['authenticated'], 'settings writes are authenticated only');

select ok(
  coalesce((
    select qual like '%viewer%'
    from pg_catalog.pg_policies
    where schemaname = 'public' and tablename = 'leads' and policyname = 'leads_authenticated_read'
  ), false),
  'viewer is included in lead read policy'
);
select ok(
  coalesce((
    select qual like '%viewer%'
    from pg_catalog.pg_policies
    where schemaname = 'public' and tablename = 'lead_notes' and policyname = 'lead_notes_authenticated_read'
  ), false),
  'viewer is included in lead note read policy'
);
select ok(
  coalesce((
    select qual like '%viewer%'
    from pg_catalog.pg_policies
    where schemaname = 'public' and tablename = 'lead_status_history' and policyname = 'lead_status_history_authenticated_read'
  ), false),
  'viewer is included in lead history read policy'
);
select ok(
  coalesce((
    select qual like '%active%' and qual like '%admin%' and qual like '%staff%'
    from pg_catalog.pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_operational_read'
  ), false),
  'operational profile policy is limited to active admin/staff targets'
);

select has_function('public', 'current_app_role', array[]::text[], 'role helper exists');
select has_function('public', 'is_admin', array[]::text[], 'admin helper exists');
select ok(
  not has_function_privilege('anon', 'public.current_app_role()', 'EXECUTE'),
  'anon cannot execute current_app_role'
);
select ok(
  not has_function_privilege('anon', 'public.is_admin()', 'EXECUTE'),
  'anon cannot execute is_admin'
);
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
