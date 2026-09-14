begin;
create extension if not exists pgtap with schema extensions;
select plan(23);

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

select * from finish();
rollback;
