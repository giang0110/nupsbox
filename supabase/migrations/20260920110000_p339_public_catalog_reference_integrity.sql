-- P3.39 defend public lead intake against inactive or mismatched catalog references.
create or replace function public.submit_public_lead_request(
  p_lead jsonb,
  p_appointment jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead_id uuid;
  v_appointment_id uuid;
  v_location_id uuid := nullif(p_lead->>'locationId', '')::uuid;
  v_unit_type_id uuid := nullif(p_lead->>'unitTypeId', '')::uuid;
begin
  if v_location_id is not null and not exists (
    select 1 from public.locations l
    where l.id = v_location_id and l.status = 'active'
  ) then
    raise exception 'invalid public location reference'
      using errcode = '23514';
  end if;

  if v_unit_type_id is not null and not exists (
    select 1 from public.unit_types u
    where u.id = v_unit_type_id and u.active = true
  ) then
    raise exception 'invalid public unit reference'
      using errcode = '23514';
  end if;

  if v_location_id is not null and v_unit_type_id is not null and not exists (
    select 1 from public.location_unit_types lut
    where lut.location_id = v_location_id
      and lut.unit_type_id = v_unit_type_id
  ) then
    raise exception 'invalid public location unit pair'
      using errcode = '23514';
  end if;

  insert into public.leads (
    full_name,
    phone,
    email,
    preferred_language,
    location_id,
    unit_type_id,
    need_type,
    estimated_volume,
    message,
    source,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    landing_page,
    referrer,
    status
  ) values (
    trim(p_lead->>'fullName'),
    trim(p_lead->>'phone'),
    nullif(trim(p_lead->>'email'), ''),
    coalesce(nullif(p_lead->>'preferredLanguage', ''), 'vi'),
    v_location_id,
    v_unit_type_id,
    coalesce(nullif(p_lead->>'needType', ''), 'other')::public.need_type,
    coalesce(nullif(p_lead->>'estimatedVolume', ''), 'unknown')::public.estimated_volume,
    nullif(p_lead->>'message', ''),
    coalesce(nullif(p_lead->>'source', ''), nullif(p_lead->>'utmSource', '')),
    nullif(p_lead->>'utmSource', ''),
    nullif(p_lead->>'utmMedium', ''),
    nullif(p_lead->>'utmCampaign', ''),
    nullif(p_lead->>'utmContent', ''),
    nullif(p_lead->>'landingPage', ''),
    nullif(p_lead->>'referrer', ''),
    'new'::public.lead_status
  ) returning id into v_lead_id;

  if p_appointment is not null then
    insert into public.lead_appointments (
      lead_id,
      location_id,
      unit_type_id,
      scheduled_at,
      duration_minutes,
      status,
      source,
      customer_note,
      created_by
    ) values (
      v_lead_id,
      v_location_id,
      v_unit_type_id,
      (p_appointment->>'scheduledAt')::timestamptz,
      coalesce((p_appointment->>'durationMinutes')::integer, 30),
      'pending',
      'customer',
      nullif(p_appointment->>'customerNote', ''),
      null
    ) returning id into v_appointment_id;
  end if;

  return jsonb_build_object(
    'lead_id', v_lead_id,
    'appointment_id', v_appointment_id
  );
end;
$$;

revoke all on function public.submit_public_lead_request(jsonb, jsonb)
from public, anon, authenticated;
grant execute on function public.submit_public_lead_request(jsonb, jsonb) to service_role;
