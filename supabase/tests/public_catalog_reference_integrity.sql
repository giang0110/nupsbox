begin;
create extension if not exists pgtap with schema extensions;
select plan(5);

insert into public.locations (
  id, slug, name_vi, name_en, address_vi, address_en, district, city, status
) values
('91000000-0000-4000-8000-000000000001', 'p339-active', 'Active', 'Active', 'A', 'A', 'D', 'Ho Chi Minh City', 'active'),
('91000000-0000-4000-8000-000000000002', 'p339-draft', 'Draft', 'Draft', 'B', 'B', 'D', 'Ho Chi Minh City', 'inactive');

insert into public.unit_types (
  id, slug, name_vi, name_en, area_m2, active
) values
('92000000-0000-4000-8000-000000000001', 'p339-active-unit', 'Active unit', 'Active unit', 2, true),
('92000000-0000-4000-8000-000000000002', 'p339-inactive-unit', 'Inactive unit', 'Inactive unit', 3, false);

insert into public.location_unit_types (
  location_id, unit_type_id, availability_status
) values (
  '91000000-0000-4000-8000-000000000001',
  '92000000-0000-4000-8000-000000000001',
  'contact'
);

select lives_ok(
  $$select public.submit_public_lead_request(
    '{"fullName":"Valid public reference","phone":"0900000011","locationId":"91000000-0000-4000-8000-000000000001","unitTypeId":"92000000-0000-4000-8000-000000000001"}'::jsonb,
    null
  )$$,
  'valid active catalog pair is accepted'
);

select throws_ok(
  $$select public.submit_public_lead_request(
    '{"fullName":"Inactive location","phone":"0900000012","locationId":"91000000-0000-4000-8000-000000000002"}'::jsonb,
    null
  )$$,
  '23514', 'invalid public location reference',
  'inactive location is rejected'
);

select throws_ok(
  $$select public.submit_public_lead_request(
    '{"fullName":"Inactive unit","phone":"0900000013","unitTypeId":"92000000-0000-4000-8000-000000000002"}'::jsonb,
    null
  )$$,
  '23514', 'invalid public unit reference',
  'inactive unit is rejected'
);

insert into public.unit_types (
  id, slug, name_vi, name_en, area_m2, active
) values (
  '92000000-0000-4000-8000-000000000003',
  'p339-unmapped-unit', 'Unmapped', 'Unmapped', 4, true
);

select throws_ok(
  $$select public.submit_public_lead_request(
    '{"fullName":"Mismatched pair","phone":"0900000014","locationId":"91000000-0000-4000-8000-000000000001","unitTypeId":"92000000-0000-4000-8000-000000000003"}'::jsonb,
    null
  )$$,
  '23514', 'invalid public location unit pair',
  'active but unmapped location/unit pair is rejected'
);

select is(
  (select count(*)::integer from public.leads where phone in ('0900000012','0900000013','0900000014')),
  0,
  'rejected catalog references leave no lead behind'
);

select * from finish();
rollback;
