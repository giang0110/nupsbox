begin;
create extension if not exists pgtap with schema extensions;
select plan(22);

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

select * from finish();
rollback;
