begin;
create extension if not exists pgtap with schema extensions;
select plan(23);

insert into public.leads (
  id,
  full_name,
  phone,
  status,
  source
) values (
  '10000000-0000-4000-8000-000000000001'::uuid,
  'Phase 2 pgTAP lead',
  '0900000000',
  'new'::public.lead_status,
  'phase2_pgtap'
);

select throws_ok(
  $$
    update public.leads
    set assigned_to = '20000000-0000-4000-8000-000000000001'::uuid
    where id = '10000000-0000-4000-8000-000000000001'::uuid
  $$,
  '23514',
  'assigned profile must be an active admin or staff member',
  'invalid assignee is rejected before the lead can be assigned'
);

update public.leads
set status = 'contacted'::public.lead_status
where id = '10000000-0000-4000-8000-000000000001'::uuid;

select is(
  (select count(*)::integer from public.lead_status_history where lead_id = '10000000-0000-4000-8000-000000000001'::uuid),
  1,
  'status update creates exactly one history row'
);
select is(
  (select from_status::text from public.lead_status_history where lead_id = '10000000-0000-4000-8000-000000000001'::uuid),
  'new',
  'history captures the previous status'
);
select is(
  (select to_status::text from public.lead_status_history where lead_id = '10000000-0000-4000-8000-000000000001'::uuid),
  'contacted',
  'history captures the new status'
);
select is(
  (select count(*)::integer from public.audit_log where row_id = '10000000-0000-4000-8000-000000000001'::uuid and action = 'lead.status_changed'),
  1,
  'status update creates exactly one audit row'
);
select is(
  (select metadata from public.audit_log where row_id = '10000000-0000-4000-8000-000000000001'::uuid and action = 'lead.status_changed'),
  '{"from":"new","to":"contacted"}'::jsonb,
  'status audit contains only from/to status metadata'
);

insert into public.lead_notes (lead_id, note)
values ('10000000-0000-4000-8000-000000000001'::uuid, 'Sensitive test note body');

select is(
  (select count(*)::integer from public.audit_log where row_id = '10000000-0000-4000-8000-000000000001'::uuid and action = 'lead.note_added'),
  1,
  'note insert creates exactly one audit row'
);
select is(
  (select metadata from public.audit_log where row_id = '10000000-0000-4000-8000-000000000001'::uuid and action = 'lead.note_added'),
  '{}'::jsonb,
  'note audit metadata excludes the note body'
);

insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '20000000-0000-4000-8000-000000000001'::uuid,
  'authenticated', 'authenticated', 'p23-staff@example.invalid', '', now(),
  '{}'::jsonb, '{}'::jsonb, now(), now()
);
insert into public.profiles (id, full_name, role, active)
values (
  '20000000-0000-4000-8000-000000000001'::uuid,
  'P2.3 Test Staff', 'staff', true
);
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

select throws_ok(
  $$insert into public.lead_appointments (
      lead_id, scheduled_at, duration_minutes, status, source
    ) values (
      '10000000-0000-4000-8000-000000000002'::uuid,
      now() + interval '2 days', 30, 'confirmed', 'staff'
    )$$,
  '23514', 'new appointments must start as pending',
  'direct insert rejects a non-pending initial status'
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
