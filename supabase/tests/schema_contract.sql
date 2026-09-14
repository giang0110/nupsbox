begin;
create extension if not exists pgtap with schema extensions;
select plan(31);

select has_table('public', 'profiles', 'profiles exists');
select has_table('public', 'locations', 'locations exists');
select has_table('public', 'unit_types', 'unit_types exists');
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
    select string_agg(e.enumlabel::text, ',' order by e.enumsortorder)
    from pg_catalog.pg_enum e
    join pg_catalog.pg_type t on t.oid = e.enumtypid
    join pg_catalog.pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'lead_status'
  ),
  'new,contacted,qualified,viewing,negotiating,visit_scheduled,visited,won,lost',
  'lead_status labels support Phase 2 in expected order'
);

select ok(
  exists (
    select 1 from pg_catalog.pg_constraint c
    join pg_catalog.pg_class r on r.oid = c.conrelid
    join pg_catalog.pg_namespace n on n.oid = r.relnamespace
    where n.nspname = 'public' and r.relname = 'leads' and c.conname = 'leads_phase2_status_check'
  ),
  'leads Phase 2 status constraint exists'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_constraint c
    join pg_catalog.pg_class r on r.oid = c.conrelid
    join pg_catalog.pg_namespace n on n.oid = r.relnamespace
    where n.nspname = 'public' and r.relname = 'lead_status_history' and c.conname = 'lead_status_history_phase2_from_status_check'
  ),
  'lead status history from-status constraint exists'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_constraint c
    join pg_catalog.pg_class r on r.oid = c.conrelid
    join pg_catalog.pg_namespace n on n.oid = r.relnamespace
    where n.nspname = 'public' and r.relname = 'lead_status_history' and c.conname = 'lead_status_history_phase2_to_status_check'
  ),
  'lead status history to-status constraint exists'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_trigger t
    join pg_catalog.pg_class r on r.oid = t.tgrelid
    join pg_catalog.pg_namespace n on n.oid = r.relnamespace
    where n.nspname = 'public' and r.relname = 'leads' and t.tgname = 'leads_validate_assignee' and not t.tgisinternal
  ),
  'lead assignee validation trigger exists'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_trigger t
    join pg_catalog.pg_class r on r.oid = t.tgrelid
    join pg_catalog.pg_namespace n on n.oid = r.relnamespace
    where n.nspname = 'public' and r.relname = 'leads' and t.tgname = 'leads_audit_status_change' and not t.tgisinternal
  ),
  'lead status audit trigger exists'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_trigger t
    join pg_catalog.pg_class r on r.oid = t.tgrelid
    join pg_catalog.pg_namespace n on n.oid = r.relnamespace
    where n.nspname = 'public' and r.relname = 'leads' and t.tgname = 'leads_audit_assignment_change' and not t.tgisinternal
  ),
  'lead assignment audit trigger exists'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_trigger t
    join pg_catalog.pg_class r on r.oid = t.tgrelid
    join pg_catalog.pg_namespace n on n.oid = r.relnamespace
    where n.nspname = 'public' and r.relname = 'lead_notes' and t.tgname = 'lead_notes_audit_insert' and not t.tgisinternal
  ),
  'lead note audit trigger exists'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_indexes
    where schemaname = 'public' and tablename = 'leads' and indexname = 'leads_assigned_to_idx'
  ),
  'lead assignee index exists'
);

select * from finish();
rollback;
