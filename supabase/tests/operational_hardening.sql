begin;
create extension if not exists pgtap with schema extensions;
select plan(15);

select ok(exists(select 1 from pg_indexes where schemaname='public' and tablename='audit_log' and indexname='audit_log_actor_id_idx'), 'audit actor FK indexed');
select ok(exists(select 1 from pg_indexes where schemaname='public' and tablename='blog_posts' and indexname='blog_posts_author_id_idx'), 'blog author FK indexed');
select ok(exists(select 1 from pg_indexes where schemaname='public' and tablename='blog_posts' and indexname='blog_posts_cover_media_id_idx'), 'blog cover FK indexed');
select ok(exists(select 1 from pg_indexes where schemaname='public' and tablename='lead_appointment_history' and indexname='lead_appointment_history_changed_by_idx'), 'appointment history actor FK indexed');
select ok(exists(select 1 from pg_indexes where schemaname='public' and tablename='lead_appointment_history' and indexname='lead_appointment_history_lead_id_idx'), 'appointment history lead FK indexed');
select ok(exists(select 1 from pg_indexes where schemaname='public' and tablename='lead_appointments' and indexname='lead_appointments_created_by_idx'), 'appointment creator FK indexed');
select ok(exists(select 1 from pg_indexes where schemaname='public' and tablename='lead_appointments' and indexname='lead_appointments_location_id_idx'), 'appointment location FK indexed');
select ok(exists(select 1 from pg_indexes where schemaname='public' and tablename='lead_appointments' and indexname='lead_appointments_unit_type_id_idx'), 'appointment unit FK indexed');
select ok(exists(select 1 from pg_indexes where schemaname='public' and tablename='lead_notes' and indexname='lead_notes_author_id_idx'), 'lead note author FK indexed');
select ok(exists(select 1 from pg_indexes where schemaname='public' and tablename='lead_status_history' and indexname='lead_status_history_changed_by_idx'), 'status history actor FK indexed');
select ok(exists(select 1 from pg_indexes where schemaname='public' and tablename='location_unit_types' and indexname='location_unit_types_unit_type_id_idx'), 'pricing unit FK indexed');
select ok(exists(select 1 from pg_indexes where schemaname='public' and tablename='media_assets' and indexname='media_assets_unit_type_id_idx'), 'media unit FK indexed');
select ok(exists(select 1 from pg_indexes where schemaname='public' and tablename='site_settings' and indexname='site_settings_updated_by_idx'), 'settings updater FK indexed');

select ok(
  exists(
    select 1 from pg_policies
    where schemaname='public'
      and tablename='profiles'
      and policyname='profiles_authenticated_read'
      and qual like '%( SELECT auth.uid() AS uid)%'
  ),
  'consolidated profiles policy caches auth uid through select'
);

select ok(
  not has_table_privilege('anon', 'public.lead_rate_limits', 'SELECT')
  and not has_table_privilege('authenticated', 'public.lead_rate_limits', 'SELECT'),
  'lead rate limit state is not client-readable'
);

select * from finish();
rollback;
