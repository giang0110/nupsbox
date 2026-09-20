begin;
create extension if not exists pgtap with schema extensions;
select plan(27);

-- Schema contracts.
select has_type('public', 'appointment_status', 'appointment_status enum exists');
select has_type('public', 'appointment_source', 'appointment_source enum exists');
select has_table('public', 'lead_appointments', 'lead appointments exists');
select has_table('public', 'lead_appointment_history', 'appointment history exists');
select has_function(
  'public', 'submit_public_lead_request', array['jsonb', 'jsonb'],
  'atomic public lead request RPC exists'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_trigger t
    join pg_catalog.pg_class r on r.oid = t.tgrelid
    join pg_catalog.pg_namespace n on n.oid = r.relnamespace
    where n.nspname = 'public' and r.relname = 'lead_appointments'
      and t.tgname = 'lead_appointments_validate_change' and not t.tgisinternal
  ),
  'appointment validation trigger exists'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_trigger t
    join pg_catalog.pg_class r on r.oid = t.tgrelid
    join pg_catalog.pg_namespace n on n.oid = r.relnamespace
    where n.nspname = 'public' and r.relname = 'lead_appointments'
      and t.tgname = 'lead_appointments_audit' and not t.tgisinternal
  ),
  'appointment audit trigger exists'
);

-- RLS contracts.
select policies_are(
  'public', 'lead_appointments',
  array[
    'lead_appointments_authenticated_read',
    'lead_appointments_staff_insert',
    'lead_appointments_staff_update'
  ],
  'appointment policies are explicit'
);
select policies_are(
  'public', 'lead_appointment_history',
  array['lead_appointment_history_authenticated_read'],
  'appointment history has read-only normal RLS access'
);
select policy_roles_are(
  'public', 'lead_appointments', 'lead_appointments_authenticated_read',
  array['authenticated'], 'appointment read is authenticated only'
);
select is(
  (
    select count(*)::integer from pg_catalog.pg_policies
    where schemaname = 'public'
      and tablename in ('lead_appointments', 'lead_appointment_history')
      and cmd = 'DELETE'
  ),
  0,
  'appointment tables expose no delete policy'
);
select ok(
  coalesce((
    select qual like '%viewer%'
    from pg_catalog.pg_policies
    where schemaname = 'public' and tablename = 'lead_appointments'
      and policyname = 'lead_appointments_authenticated_read'
  ), false),
  'viewer is included in appointment read policy'
);
select ok(
  coalesce((
    select with_check like '%admin%'
       and with_check like '%staff%'
       and with_check not like '%viewer%'
    from pg_catalog.pg_policies
    where schemaname = 'public' and tablename = 'lead_appointments'
      and policyname = 'lead_appointments_staff_insert'
  ), false),
  'appointment insert is admin/staff only'
);

-- Behavioral fixtures.
insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '20000000-0000-4000-8000-000000000001'::uuid,
  'authenticated', 'authenticated', 'p23-staff@example.invalid', '', now(),
  '{}'::jsonb, '{}'::jsonb, now(), now()
);
update public.profiles
set full_name = 'P2.3 Test Staff',
    role = 'staff',
    active = true
where id = '20000000-0000-4000-8000-000000000001'::uuid;
insert into public.locations (
  id, slug, name_vi, name_en, address_vi, address_en, district, city, status
) values (
  '30000000-0000-4000-8000-000000000001'::uuid,
  'p23-test-location', 'Kho test', 'Test location',
  'Test address', 'Test address', 'Test', 'Ho Chi Minh City', 'active'
);
insert into public.leads (
  id, full_name, phone, need_type, estimated_volume, status, source
) values (
  '10000000-0000-4000-8000-000000000002'::uuid,
  'P2.3 Lead', '0900000002', 'other', 'unknown', 'new', 'p23_pgtap'
);

