begin;
create extension if not exists pgtap with schema extensions;
select plan(38);

select policies_are('public', 'leads', array['leads_authenticated_read', 'leads_staff_update'], 'leads exposes Phase 2 read/update policies');
select policies_are('public', 'audit_log', array['audit_log_admin_read'], 'audit log is admin-only');
select policies_are('public', 'profiles', array['profiles_admin_update', 'profiles_authenticated_read'], 'profiles consolidates self/admin/operational reads');
select policies_are('public', 'site_settings', array['site_settings_admin_insert', 'site_settings_admin_update', 'site_settings_authenticated_read', 'site_settings_public_read'], 'settings have explicit read/admin mutation policies');
select policies_are('public', 'lead_notes', array['lead_notes_authenticated_read', 'lead_notes_staff_insert'], 'lead notes are read-only for viewer and writable by staff/admin');
select policies_are('public', 'lead_status_history', array['lead_status_history_authenticated_read'], 'lead history is trigger-owned and read-only to authenticated clients');
select policies_are('public', 'locations', array['locations_authenticated_read', 'locations_public_read', 'locations_staff_insert', 'locations_staff_update'], 'locations use explicit Phase 2 CMS policies');
select policies_are('public', 'unit_types', array['unit_types_authenticated_read', 'unit_types_public_read', 'unit_types_staff_insert', 'unit_types_staff_update'], 'unit types use explicit Phase 2 CMS policies');
select policies_are('public', 'location_unit_types', array['location_unit_types_authenticated_read', 'location_unit_types_public_read', 'location_unit_types_staff_insert', 'location_unit_types_staff_update'], 'pricing uses explicit Phase 2 CMS policies');
select policies_are('public', 'media_assets', array['media_assets_admin_delete', 'media_assets_authenticated_read', 'media_assets_public_read', 'media_assets_staff_insert', 'media_assets_staff_update'], 'media uses explicit CMS policies including admin-only delete');
select policies_are('public', 'faqs', array['faqs_authenticated_read', 'faqs_public_read', 'faqs_staff_insert', 'faqs_staff_update'], 'faqs use explicit Phase 2 CMS policies');
select policies_are('public', 'blog_posts', array['blog_posts_authenticated_read', 'blog_posts_public_read', 'blog_posts_staff_insert', 'blog_posts_staff_update'], 'blog posts use explicit Phase 2 CMS policies');
select policies_are('public', 'blog_translations', array['blog_translations_authenticated_read', 'blog_translations_public_read', 'blog_translations_staff_insert', 'blog_translations_staff_update'], 'blog translations use explicit Phase 2 CMS policies');
select policies_are('public', 'content_blocks', array['content_blocks_authenticated_read', 'content_blocks_public_read'], 'content blocks remain internal read-only for authenticated users');

select policy_roles_are('public', 'locations', 'locations_public_read', array['anon'], 'catalog anonymous read remains public');
select policy_roles_are('public', 'locations', 'locations_authenticated_read', array['authenticated'], 'internal location read is authenticated only');
select policy_roles_are('public', 'content_blocks', 'content_blocks_authenticated_read', array['authenticated'], 'internal content block read is authenticated only');
select policy_roles_are('public', 'leads', 'leads_authenticated_read', array['authenticated'], 'lead read is authenticated only');
select policy_roles_are('public', 'leads', 'leads_staff_update', array['authenticated'], 'lead update is authenticated only');
select policy_roles_are('public', 'lead_notes', 'lead_notes_authenticated_read', array['authenticated'], 'lead note read is authenticated only');
select policy_roles_are('public', 'lead_notes', 'lead_notes_staff_insert', array['authenticated'], 'lead note insert is authenticated only');
select policy_roles_are('public', 'lead_status_history', 'lead_status_history_authenticated_read', array['authenticated'], 'lead history read is authenticated only');
select policy_roles_are('public', 'profiles', 'profiles_authenticated_read', array['authenticated'], 'consolidated profile read is authenticated only');
select policy_roles_are('public', 'site_settings', 'site_settings_authenticated_read', array['authenticated'], 'settings internal read is authenticated only');
select policy_roles_are('public', 'site_settings', 'site_settings_admin_insert', array['authenticated'], 'settings insert is authenticated only');
select policy_roles_are('public', 'site_settings', 'site_settings_admin_update', array['authenticated'], 'settings update is authenticated only');

select is(
  (
    select count(*)::integer
    from pg_catalog.pg_policies
    where schemaname = 'public'
      and tablename = any(array[
        'locations','unit_types','location_unit_types','media_assets','faqs',
        'blog_posts','blog_translations','content_blocks','site_settings'
      ])
      and cmd = 'DELETE'
      and 'authenticated' = any(roles)
  ),
  1,
  'media assets are the only authenticated CMS table exposing DELETE'
);
select is(
  (
    select count(*)::integer
    from pg_catalog.pg_policies
    where schemaname = 'public'
      and tablename = 'content_blocks'
      and cmd in ('INSERT', 'UPDATE', 'ALL')
      and 'authenticated' = any(roles)
  ),
  0,
  'content blocks expose no authenticated mutation policy'
);

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
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_authenticated_read'
  ), false),
  'consolidated profile policy preserves active admin/staff target scope'
);

select has_function('private', 'current_app_role', array[]::text[], 'role helper exists');
select has_function('private', 'is_admin', array[]::text[], 'admin helper exists');
select ok(
  not has_function_privilege('anon', 'private.current_app_role()', 'EXECUTE'),
  'anon cannot execute current_app_role'
);
select ok(
  not has_function_privilege('anon', 'private.is_admin()', 'EXECUTE'),
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
