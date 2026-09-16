-- NupsBox P2.3 light booking CRM.
-- Viewing times are requests only; this migration does not reserve inventory.

create type public.appointment_status as enum (
  'pending', 'confirmed', 'completed', 'cancelled', 'no_show'
);
create type public.appointment_source as enum ('customer', 'staff');

create table public.lead_appointments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  location_id uuid references public.locations(id) on delete set null,
  unit_type_id uuid references public.unit_types(id) on delete set null,
  assigned_to uuid references public.profiles(id) on delete set null,
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 30
    check (duration_minutes between 15 and 180),
  status public.appointment_status not null default 'pending',
  source public.appointment_source not null,
  customer_note text,
  internal_note text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lead_appointment_history (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.lead_appointments(id) on delete restrict,
  lead_id uuid not null references public.leads(id) on delete cascade,
  changed_by uuid references public.profiles(id) on delete set null,
  event_type text not null,
  before_state jsonb,
  after_state jsonb not null,
  created_at timestamptz not null default now()
);

create trigger lead_appointments_set_updated_at
before update on public.lead_appointments
for each row execute function public.set_updated_at();

create index lead_appointments_lead_scheduled_idx
on public.lead_appointments(lead_id, scheduled_at desc);
create index lead_appointments_assignee_scheduled_idx
on public.lead_appointments(assigned_to, scheduled_at)
where assigned_to is not null;
create index lead_appointments_status_scheduled_idx
on public.lead_appointments(status, scheduled_at);
create index lead_appointment_history_appointment_created_idx
on public.lead_appointment_history(appointment_id, created_at desc);

create or replace function public.validate_lead_appointment_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.assigned_to is not null and not exists (
    select 1
    from public.profiles p
    where p.id = new.assigned_to
      and p.active = true
      and p.role in ('admin', 'staff')
  ) then
    raise exception 'appointment assignee must be an active admin or staff member'
      using errcode = '23514';
  end if;

  if tg_op = 'UPDATE' and (
    old.lead_id is distinct from new.lead_id or
    old.source is distinct from new.source or
    old.created_by is distinct from new.created_by
  ) then
    raise exception 'appointment ownership fields are immutable'
      using errcode = '23514';
  end if;

  if tg_op = 'UPDATE' and old.status in ('completed', 'cancelled', 'no_show') then
    raise exception 'terminal appointment is immutable' using errcode = '23514';
  end if;

  if tg_op = 'UPDATE'
     and old.status is distinct from new.status
     and not (
       (old.status = 'pending' and new.status in ('confirmed', 'cancelled')) or
       (old.status = 'confirmed' and new.status in ('completed', 'cancelled', 'no_show'))
     ) then
    raise exception 'invalid appointment status transition' using errcode = '23514';
  end if;

  if new.status = 'confirmed' and (
    new.location_id is null or new.assigned_to is null or new.scheduled_at <= now()
  ) then
    raise exception 'confirmed appointment requires future time, location and assignee'
      using errcode = '23514';
  end if;

  if (
    tg_op = 'INSERT' or
    (tg_op = 'UPDATE' and old.scheduled_at is distinct from new.scheduled_at)
  ) and new.status in ('pending', 'confirmed') and new.scheduled_at <= now() then
    raise exception 'active appointment scheduled_at must be in the future'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger lead_appointments_validate_change
before insert or update on public.lead_appointments
for each row execute function public.validate_lead_appointment_change();

create or replace function public.appointment_snapshot(row_value public.lead_appointments)
returns jsonb
language sql
stable
set search_path = public
as $$
  select jsonb_build_object(
    'id', row_value.id,
    'lead_id', row_value.lead_id,
    'location_id', row_value.location_id,
    'unit_type_id', row_value.unit_type_id,
    'assigned_to', row_value.assigned_to,
    'scheduled_at', row_value.scheduled_at,
    'duration_minutes', row_value.duration_minutes,
    'status', row_value.status,
    'source', row_value.source,
    'customer_note', row_value.customer_note,
    'internal_note', row_value.internal_note,
    'updated_at', row_value.updated_at
  );
$$;