select lives_ok(
  $$insert into public.lead_appointments (
      id, lead_id, scheduled_at, duration_minutes, source
    ) values (
      '40000000-0000-4000-8000-000000000001'::uuid,
      '10000000-0000-4000-8000-000000000002'::uuid,
      now() + interval '2 days', 30, 'staff'
    )$$,
  'pending appointment accepts 30 minutes without location/assignee'
);
select throws_ok(
  $$insert into public.lead_appointments (lead_id, scheduled_at, duration_minutes, source)
    values ('10000000-0000-4000-8000-000000000002'::uuid,
            now() + interval '2 days', 14, 'staff')$$,
  '23514', null, 'duration below 15 is rejected'
);
select throws_ok(
  $$insert into public.lead_appointments (lead_id, scheduled_at, duration_minutes, source)
    values ('10000000-0000-4000-8000-000000000002'::uuid,
            now() + interval '2 days', 181, 'staff')$$,
  '23514', null, 'duration above 180 is rejected'
);
select throws_ok(
  $$update public.lead_appointments set status = 'confirmed'
    where id = '40000000-0000-4000-8000-000000000001'::uuid$$,
  '23514', 'confirmed appointment requires future time, location and assignee',
  'confirmation requires location and assignee'
);
update public.lead_appointments
set location_id = '30000000-0000-4000-8000-000000000001'::uuid,
    assigned_to = '20000000-0000-4000-8000-000000000001'::uuid
where id = '40000000-0000-4000-8000-000000000001'::uuid;
select lives_ok(
  $$update public.lead_appointments set status = 'confirmed'
    where id = '40000000-0000-4000-8000-000000000001'::uuid$$,
  'valid pending appointment can be confirmed'
);
select throws_ok(
  $$update public.lead_appointments set status = 'pending'
    where id = '40000000-0000-4000-8000-000000000001'::uuid$$,
  '23514', 'invalid appointment status transition',
  'confirmed appointment cannot move back to pending'
);
select lives_ok(
  $$update public.lead_appointments set status = 'completed'
    where id = '40000000-0000-4000-8000-000000000001'::uuid$$,
  'confirmed appointment can be completed'
);
select throws_ok(
  $$update public.lead_appointments set internal_note = 'late edit'
    where id = '40000000-0000-4000-8000-000000000001'::uuid$$,
  '23514', 'terminal appointment is immutable',
  'terminal appointment rejects later edit'
);
select cmp_ok(
  (select count(*) from public.lead_appointment_history
   where appointment_id = '40000000-0000-4000-8000-000000000001'::uuid),
  '>=', 3::bigint, 'appointment lifecycle creates history rows'
);

insert into public.lead_appointments (
  id, lead_id, scheduled_at, source
) values (
  '40000000-0000-4000-8000-000000000002'::uuid,
  '10000000-0000-4000-8000-000000000002'::uuid,
  now() + interval '3 days', 'staff'
);
select throws_ok(
  $$update public.lead_appointments set status = 'completed'
    where id = '40000000-0000-4000-8000-000000000002'::uuid$$,
  '23514', 'invalid appointment status transition',
  'pending cannot skip directly to completed'
);

select lives_ok(
  $$select public.submit_public_lead_request(
    jsonb_build_object(
      'fullName', 'Atomic Success', 'phone', '0900000098',
      'preferredLanguage', 'vi', 'needType', 'other',
      'estimatedVolume', 'unknown', 'source', 'p23_atomic_success'
    ),
    jsonb_build_object(
      'scheduledAt', (now() + interval '4 days')::text,
      'durationMinutes', 30
    )
  )$$,
  'atomic RPC accepts valid lead plus appointment'
);
select is(
  (
    select count(*)::integer
    from public.lead_appointments a
    join public.leads l on l.id = a.lead_id
    where l.source = 'p23_atomic_success'
      and a.status = 'pending' and a.source = 'customer'
  ),
  1,
  'valid atomic RPC creates exactly one pending customer appointment'
);
select throws_ok(
  $$select public.submit_public_lead_request(
    jsonb_build_object(
      'fullName', 'Atomic Failure', 'phone', '0900000099',
      'preferredLanguage', 'vi', 'needType', 'other',
      'estimatedVolume', 'unknown', 'source', 'p23_atomic_failure'
    ),
    jsonb_build_object(
      'scheduledAt', (now() - interval '1 hour')::text,
      'durationMinutes', 30
    )
  )$$,
  '23514', 'active appointment scheduled_at must be in the future',
  'invalid appointment aborts atomic RPC'
);
select is(
  (select count(*)::integer from public.leads where source = 'p23_atomic_failure'),
  0,
  'failed atomic RPC leaves no lead behind'
);

select * from finish();
rollback;
