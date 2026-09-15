begin;
create extension if not exists pgtap with schema extensions;
select plan(43);

select has_table('public', 'profiles', 'profiles exists');
select has_table('public', 'locations', 'locations exists');
select has_table('public', 'unit_types', 'unit types exists');
select has_table('public', 'location_unit_types', 'location pricing exists');
select has_table('public', 'media_assets', 'media assets exists');
select has_table('public', 'faqs', 'faqs exists');
select has_table('public', 'content_blocks', 'content blocks exists');
select has_table('public', 'blog_posts', 'blog posts exists');
select has_table('public', 'blog_translations', 'blog translations exists');
select has_table('public', 'leads', 'leads exists');
select has_table('public', 'lead_notes', 'lead notes exists');
select has_table('public', 'lead_status_history', 'lead status history exists');
select has_table('public', 'audit_log', 'audit log exists');
select has_table('public', 'site_settings', 'site settings exists');
select has_table('public', 'lead_rate_limits', 'lead rate limits exists');

select has_type('public', 'app_role', 'app_role enum exists');
select has_type('public', 'location_status', 'location_status enum exists');
select has_type('public', 'availability_status', 'availability_status enum exists');
select has_type('public', 'lead_status', 'lead_status enum exists');
select has_type('public', 'need_type', 'need_type enum exists');
select has_type('public', 'estimated_volume', 'estimated_volume enum exists');
select has_type('public', 'media_category', 'media_category enum exists');

select is(
  (
    select array_agg(enum_value order by sort_order)::text[]
    from (
      select e.enumlabel::text as enum_value, e.enumsortorder as sort_order
      from pg_catalog.pg_enum e
      join pg_catalog.pg_type t on t.oid = e.enumtypid
      join pg_catalog.pg_namespace n on n.oid = t.typnamespace
      where n.nspname = 'public'
        and t.typname = 'lead_status'
    ) labels
  ),
  array[
    'new',
    'contacted',
    'qualified',
    'viewing',
    'negotiating',
    'visit_scheduled',
    'visited',
    'won',
    'lost'
  ]::text[],
  'lead_status contains Phase 2 labels in migration-safe order'
);

select ok(
  exists (
    select 1 from pg_catalog.pg_constraint c
    join pg_catalog.pg_class r on r.oid = c.conrelid
    join pg_catalog.pg_namespace n on n.oid = r.relnamespace
    where n.nspname = 'public' and r.relname = 'leads'
      and c.conname = 'leads_phase2_status_check' and c.contype = 'c'
  ),
  'leads_phase2_status_check exists'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_constraint c
    join pg_catalog.pg_class r on r.oid = c.conrelid
    join pg_catalog.pg_namespace n on n.oid = r.relnamespace
    where n.nspname = 'public' and r.relname = 'lead_status_history'
      and c.conname = 'lead_status_history_phase2_to_status_check' and c.contype = 'c'
  ),
  'lead_status_history_phase2_to_status_check exists'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_trigger t
    join pg_catalog.pg_class r on r.oid = t.tgrelid
    join pg_catalog.pg_namespace n on n.oid = r.relnamespace
    where n.nspname = 'public' and r.relname = 'leads'
      and t.tgname = 'leads_validate_assignee' and not t.tgisinternal
  ),
  'leads_validate_assignee exists'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_trigger t
    join pg_catalog.pg_class r on r.oid = t.tgrelid
    join pg_catalog.pg_namespace n on n.oid = r.relnamespace
    where n.nspname = 'public' and r.relname = 'leads'
      and t.tgname = 'leads_audit_status_change' and not t.tgisinternal
  ),
  'leads_audit_status_change exists'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_trigger t
    join pg_catalog.pg_class r on r.oid = t.tgrelid
    join pg_catalog.pg_namespace n on n.oid = r.relnamespace
    where n.nspname = 'public' and r.relname = 'leads'
      and t.tgname = 'leads_audit_assignment_change' and not t.tgisinternal
  ),
  'leads_audit_assignment_change exists'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_trigger t
    join pg_catalog.pg_class r on r.oid = t.tgrelid
    join pg_catalog.pg_namespace n on n.oid = r.relnamespace
    where n.nspname = 'public' and r.relname = 'lead_notes'
      and t.tgname = 'lead_notes_audit_insert' and not t.tgisinternal
  ),
  'lead_notes_audit_insert exists'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_indexes
    where schemaname = 'public' and tablename = 'leads'
      and indexname = 'leads_assigned_to_idx'
  ),
  'leads_assigned_to_idx exists'
);

select has_column('public', 'locations', 'published_at', 'locations tracks first publication');
select has_column('public', 'unit_types', 'published_at', 'unit types track first publication');
select has_trigger('public', 'locations', 'locations_lock_published_slug', 'published location slug is locked');
select has_trigger('public', 'unit_types', 'unit_types_lock_published_slug', 'published unit slug is locked');
select has_trigger('public', 'blog_posts', 'blog_posts_lock_published_slug', 'published blog slug is locked');
select has_trigger('public', 'locations', 'locations_cms_audit', 'locations mutations are audited');
select has_trigger('public', 'unit_types', 'unit_types_cms_audit', 'unit type mutations are audited');
select has_trigger('public', 'location_unit_types', 'location_unit_types_cms_audit', 'pricing mutations are audited');
select has_trigger('public', 'media_assets', 'media_assets_cms_audit', 'media metadata mutations are audited');
select has_trigger('public', 'faqs', 'faqs_cms_audit', 'faq mutations are audited');
select has_trigger('public', 'blog_posts', 'blog_posts_cms_audit', 'blog post mutations are audited');
select has_trigger('public', 'blog_translations', 'blog_translations_cms_audit', 'blog translation mutations are audited');
select has_trigger('public', 'site_settings', 'site_settings_cms_audit', 'site setting mutations are audited');

select * from finish();
rollback;
