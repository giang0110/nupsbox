begin;
create extension if not exists pgtap with schema extensions;
select plan(8);

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

select * from finish();
rollback;