create or replace function public.audit_lead_appointment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.lead_appointment_history (
      appointment_id, lead_id, changed_by, event_type, before_state, after_state
    ) values (
      new.id, new.lead_id, auth.uid(), 'created', null,
      public.appointment_snapshot(new)
    );
    return new;
  end if;

  if old.status is distinct from new.status then
    insert into public.lead_appointment_history (
      appointment_id, lead_id, changed_by, event_type, before_state, after_state
    ) values (
      new.id, new.lead_id, auth.uid(), 'status_changed',
      public.appointment_snapshot(old), public.appointment_snapshot(new)
    );
  end if;

  if old.scheduled_at is distinct from new.scheduled_at then
    insert into public.lead_appointment_history (
      appointment_id, lead_id, changed_by, event_type, before_state, after_state
    ) values (
      new.id, new.lead_id, auth.uid(), 'rescheduled',
      public.appointment_snapshot(old), public.appointment_snapshot(new)
    );
  end if;

  if old.duration_minutes is distinct from new.duration_minutes then
    insert into public.lead_appointment_history (
      appointment_id, lead_id, changed_by, event_type, before_state, after_state
    ) values (
      new.id, new.lead_id, auth.uid(), 'duration_changed',
      public.appointment_snapshot(old), public.appointment_snapshot(new)
    );
  end if;

  if old.location_id is distinct from new.location_id then
    insert into public.lead_appointment_history (
      appointment_id, lead_id, changed_by, event_type, before_state, after_state
    ) values (
      new.id, new.lead_id, auth.uid(), 'location_changed',
      public.appointment_snapshot(old), public.appointment_snapshot(new)
    );
  end if;

  if old.unit_type_id is distinct from new.unit_type_id then
    insert into public.lead_appointment_history (
      appointment_id, lead_id, changed_by, event_type, before_state, after_state
    ) values (
      new.id, new.lead_id, auth.uid(), 'unit_type_changed',
      public.appointment_snapshot(old), public.appointment_snapshot(new)
    );
  end if;

  if old.assigned_to is distinct from new.assigned_to then
    insert into public.lead_appointment_history (
      appointment_id, lead_id, changed_by, event_type, before_state, after_state
    ) values (
      new.id, new.lead_id, auth.uid(), 'assignment_changed',
      public.appointment_snapshot(old), public.appointment_snapshot(new)
    );
  end if;

  if old.customer_note is distinct from new.customer_note then
    insert into public.lead_appointment_history (
      appointment_id, lead_id, changed_by, event_type, before_state, after_state
    ) values (
      new.id, new.lead_id, auth.uid(), 'customer_note_changed',
      public.appointment_snapshot(old), public.appointment_snapshot(new)
    );
  end if;

  if old.internal_note is distinct from new.internal_note then
    insert into public.lead_appointment_history (
      appointment_id, lead_id, changed_by, event_type, before_state, after_state
    ) values (
      new.id, new.lead_id, auth.uid(), 'internal_note_changed',
      public.appointment_snapshot(old), public.appointment_snapshot(new)
    );
  end if;

  return new;
end;
$$;

create trigger lead_appointments_audit
after insert or update on public.lead_appointments
for each row execute function public.audit_lead_appointment();

create or replace function public.prevent_lead_appointment_history_mutation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  raise exception 'appointment history is append-only' using errcode = '23514';
end;
$$;

create trigger lead_appointment_history_immutable
before update or delete on public.lead_appointment_history
for each row execute function public.prevent_lead_appointment_history_mutation();

alter table public.lead_appointments enable row level security;
alter table public.lead_appointment_history enable row level security;

create policy lead_appointments_authenticated_read
on public.lead_appointments for select to authenticated
using (public.current_app_role() in ('admin', 'staff', 'viewer'));

create policy lead_appointments_staff_insert
on public.lead_appointments for insert to authenticated
with check (public.current_app_role() in ('admin', 'staff'));

create policy lead_appointments_staff_update
on public.lead_appointments for update to authenticated
using (public.current_app_role() in ('admin', 'staff'))
with check (public.current_app_role() in ('admin', 'staff'));

create policy lead_appointment_history_authenticated_read
on public.lead_appointment_history for select to authenticated
using (public.current_app_role() in ('admin', 'staff', 'viewer'));

drop policy if exists profiles_operational_read on public.profiles;
create policy profiles_operational_read
on public.profiles for select to authenticated
using (
  public.current_app_role() in ('admin', 'staff', 'viewer')
  and active = true
  and role in ('admin', 'staff')
);

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
begin
  insert into public.leads (
    full_name, phone, email, preferred_language, location_id, unit_type_id,
    need_type, estimated_volume, message, source, utm_source, utm_medium,
    utm_campaign, utm_content, landing_page, referrer, status
  ) values (
    trim(p_lead->>'fullName'),
    trim(p_lead->>'phone'),
    nullif(trim(p_lead->>'email'), ''),
    coalesce(nullif(p_lead->>'preferredLanguage', ''), 'vi'),
    nullif(p_lead->>'locationId', '')::uuid,
    nullif(p_lead->>'unitTypeId', '')::uuid,
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
      lead_id, location_id, unit_type_id, scheduled_at, duration_minutes,
      status, source, customer_note, created_by
    ) values (
      v_lead_id,
      nullif(p_lead->>'locationId', '')::uuid,
      nullif(p_lead->>'unitTypeId', '')::uuid,
      (p_appointment->>'scheduledAt')::timestamptz,
      coalesce((p_appointment->>'durationMinutes')::integer, 30),
      'pending',
      'customer',
      nullif(p_appointment->>'customerNote', ''),
      null
    ) returning id into v_appointment_id;
  end if;

  return jsonb_build_object('lead_id', v_lead_id, 'appointment_id', v_appointment_id);
end;
$$;

revoke all on function public.validate_lead_appointment_change() from public, anon, authenticated;
revoke all on function public.appointment_snapshot(public.lead_appointments) from public, anon, authenticated;
revoke all on function public.audit_lead_appointment() from public, anon, authenticated;
revoke all on function public.prevent_lead_appointment_history_mutation() from public, anon, authenticated;
revoke all on function public.submit_public_lead_request(jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.submit_public_lead_request(jsonb, jsonb) to service_role;
