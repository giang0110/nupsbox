# NupsBox P2.3 Light Booking CRM Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the existing NupsBox lead CRM with lightweight storage-viewing appointments so customers can request a preferred viewing time and staff can manage the appointment lifecycle without implementing real-time reservation, stock locking, or payment.

**Architecture:** Keep the existing `leads`, `lead_notes`, and `lead_status_history` pipeline and add a focused `lead_appointments` subsystem plus immutable appointment history. Public submissions continue through `/api/leads`, but lead + optional appointment creation is performed atomically by one server-only Postgres RPC called with the existing Supabase admin client. Authenticated admin mutations use the normal Supabase server client so RLS remains authoritative.

**Tech Stack:** Next.js 16.3.3 App Router, React 19.3, TypeScript 5.9, Zod 4.6, Supabase/Postgres 17, pgTAP, Vitest 5, Playwright 1.63, GitHub Actions, Vercel.

**Spec:** `docs/superpowers/specs/2026-09-15-nupsbox-p23-light-booking-crm-design.md`

## Global Constraints

- Public viewing times are requests only; public flow may create `pending`, never `confirmed`.
- A lead may have multiple appointments; appointment history is retained.
- Appointment statuses are exactly `pending`, `confirmed`, `completed`, `cancelled`, `no_show`.
- Allowed transitions are exactly `pending -> confirmed`, `pending -> cancelled`, `confirmed -> completed`, `confirmed -> cancelled`, `confirmed -> no_show`.
- Default duration is 30 minutes; accepted range is 15–180 minutes.
- `location_id` and `unit_type_id` may be null while pending.
- `confirmed` requires a location, an active admin/staff assignee, and a future `scheduled_at`.
- `completed`, `cancelled`, and `no_show` are terminal and reject ordinary edits.
- Appointment status never automatically forces a lead status.
- Public/anonymous clients cannot read or directly mutate appointment/history tables.
- `admin` and `staff` may mutate appointments; `viewer` is read-only.
- No service-role credential may reach browser code.
- Public lead + optional appointment creation must be atomic.
- Store timestamps as `timestamptz`; interpret `datetime-local` input as `Asia/Ho_Chi_Minh` (`UTC+07:00`).
- Reuse the existing lead rate-limit path and existing `leads:*` permissions.
- Do not implement reservation/stock locking, payment, calendar sync, messaging automation, generic task management, media upload, content seeding, DNS, or `nupsbox.vn` cutover.
- Production migration is a separate explicit approval gate after the implementation PR is green.

## File Map

### Database contract

- Create `supabase/migrations/20260915000400_phase2_light_booking_crm.sql` — appointment enums/tables, validation, audit, RLS, atomic public RPC.
- Modify `supabase/tests/schema_contract.sql` — schema/function/trigger/index contracts.
- Modify `supabase/tests/rls_contract.sql` — explicit appointment/history policy contracts.
- Modify `supabase/tests/crm_behavior.sql` — database invariant and atomicity behavior.
- Modify `types/database.ts` — regenerate after the migration.

### Appointment domain

- Create `features/appointments/domain.ts` — status/source types and transition graph.
- Create `features/appointments/schema.ts` — public/admin input schemas.
- Create `features/appointments/time.ts` — HCMC `datetime-local` conversion.
- Create `tests/unit/appointment-domain.test.ts`.
- Create `tests/unit/appointment-schema.test.ts`.
- Create `tests/unit/appointment-time.test.ts`.

### Public submission

- Create `features/leads/request-schema.ts` — existing lead input + optional appointment request.
- Modify `features/leads/create-lead.ts` — validate, rate-limit, call atomic repository path.
- Modify `features/leads/repository.ts` — call `submit_public_lead_request` RPC.
- Modify `app/api/leads/route.ts` — preserve HTTP error contract, return optional `appointmentId`.
- Create `tests/unit/lead-request-schema.test.ts`.

### Admin CRM

- Modify `features/admin/leads.ts` — assignee + next-appointment summary.
- Create `features/admin/lead-detail.ts` — detailed CRM read model.
- Create `features/admin/lead-timeline.ts` — presentation-only timeline composition.
- Create `features/admin/appointments.ts` — appointment mutation validation and conflict error.
- Modify `app/admin/leads/actions.ts` — lead assignment/note actions in addition to status.
- Create `app/admin/leads/[id]/actions.ts` — appointment server actions.
- Create `app/admin/leads/[id]/page.tsx` — lead-detail workspace.
- Modify `app/admin/leads/page.tsx` — link/detail summary.
- Create `components/admin/appointment-form.tsx`.
- Create `components/admin/appointment-actions.tsx`.
- Create `components/admin/appointment-list.tsx`.
- Create `components/admin/lead-assignee-form.tsx`.
- Create `components/admin/lead-note-form.tsx`.
- Create `components/admin/lead-timeline.tsx`.
- Create `tests/unit/admin-lead-detail.test.ts`.
- Create `tests/unit/lead-timeline.test.ts`.
- Create `tests/unit/admin-appointments.test.ts`.
- Create `tests/unit/admin-lead-mutations.test.ts`.

### Public `/dat-kho`

- Create `features/catalog/booking-options.ts` — real DB UUID choices only; no marketing fallback IDs.
- Create `components/forms/booking-request-form.tsx` — bilingual request form.
- Modify `app/[locale]/dat-kho/page.tsx` — render form and keep noindex.
- Create `tests/unit/booking-request-form.test.tsx`.
- Create `tests/e2e/booking-request.spec.ts`.

### Delivery

- Modify `docs/production-checklist.md` — P2.3 migration/smoke gate.
- Do not change `.github/workflows/ci.yml` canonical/domain expectations in this phase.

---

### Task 1: Add the appointment database contract

**Files:**
- Create: `supabase/migrations/20260915000400_phase2_light_booking_crm.sql`
- Modify: `supabase/tests/schema_contract.sql`
- Modify: `supabase/tests/rls_contract.sql`
- Modify: `supabase/tests/crm_behavior.sql`

**Interfaces:**
- Produces enum `public.appointment_status`.
- Produces enum `public.appointment_source`.
- Produces tables `public.lead_appointments`, `public.lead_appointment_history`.
- Produces `public.submit_public_lead_request(jsonb, jsonb) returns jsonb`.
- Produces DB-level status/assignee/terminal invariants and audit history.

- [ ] **Step 1: Add failing schema-contract assertions**

Append concrete assertions to `supabase/tests/schema_contract.sql` and increase its `plan(...)` count by the exact number added:

```sql
select has_type('public', 'appointment_status', 'appointment_status enum exists');
select has_type('public', 'appointment_source', 'appointment_source enum exists');
select has_table('public', 'lead_appointments', 'lead appointments exists');
select has_table('public', 'lead_appointment_history', 'appointment history exists');
select has_function(
  'public',
  'submit_public_lead_request',
  array['jsonb', 'jsonb'],
  'atomic public lead RPC exists'
);
select ok(
  exists (
    select 1
    from pg_catalog.pg_trigger t
    join pg_catalog.pg_class r on r.oid = t.tgrelid
    join pg_catalog.pg_namespace n on n.oid = r.relnamespace
    where n.nspname = 'public'
      and r.relname = 'lead_appointments'
      and t.tgname = 'lead_appointments_validate_change'
      and not t.tgisinternal
  ),
  'appointment validation trigger exists'
);
select ok(
  exists (
    select 1
    from pg_catalog.pg_trigger t
    join pg_catalog.pg_class r on r.oid = t.tgrelid
    join pg_catalog.pg_namespace n on n.oid = r.relnamespace
    where n.nspname = 'public'
      and r.relname = 'lead_appointments'
      and t.tgname = 'lead_appointments_audit'
      and not t.tgisinternal
  ),
  'appointment audit trigger exists'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_indexes
    where schemaname = 'public'
      and tablename = 'lead_appointments'
      and indexname = 'lead_appointments_lead_scheduled_idx'
  ),
  'lead appointment schedule index exists'
);
```

- [ ] **Step 2: Add failing RLS policy-definition assertions**

Append to `supabase/tests/rls_contract.sql` and update its plan count:

```sql
select policies_are(
  'public',
  'lead_appointments',
  array[
    'lead_appointments_authenticated_read',
    'lead_appointments_staff_insert',
    'lead_appointments_staff_update'
  ],
  'appointment policies are explicit'
);
select policies_are(
  'public',
  'lead_appointment_history',
  array['lead_appointment_history_authenticated_read'],
  'appointment history is read-only through normal RLS paths'
);
select policy_roles_are(
  'public',
  'lead_appointments',
  'lead_appointments_authenticated_read',
  array['authenticated'],
  'appointment read is authenticated only'
);
select policy_roles_are(
  'public',
  'lead_appointment_history',
  'lead_appointment_history_authenticated_read',
  array['authenticated'],
  'appointment history read is authenticated only'
);
select is(
  (
    select count(*)::integer
    from pg_catalog.pg_policies
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
    where schemaname = 'public'
      and tablename = 'lead_appointments'
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
    where schemaname = 'public'
      and tablename = 'lead_appointments'
      and policyname = 'lead_appointments_staff_insert'
  ), false),
  'appointment insert is admin/staff only'
);
select ok(
  coalesce((
    select qual like '%viewer%'
    from pg_catalog.pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'profiles_operational_read'
  ), false),
  'viewer can resolve active operational assignee names'
);
```

This task tests RLS as policy contracts, matching the repository's existing `rls_contract.sql` style. Application role mutation behavior is separately tested in Task 5; do not invent non-existent JWT fixture helpers.

- [ ] **Step 3: Add failing database-behavior assertions**

At the top of the new appointment section in `supabase/tests/crm_behavior.sql`, insert a real auth user/profile plus a real location so confirmation can be exercised:

```sql
insert into auth.users (
  id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values (
  '20000000-0000-4000-8000-000000000001'::uuid,
  'authenticated',
  'authenticated',
  'p23-staff@example.invalid',
  '',
  now(),
  '{}'::jsonb,
  '{}'::jsonb,
  now(),
  now()
);

insert into public.profiles (id, full_name, role, active)
values (
  '20000000-0000-4000-8000-000000000001'::uuid,
  'P2.3 Test Staff',
  'staff',
  true
);

insert into public.locations (
  id, slug, name_vi, name_en, address_vi, address_en, district, city, status
) values (
  '30000000-0000-4000-8000-000000000001'::uuid,
  'p23-test-location',
  'Kho test P2.3',
  'P2.3 test location',
  'Test address',
  'Test address',
  'Test',
  'Ho Chi Minh City',
  'active'
);

insert into public.leads (
  id, full_name, phone, need_type, estimated_volume, status, source
) values (
  '10000000-0000-4000-8000-000000000002'::uuid,
  'P2.3 Appointment Lead',
  '0900000002',
  'other',
  'unknown',
  'new',
  'p23_pgtap'
);
```

Then add actual pgTAP assertions such as:

```sql
select lives_ok(
  $$insert into public.lead_appointments (
      id, lead_id, scheduled_at, source
    ) values (
      '40000000-0000-4000-8000-000000000001'::uuid,
      '10000000-0000-4000-8000-000000000002'::uuid,
      now() + interval '2 days',
      'staff'
    )$$,
  'pending appointment may start without location or assignee'
);

select throws_ok(
  $$update public.lead_appointments
      set status = 'confirmed'
      where id = '40000000-0000-4000-8000-000000000001'::uuid$$,
  '23514',
  'confirmed appointment requires future time, location and assignee',
  'confirmation fails without required operational fields'
);

update public.lead_appointments
set location_id = '30000000-0000-4000-8000-000000000001'::uuid,
    assigned_to = '20000000-0000-4000-8000-000000000001'::uuid
where id = '40000000-0000-4000-8000-000000000001'::uuid;

select lives_ok(
  $$update public.lead_appointments
      set status = 'confirmed'
      where id = '40000000-0000-4000-8000-000000000001'::uuid$$,
  'pending can become confirmed with location, active staff assignee and future time'
);

select throws_ok(
  $$update public.lead_appointments
      set status = 'pending'
      where id = '40000000-0000-4000-8000-000000000001'::uuid$$,
  '23514',
  'invalid appointment status transition',
  'confirmed cannot move backwards to pending'
);

select lives_ok(
  $$update public.lead_appointments
      set status = 'completed'
      where id = '40000000-0000-4000-8000-000000000001'::uuid$$,
  'confirmed may become completed'
);

select throws_ok(
  $$update public.lead_appointments
      set internal_note = 'late edit'
      where id = '40000000-0000-4000-8000-000000000001'::uuid$$,
  '23514',
  'terminal appointment is immutable',
  'completed appointment rejects ordinary edits'
);

select cmp_ok(
  (select count(*) from public.lead_appointment_history
   where appointment_id = '40000000-0000-4000-8000-000000000001'::uuid),
  '>=',
  3::bigint,
  'appointment changes create immutable history rows'
);
```

Add duration boundary assertions using `throws_ok` for 14 and 181 minutes and `lives_ok` for 30 minutes. Add a separate pending appointment assertion that `pending -> completed` fails with `invalid appointment status transition`.

For atomicity, capture counts before an intentionally invalid RPC call and prove they remain unchanged:

```sql
create temporary table p23_counts_before as
select
  (select count(*) from public.leads where source = 'p23_atomic_failure') as leads,
  (select count(*) from public.lead_appointments a
    join public.leads l on l.id = a.lead_id
    where l.source = 'p23_atomic_failure') as appointments;

select throws_ok(
  $$select public.submit_public_lead_request(
      jsonb_build_object(
        'fullName', 'Atomic Failure',
        'phone', '0900000099',
        'preferredLanguage', 'vi',
        'needType', 'other',
        'estimatedVolume', 'unknown',
        'source', 'p23_atomic_failure'
      ),
      jsonb_build_object(
        'scheduledAt', (now() - interval '1 hour')::text,
        'durationMinutes', 30
      )
    )$$,
  '23514',
  'active appointment scheduled_at must be in the future',
  'invalid appointment rolls back the lead insert in the same RPC statement'
);

select is(
  (select count(*)::integer from public.leads where source = 'p23_atomic_failure'),
  (select leads::integer from p23_counts_before),
  'failed atomic RPC leaves no lead behind'
);
```

Also add a valid RPC call and assert its returned lead has exactly one linked `pending/customer` appointment.

- [ ] **Step 4: Run the database suite to verify RED**

```bash
supabase db start
supabase test db
```

Expected: FAIL on the new enum/table/function/policy/trigger assertions because migration `00400` does not exist yet.

- [ ] **Step 5: Implement migration `00400`**

Create the enums and tables:

```sql
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
```

- [ ] **Step 6: Implement the DB validation trigger**

Use one trigger function so RLS cannot be bypassed through malformed authenticated updates:

```sql
create or replace function public.validate_lead_appointment_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.assigned_to is not null and not exists (
    select 1 from public.profiles p
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
    raise exception 'terminal appointment is immutable'
      using errcode = '23514';
  end if;

  if tg_op = 'UPDATE' and old.status is distinct from new.status and not (
    (old.status = 'pending' and new.status in ('confirmed', 'cancelled')) or
    (old.status = 'confirmed' and new.status in ('completed', 'cancelled', 'no_show'))
  ) then
    raise exception 'invalid appointment status transition'
      using errcode = '23514';
  end if;

  if new.status = 'confirmed' and (
    new.location_id is null or
    new.assigned_to is null or
    new.scheduled_at <= now()
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

revoke all on function public.validate_lead_appointment_change()
from public, anon, authenticated;
```

- [ ] **Step 7: Implement immutable history**

Create a SQL helper `public.appointment_snapshot(public.lead_appointments) returns jsonb` plus `public.audit_lead_appointment()` so insert writes `created`, and update writes one row per changed material field using these event names:

```text
status_changed
rescheduled
duration_changed
location_changed
unit_type_changed
assignment_changed
customer_note_changed
internal_note_changed
```

Use this exact snapshot shape for `before_state`/`after_state`:

```sql
jsonb_build_object(
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
)
```

Attach:

```sql
create trigger lead_appointments_audit
after insert or update on public.lead_appointments
for each row execute function public.audit_lead_appointment();
```

Revoke direct execute on trigger-only helper/functions from `public`, `anon`, and `authenticated`.

- [ ] **Step 8: Implement RLS and operational-profile read**

```sql
alter table public.lead_appointments enable row level security;
alter table public.lead_appointment_history enable row level security;

create policy lead_appointments_authenticated_read
on public.lead_appointments
for select to authenticated
using (public.current_app_role() in ('admin', 'staff', 'viewer'));

create policy lead_appointments_staff_insert
on public.lead_appointments
for insert to authenticated
with check (public.current_app_role() in ('admin', 'staff'));

create policy lead_appointments_staff_update
on public.lead_appointments
for update to authenticated
using (public.current_app_role() in ('admin', 'staff'))
with check (public.current_app_role() in ('admin', 'staff'));

create policy lead_appointment_history_authenticated_read
on public.lead_appointment_history
for select to authenticated
using (public.current_app_role() in ('admin', 'staff', 'viewer'));

drop policy if exists profiles_operational_read on public.profiles;
create policy profiles_operational_read
on public.profiles
for select to authenticated
using (
  public.current_app_role() in ('admin', 'staff', 'viewer')
  and active = true
  and role in ('admin', 'staff')
);
```

Do not create DELETE policies or ordinary history INSERT/UPDATE policies.

- [ ] **Step 9: Implement the atomic server-only RPC**

The RPC accepts only already-validated whitelisted JSON and never trusts public status/assignee/internal metadata:

```sql
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
    full_name, phone, email, preferred_language,
    location_id, unit_type_id, need_type, estimated_volume,
    message, source, utm_source, utm_medium, utm_campaign,
    utm_content, landing_page, referrer, status
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
      lead_id, location_id, unit_type_id, scheduled_at,
      duration_minutes, status, source, customer_note, created_by
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

  return jsonb_build_object(
    'lead_id', v_lead_id,
    'appointment_id', v_appointment_id
  );
end;
$$;

revoke all on function public.submit_public_lead_request(jsonb, jsonb)
from public, anon, authenticated;
grant execute on function public.submit_public_lead_request(jsonb, jsonb)
to service_role;
```

- [ ] **Step 10: Reset local DB and verify GREEN**

```bash
supabase db reset
supabase test db
```

Expected: all pgTAP files pass with zero failed assertions.

- [ ] **Step 11: Commit Task 1**

```bash
git add supabase/migrations/20260915000400_phase2_light_booking_crm.sql \
  supabase/tests/schema_contract.sql \
  supabase/tests/rls_contract.sql \
  supabase/tests/crm_behavior.sql
git commit -m "feat: add light booking appointment schema"
```

---

### Task 2: Add appointment domain types, schemas, and time conversion

**Files:**
- Modify: `types/database.ts`
- Create: `features/appointments/domain.ts`
- Create: `features/appointments/schema.ts`
- Create: `features/appointments/time.ts`
- Create: `tests/unit/appointment-domain.test.ts`
- Create: `tests/unit/appointment-schema.test.ts`
- Create: `tests/unit/appointment-time.test.ts`

**Interfaces:**
- Produces `AppointmentStatus`, `AppointmentSource` from generated DB enums.
- Produces `canTransitionAppointment(from, to): boolean`.
- Produces `PublicAppointmentRequestSchema`, `AppointmentCreateInputSchema`, `AppointmentUpdateInputSchema`.
- Produces `hoChiMinhLocalToIso(value: string): string`.

- [ ] **Step 1: Write failing state-machine tests**

```ts
import {describe, expect, it} from 'vitest';
import {canTransitionAppointment, terminalAppointmentStatuses} from '@/features/appointments/domain';

describe('appointment transition graph', () => {
  it.each([
    ['pending', 'confirmed'],
    ['pending', 'cancelled'],
    ['confirmed', 'completed'],
    ['confirmed', 'cancelled'],
    ['confirmed', 'no_show']
  ] as const)('allows %s -> %s', (from, to) => {
    expect(canTransitionAppointment(from, to)).toBe(true);
  });

  it.each([
    ['pending', 'completed'],
    ['pending', 'no_show'],
    ['confirmed', 'pending'],
    ['completed', 'confirmed'],
    ['cancelled', 'pending'],
    ['no_show', 'confirmed']
  ] as const)('rejects %s -> %s', (from, to) => {
    expect(canTransitionAppointment(from, to)).toBe(false);
  });

  it('defines terminal states', () => {
    expect(terminalAppointmentStatuses).toEqual(['completed', 'cancelled', 'no_show']);
  });
});
```

- [ ] **Step 2: Write failing schema/time tests**

Use concrete schema cases:

```ts
expect(PublicAppointmentRequestSchema.parse({
  scheduledAt: '2026-09-20T02:30:00.000Z'
}).durationMinutes).toBe(30);

expect(() => PublicAppointmentRequestSchema.parse({
  scheduledAt: '2026-09-20T02:30:00.000Z',
  durationMinutes: 14
})).toThrow();

expect(() => PublicAppointmentRequestSchema.parse({
  scheduledAt: '2026-09-20T02:30:00.000Z',
  status: 'confirmed'
})).toThrow();

expect(hoChiMinhLocalToIso('2026-09-20T09:30'))
  .toBe('2026-09-20T02:30:00.000Z');
expect(() => hoChiMinhLocalToIso('20/09/2026 09:30'))
  .toThrow('invalid_local_datetime');
```

- [ ] **Step 3: Run targeted tests to verify RED**

```bash
npm run test:run -- tests/unit/appointment-domain.test.ts tests/unit/appointment-schema.test.ts tests/unit/appointment-time.test.ts
```

Expected: fail because the appointment modules do not exist.

- [ ] **Step 4: Regenerate Supabase types**

```bash
npx supabase gen types typescript --local > types/database.ts
```

Verify `types/database.ts` contains `lead_appointments`, `lead_appointment_history`, `appointment_status`, `appointment_source`, and `submit_public_lead_request` before continuing.

- [ ] **Step 5: Implement `features/appointments/domain.ts`**

```ts
import type {Database} from '@/types/database';

export type AppointmentStatus = Database['public']['Enums']['appointment_status'];
export type AppointmentSource = Database['public']['Enums']['appointment_source'];

export const appointmentStatuses = [
  'pending', 'confirmed', 'completed', 'cancelled', 'no_show'
] as const satisfies readonly AppointmentStatus[];

export const terminalAppointmentStatuses = [
  'completed', 'cancelled', 'no_show'
] as const satisfies readonly AppointmentStatus[];

const transitions: Record<AppointmentStatus, readonly AppointmentStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled', 'no_show'],
  completed: [],
  cancelled: [],
  no_show: []
};

export function canTransitionAppointment(from: AppointmentStatus, to: AppointmentStatus) {
  return transitions[from].includes(to);
}
```

- [ ] **Step 6: Implement `features/appointments/schema.ts`**

```ts
import {z} from 'zod';

const optionalText = (max: number) => z.preprocess(
  (value) => typeof value === 'string' && value.trim() === '' ? undefined : value,
  z.string().trim().max(max).optional()
);
const optionalUuid = z.preprocess(
  (value) => typeof value === 'string' && value.trim() === '' ? undefined : value,
  z.uuid().optional()
);

export const PublicAppointmentRequestSchema = z.object({
  scheduledAt: z.iso.datetime({offset: true}),
  durationMinutes: z.number().int().min(15).max(180).default(30),
  customerNote: optionalText(1000)
}).strict();

export const AppointmentCreateInputSchema = z.object({
  leadId: z.uuid(),
  locationId: optionalUuid,
  unitTypeId: optionalUuid,
  assignedTo: optionalUuid,
  scheduledAt: z.iso.datetime({offset: true}),
  durationMinutes: z.coerce.number().int().min(15).max(180).default(30),
  customerNote: optionalText(1000),
  internalNote: optionalText(2000)
}).strict();

export const AppointmentUpdateInputSchema = z.object({
  appointmentId: z.uuid(),
  leadId: z.uuid(),
  expectedUpdatedAt: z.iso.datetime({offset: true}),
  locationId: optionalUuid,
  unitTypeId: optionalUuid,
  assignedTo: optionalUuid,
  scheduledAt: z.iso.datetime({offset: true}).optional(),
  durationMinutes: z.coerce.number().int().min(15).max(180).optional(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show']).optional(),
  customerNote: optionalText(1000),
  internalNote: optionalText(2000)
}).strict();
```

- [ ] **Step 7: Implement `features/appointments/time.ts`**

```ts
const localDateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export function hoChiMinhLocalToIso(value: string): string {
  if (!localDateTimePattern.test(value)) throw new Error('invalid_local_datetime');
  const parsed = new Date(`${value}:00+07:00`);
  if (Number.isNaN(parsed.getTime())) throw new Error('invalid_local_datetime');
  return parsed.toISOString();
}
```

- [ ] **Step 8: Run targeted tests and typecheck**

```bash
npm run test:run -- tests/unit/appointment-domain.test.ts tests/unit/appointment-schema.test.ts tests/unit/appointment-time.test.ts
npm run typecheck
```

Expected: all targeted tests pass and typecheck exits 0.

- [ ] **Step 9: Commit Task 2**

```bash
git add types/database.ts features/appointments tests/unit/appointment-domain.test.ts \
  tests/unit/appointment-schema.test.ts tests/unit/appointment-time.test.ts
git commit -m "feat: add appointment domain validation"
```

---

### Task 3: Make the public lead endpoint atomically create an optional appointment

**Files:**
- Create: `features/leads/request-schema.ts`
- Modify: `features/leads/create-lead.ts`
- Modify: `features/leads/repository.ts`
- Modify: `app/api/leads/route.ts`
- Create: `tests/unit/lead-request-schema.test.ts`

**Interfaces:**
- Produces `PublicLeadRequestSchema` and `PublicLeadRequest`.
- Keeps `createLead(input, requestContext)` as the API-facing service name.
- Produces `insertLeadRequest(input): Promise<{leadId: string; appointmentId: string | null}>`.

- [ ] **Step 1: Write failing request-schema tests**

```ts
import {describe, expect, it} from 'vitest';
import {PublicLeadRequestSchema} from '@/features/leads/request-schema';

const base = {
  fullName: 'Nguyen Van A',
  phone: '0901234567',
  preferredLanguage: 'vi' as const,
  needType: 'other' as const,
  estimatedVolume: 'unknown' as const
};

describe('PublicLeadRequestSchema', () => {
  it('keeps existing lead-only payload valid', () => {
    expect(PublicLeadRequestSchema.parse(base).appointment).toBeUndefined();
  });

  it('accepts optional appointment request', () => {
    const result = PublicLeadRequestSchema.parse({
      ...base,
      appointment: {scheduledAt: '2026-09-20T02:30:00.000Z'}
    });
    expect(result.appointment?.durationMinutes).toBe(30);
  });

  it('rejects public status escalation', () => {
    expect(() => PublicLeadRequestSchema.parse({
      ...base,
      appointment: {
        scheduledAt: '2026-09-20T02:30:00.000Z',
        status: 'confirmed'
      }
    })).toThrow();
  });
});
```

- [ ] **Step 2: Run the test to verify RED**

```bash
npm run test:run -- tests/unit/lead-request-schema.test.ts
```

Expected: fail because `request-schema.ts` does not exist.

- [ ] **Step 3: Implement `features/leads/request-schema.ts`**

```ts
import {z} from 'zod';
import {PublicAppointmentRequestSchema} from '@/features/appointments/schema';
import {LeadInputSchema} from './schema';

export const PublicLeadRequestSchema = LeadInputSchema.extend({
  appointment: PublicAppointmentRequestSchema.optional()
}).strict();

export type PublicLeadRequest = z.infer<typeof PublicLeadRequestSchema>;
```

- [ ] **Step 4: Replace direct lead insert with the atomic RPC**

In `features/leads/repository.ts`, preserve `server-only` and `createSupabaseAdminClient()`, but replace `insertLead()` with:

```ts
import type {PublicLeadRequest} from './request-schema';

export async function insertLeadRequest(input: PublicLeadRequest) {
  const supabase = createSupabaseAdminClient();
  const {data, error} = await supabase.rpc('submit_public_lead_request', {
    p_lead: {
      fullName: input.fullName,
      phone: input.phone,
      email: input.email ?? null,
      preferredLanguage: input.preferredLanguage,
      locationId: input.locationId ?? null,
      unitTypeId: input.unitTypeId ?? null,
      needType: input.needType,
      estimatedVolume: input.estimatedVolume,
      message: input.message ?? null,
      source: input.source ?? input.utmSource ?? null,
      landingPage: input.landingPage ?? null,
      referrer: input.referrer ?? null,
      utmSource: input.utmSource ?? null,
      utmMedium: input.utmMedium ?? null,
      utmCampaign: input.utmCampaign ?? null,
      utmContent: input.utmContent ?? null
    },
    p_appointment: input.appointment ? {
      scheduledAt: input.appointment.scheduledAt,
      durationMinutes: input.appointment.durationMinutes,
      customerNote: input.appointment.customerNote ?? null
    } : null
  });

  if (error) throw error;
  const result = data as {lead_id?: string; appointment_id?: string | null} | null;
  if (!result?.lead_id) throw new Error('Lead request RPC did not return a lead id');
  return {leadId: result.lead_id, appointmentId: result.appointment_id ?? null};
}
```

- [ ] **Step 5: Update `createLead()` and preserve rate limiting**

```ts
export async function createLead(input: unknown, requestContext: LeadRequestContext) {
  const parsed = PublicLeadRequestSchema.parse(input);
  await enforceLeadRateLimit(requestContext.clientKey);
  const result = await insertLeadRequest(parsed);
  return {ok: true as const, ...result};
}
```

The rate-limit call remains before the database RPC.

- [ ] **Step 6: Preserve the API status contract**

Keep `app/api/leads/route.ts` error mapping unchanged:

```text
201: valid lead-only or lead+appointment request
400: invalid_json or invalid_lead
429: rate_limited
500: submit_failed
```

The only successful-response extension is optional `appointmentId` from `createLead()`.

- [ ] **Step 7: Run tests and typecheck**

```bash
npm run test:run -- tests/unit/lead-schema.test.ts tests/unit/lead-request-schema.test.ts
npm run typecheck
```

Expected: pass.

- [ ] **Step 8: Commit Task 3**

```bash
git add features/leads app/api/leads/route.ts tests/unit/lead-request-schema.test.ts
git commit -m "feat: add atomic public appointment requests"
```

---

### Task 4: Add the admin lead-detail read model and timeline

**Files:**
- Modify: `features/admin/leads.ts`
- Create: `features/admin/lead-detail.ts`
- Create: `features/admin/lead-timeline.ts`
- Create: `tests/unit/admin-lead-detail.test.ts`
- Create: `tests/unit/lead-timeline.test.ts`

**Interfaces:**
- `listAdminLeads()` adds `assignedTo`, `assignedName`, `nextAppointment`.
- `getAdminLeadDetail(leadId: string, role: AppRole)` returns one typed CRM workspace model or `null`.
- `buildLeadTimeline(input)` returns newest-first presentation events; it never persists a generic activity table.

- [ ] **Step 1: Write failing timeline test**

```ts
const result = buildLeadTimeline({
  notes: [{
    id: 'n1', note: 'Called customer', authorName: 'Staff A',
    createdAt: '2026-09-15T02:00:00Z'
  }],
  statusHistory: [{
    id: 's1', fromStatus: 'new', toStatus: 'contacted',
    changedByName: 'Staff A', createdAt: '2026-09-15T03:00:00Z'
  }],
  appointmentHistory: [{
    id: 'a1', eventType: 'created', changedByName: null,
    createdAt: '2026-09-15T04:00:00Z'
  }]
});
expect(result.map((item) => item.id)).toEqual(['a1', 's1', 'n1']);
```

- [ ] **Step 2: Write failing next-appointment mapping tests**

Export a pure helper `selectNextAppointment(rows, now)` and test it directly:

```ts
const now = new Date('2026-09-15T03:00:00Z');
expect(selectNextAppointment([
  {id: 'done', status: 'completed', scheduledAt: '2026-09-16T03:00:00Z'},
  {id: 'later', status: 'pending', scheduledAt: '2026-09-17T03:00:00Z'},
  {id: 'next', status: 'confirmed', scheduledAt: '2026-09-16T04:00:00Z'}
], now)?.id).toBe('next');

expect(selectNextAppointment([
  {id: 'overdue', status: 'confirmed', scheduledAt: '2026-09-14T03:00:00Z'}
], now)?.overdue).toBe(true);
```

Also assert `canMutateAppointments === false` for `viewer` and missing assignee profile maps to `assignedName: null`.

- [ ] **Step 3: Run tests to verify RED**

```bash
npm run test:run -- tests/unit/admin-lead-detail.test.ts tests/unit/lead-timeline.test.ts
```

Expected: fail because the new modules/helpers do not exist.

- [ ] **Step 4: Enrich `AdminLeadRow`**

Add:

```ts
assignedTo: string | null;
assignedName: string | null;
nextAppointment: {
  id: string;
  scheduledAt: string;
  status: 'pending' | 'confirmed';
  overdue: boolean;
} | null;
```

Keep the existing maximum of 100 lead rows and existing status filter. Query appointment/profile data with the authenticated server client and map it in pure helpers rather than adding a DB view in this phase.

- [ ] **Step 5: Implement `getAdminLeadDetail()`**

Validate `leadId` using the same UUID pattern used in `features/admin/leads.ts`, then query:

```text
leads: one row
lead_notes: lead_id, newest first
lead_status_history: lead_id, newest first
lead_appointments: lead_id, scheduled_at desc
lead_appointment_history: appointment IDs, created_at desc
profiles: active admin/staff labels
locations: active/published labels
unit_types: active/published labels
```

Return a model that includes:

```ts
{
  lead,
  appointments,
  notes,
  statusHistory,
  appointmentHistory,
  assigneeOptions,
  locationOptions,
  unitTypeOptions,
  timeline,
  canMutateAppointments: can(role, 'leads:update'),
  canAssignLead: can(role, 'leads:assign'),
  canAddNote: can(role, 'leads:note')
}
```

Return `null` when the lead does not exist.

- [ ] **Step 6: Implement `buildLeadTimeline()`**

```ts
export type LeadTimelineItem = {
  id: string;
  kind: 'note' | 'lead_status' | 'appointment';
  createdAt: string;
  title: string;
  detail: string | null;
  actorName: string | null;
};
```

Map each input source to this type and sort descending by `Date.parse(createdAt)`.

- [ ] **Step 7: Run tests and typecheck**

```bash
npm run test:run -- tests/unit/admin-leads.test.ts tests/unit/admin-lead-detail.test.ts tests/unit/lead-timeline.test.ts
npm run typecheck
```

Expected: pass.

- [ ] **Step 8: Commit Task 4**

```bash
git add features/admin/leads.ts features/admin/lead-detail.ts features/admin/lead-timeline.ts \
  tests/unit/admin-lead-detail.test.ts tests/unit/lead-timeline.test.ts tests/unit/admin-leads.test.ts
git commit -m "feat: add CRM lead detail read model"
```

---

### Task 5: Add admin appointment mutations and lead-detail UI

**Files:**
- Create: `features/admin/appointments.ts`
- Modify: `app/admin/leads/actions.ts`
- Create: `app/admin/leads/[id]/actions.ts`
- Create: `app/admin/leads/[id]/page.tsx`
- Modify: `app/admin/leads/page.tsx`
- Create: `components/admin/appointment-form.tsx`
- Create: `components/admin/appointment-actions.tsx`
- Create: `components/admin/appointment-list.tsx`
- Create: `components/admin/lead-assignee-form.tsx`
- Create: `components/admin/lead-note-form.tsx`
- Create: `components/admin/lead-timeline.tsx`
- Create: `tests/unit/admin-appointments.test.ts`
- Create: `tests/unit/admin-lead-mutations.test.ts`

**Interfaces:**
- Produces `AppointmentConflictError`.
- Produces `prepareAppointmentCreate(role, input, now)`; staff-created appointments are always `pending` and `source='staff'` is set by the server action.
- Produces `prepareAppointmentUpdate(role, currentAppointment, input, now)`; confirmation validation occurs here, not during creation.

- [ ] **Step 1: Write failing mutation tests**

Use fixed `now = new Date('2026-09-15T03:00:00Z')`:

```ts
expect(() => prepareAppointmentCreate('viewer', validCreate, now)).toThrow('forbidden');
expect(prepareAppointmentCreate('staff', validCreate, now).scheduledAt)
  .toBe(validCreate.scheduledAt);
expect(prepareAppointmentCreate('admin', validCreate, now).scheduledAt)
  .toBe(validCreate.scheduledAt);

expect(() => prepareAppointmentUpdate('staff', pendingAppointment, {
  appointmentId: pendingAppointment.id,
  leadId: pendingAppointment.leadId,
  expectedUpdatedAt: pendingAppointment.updatedAt,
  status: 'confirmed'
}, now)).toThrow('confirmed_requires_location_assignee_future_time');

expect(() => prepareAppointmentUpdate('staff', {
  ...pendingAppointment,
  locationId: '30000000-0000-4000-8000-000000000001',
  assignedTo: '20000000-0000-4000-8000-000000000001'
}, {
  appointmentId: pendingAppointment.id,
  leadId: pendingAppointment.leadId,
  expectedUpdatedAt: pendingAppointment.updatedAt,
  status: 'completed'
}, now)).toThrow('invalid_status_transition');
```

Add a positive `pending -> confirmed` case with location, assignee, and future time; add terminal-edit and past-time rejection cases. This replaces the invalid idea of creating a new appointment directly as `confirmed`.

For lead mutations:

```ts
expect(() => prepareLeadAssignment('viewer', leadId, staffId)).toThrow('forbidden');
expect(prepareLeadAssignment('staff', leadId, staffId)).toEqual({leadId, assignedTo: staffId});
expect(() => prepareLeadNote('viewer', leadId, 'note')).toThrow('forbidden');
expect(prepareLeadNote('admin', leadId, 'note')).toEqual({leadId, note: 'note'});
```

- [ ] **Step 2: Run targeted tests to verify RED**

```bash
npm run test:run -- tests/unit/admin-appointments.test.ts tests/unit/admin-lead-mutations.test.ts
```

Expected: fail because the new preparation functions do not exist.

- [ ] **Step 3: Implement `features/admin/appointments.ts`**

```ts
export class AppointmentConflictError extends Error {
  constructor() {
    super('appointment_conflict');
    this.name = 'AppointmentConflictError';
  }
}

export function prepareAppointmentCreate(role: AppRole, input: unknown, now = new Date()) {
  if (!can(role, 'leads:update')) throw new Error('forbidden');
  const parsed = AppointmentCreateInputSchema.parse(input);
  if (new Date(parsed.scheduledAt) <= now) throw new Error('scheduled_at_not_future');
  return parsed;
}
```

Implement `prepareAppointmentUpdate()` by:

```ts
if (!can(role, 'leads:update')) throw new Error('forbidden');
if (terminalAppointmentStatuses.includes(current.status)) throw new Error('terminal_appointment');
const parsed = AppointmentUpdateInputSchema.parse(input);
const resultingStatus = parsed.status ?? current.status;
if (parsed.status && parsed.status !== current.status &&
    !canTransitionAppointment(current.status, parsed.status)) {
  throw new Error('invalid_status_transition');
}
const resultingLocation = parsed.locationId ?? current.locationId;
const resultingAssignee = parsed.assignedTo ?? current.assignedTo;
const resultingTime = parsed.scheduledAt ?? current.scheduledAt;
if (resultingStatus === 'confirmed' && (
  !resultingLocation || !resultingAssignee || new Date(resultingTime) <= now
)) {
  throw new Error('confirmed_requires_location_assignee_future_time');
}
if ((resultingStatus === 'pending' || resultingStatus === 'confirmed') &&
    new Date(resultingTime) <= now) {
  throw new Error('scheduled_at_not_future');
}
```

Return only the whitelisted mutable patch plus IDs/concurrency token.

- [ ] **Step 4: Add lead assignment/note preparation and actions**

In `app/admin/leads/actions.ts`, keep `updateLeadStatus()` and add pure exported preparation helpers plus server actions. The helpers must enforce:

```ts
if (!can(role, 'leads:assign')) throw new Error('forbidden');
if (!uuidPattern.test(leadId) || !uuidPattern.test(assignedTo)) throw new Error('invalid_id');
```

and:

```ts
if (!can(role, 'leads:note')) throw new Error('forbidden');
const note = rawNote.trim();
if (!uuidPattern.test(leadId) || !note || note.length > 4000) throw new Error('invalid_note');
```

Assignment updates `leads.assigned_to`; note insert uses `author_id = session.user.id`. DB constraints/triggers remain final enforcement.

- [ ] **Step 5: Implement appointment server actions with optimistic concurrency**

Creation in `app/admin/leads/[id]/actions.ts` must insert:

```ts
{
  lead_id: parsed.leadId,
  location_id: parsed.locationId ?? null,
  unit_type_id: parsed.unitTypeId ?? null,
  assigned_to: parsed.assignedTo ?? null,
  scheduled_at: parsed.scheduledAt,
  duration_minutes: parsed.durationMinutes,
  status: 'pending',
  source: 'staff',
  customer_note: parsed.customerNote ?? null,
  internal_note: parsed.internalNote ?? null,
  created_by: session.user.id
}
```

Update must compare `updated_at`:

```ts
const {data, error} = await supabase
  .from('lead_appointments')
  .update(patch)
  .eq('id', appointmentId)
  .eq('lead_id', leadId)
  .eq('updated_at', expectedUpdatedAt)
  .select('id, updated_at')
  .maybeSingle();

if (error) throw error;
if (!data) throw new AppointmentConflictError();
```

Never insert/update `lead_appointment_history` from application code; triggers own it.

- [ ] **Step 6: Implement the lead-detail page**

Authorization:

```ts
const session = await requireAdminUser();
if (!can(session.role, 'leads:read')) redirect('/admin');
const detail = await getAdminLeadDetail(id, session.role);
if (!detail) notFound();
```

Render in this order:

```text
Back link + customer header
Customer/contact/need summary
Lead status + lead assignee
Next appointment summary
Create appointment form (admin/staff only)
Active and historical appointments
Lead note form + notes
Unified timeline
```

- [ ] **Step 7: Implement appointment components**

`appointment-form.tsx` fields are exactly:

```text
datetime-local
duration_minutes (default 30)
optional location
optional unit type
optional assignee (default UI selection = lead assignee)
customer note
internal note
```

Before invoking the server action, transform the local field:

```ts
const scheduledAt = hoChiMinhLocalToIso(String(form.get('scheduledAtLocal') ?? ''));
```

`appointment-actions.tsx` exposes only:

```text
pending: Confirm, Cancel
confirmed: Complete, No-show, Cancel
completed/cancelled/no_show: no status buttons
```

Edit/reschedule is visible only for `pending` and `confirmed`.

- [ ] **Step 8: Enforce viewer read-only presentation**

Condition mutation UI on the read-model booleans:

```tsx
{detail.canMutateAppointments ? <AppointmentForm ... /> : null}
{detail.canAssignLead ? <LeadAssigneeForm ... /> : null}
{detail.canAddNote ? <LeadNoteForm ... /> : null}
```

Viewer still sees appointment detail/history, lead notes, lead status history, and timeline. Security still depends on server checks + RLS, not hidden buttons.

- [ ] **Step 9: Enrich `/admin/leads`**

Add lead-detail links, assignee name, and next appointment. For a `confirmed` appointment with `scheduledAt < now`, render an overdue label. Keep existing lead-status filtering and the 100-row cap.

- [ ] **Step 10: Run tests, lint, and typecheck**

```bash
npm run test:run -- tests/unit/admin-leads.test.ts tests/unit/admin-lead-detail.test.ts \
  tests/unit/lead-timeline.test.ts tests/unit/admin-appointments.test.ts \
  tests/unit/admin-lead-mutations.test.ts
npm run lint
npm run typecheck
```

Expected: all commands exit 0.

- [ ] **Step 11: Commit Task 5**

```bash
git add features/admin app/admin/leads components/admin tests/unit/admin-lead-detail.test.ts \
  tests/unit/lead-timeline.test.ts tests/unit/admin-appointments.test.ts \
  tests/unit/admin-lead-mutations.test.ts tests/unit/admin-leads.test.ts
git commit -m "feat: add appointment management to CRM"
```

---

### Task 6: Turn `/dat-kho` into the public viewing-request form

**Files:**
- Create: `features/catalog/booking-options.ts`
- Create: `components/forms/booking-request-form.tsx`
- Modify: `app/[locale]/dat-kho/page.tsx`
- Create: `tests/unit/booking-request-form.test.tsx`
- Create: `tests/e2e/booking-request.spec.ts`

**Interfaces:**
- Produces `getBookingOptions(locale): Promise<{locations: BookingOption[]; unitTypes: BookingOption[]}>`.
- `BookingRequestForm` posts the existing lead shape plus optional `appointment` to `/api/leads`.
- Booking options are real UUID-backed DB records only; fallback IDs such as `verified-s` are forbidden here.

- [ ] **Step 1: Write failing component contract test**

```tsx
render(<BookingRequestForm locale="vi" locations={[]} unitTypes={[]} />);
expect(screen.getByRole('button', {name: 'Gửi yêu cầu đặt lịch'})).toBeInTheDocument();
expect(screen.getByText(
  'Đây là yêu cầu lịch hẹn. NupsBox sẽ liên hệ xác nhận trước khi lịch có hiệu lực.'
)).toBeInTheDocument();
```

Also assert the form renders with zero options and offers a “Chưa xác định” choice rather than failing.

- [ ] **Step 2: Write failing Playwright payload test**

```ts
import {expect, test} from '@playwright/test';

test('submits a preferred viewing time as a request', async ({page}) => {
  let payload: Record<string, unknown> | null = null;
  await page.route('**/api/leads', async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        leadId: '11111111-1111-4111-8111-111111111111',
        appointmentId: '22222222-2222-4222-8222-222222222222'
      })
    });
  });

  await page.goto('/dat-kho');
  await page.getByLabel('Tên').fill('Khach Test');
  await page.getByLabel('Số điện thoại').fill('0901234567');
  await page.getByLabel('Ngày giờ muốn xem kho').fill('2026-09-20T09:30');
  await page.getByRole('button', {name: 'Gửi yêu cầu đặt lịch'}).click();

  await expect(page.getByRole('status')).toContainText('Đã nhận yêu cầu');
  expect(payload).toMatchObject({
    fullName: 'Khach Test',
    phone: '0901234567',
    appointment: {
      scheduledAt: '2026-09-20T02:30:00.000Z',
      durationMinutes: 30
    }
  });
});
```

Add a second test that leaves date/time blank and asserts the outgoing payload has no `appointment` property.

- [ ] **Step 3: Run tests to verify RED**

```bash
npm run test:run -- tests/unit/booking-request-form.test.tsx
npm run test:e2e -- tests/e2e/booking-request.spec.ts
```

Expected: fail because the new form does not exist and `/dat-kho` is still the placeholder page.

- [ ] **Step 4: Implement real-only booking option loading**

`features/catalog/booking-options.ts` must use `createSupabaseServerClient()` and never call `features/catalog/public-catalog.ts`. If `NEXT_PUBLIC_SUPABASE_URL` is missing or contains `example.supabase.co`, return empty arrays so CI builds remain deterministic.

Query:

```ts
const [locationsResult, unitTypesResult] = await Promise.all([
  supabase.from('locations')
    .select('id, name_vi, name_en')
    .eq('status', 'active')
    .not('published_at', 'is', null)
    .order('sort_order'),
  supabase.from('unit_types')
    .select('id, name_vi, name_en')
    .eq('active', true)
    .not('published_at', 'is', null)
    .order('sort_order')
]);
```

Map only `{id, label}` using locale. If either query errors, throw server-side; do not silently substitute marketing fallback IDs.

- [ ] **Step 5: Implement `BookingRequestForm`**

Include exactly these fields:

```text
fullName required
phone required
email optional
needType
estimatedVolume
locationId optional
unitTypeId optional
preferredViewingAt optional datetime-local
message optional
appointmentNote optional
website honeypot
UTM/landingPage/referrer attribution
```

Create appointment only when `preferredViewingAt` is non-empty:

```ts
const localViewingTime = String(form.get('preferredViewingAt') ?? '');
const appointment = localViewingTime ? {
  scheduledAt: hoChiMinhLocalToIso(localViewingTime),
  durationMinutes: 30,
  customerNote: String(form.get('appointmentNote') ?? '') || undefined
} : undefined;
```

Send with the existing lead API pattern:

```ts
const response = await fetch('/api/leads', {
  method: 'POST',
  headers: {'content-type': 'application/json'},
  body: JSON.stringify({...leadPayload, ...(appointment ? {appointment} : {})})
});
```

Handle `429` separately and otherwise show generic safe failure text. On success, say the request was received; do not use “đã đặt”, “đã giữ chỗ”, “confirmed”, or “reserved”.

- [ ] **Step 6: Replace `/dat-kho` placeholder**

Keep:

```ts
export const metadata: Metadata = {robots: {index: false, follow: true}};
```

Use `setRequestLocale(locale)`, validate locale, call `getBookingOptions(locale)`, and render bilingual heading/copy plus `BookingRequestForm`. Vietnamese must include exactly:

```text
Đây là yêu cầu lịch hẹn. NupsBox sẽ liên hệ xác nhận trước khi lịch có hiệu lực.
```

English must clearly state the selected time is a request and will be confirmed by NupsBox.

- [ ] **Step 7: Run unit + browser tests**

```bash
npm run test:run -- tests/unit/booking-request-form.test.tsx tests/unit/lead-request-schema.test.ts \
  tests/unit/appointment-time.test.ts
npx playwright install chromium
npm run test:e2e -- tests/e2e/booking-request.spec.ts
```

Expected: pass.

- [ ] **Step 8: Commit Task 6**

```bash
git add features/catalog/booking-options.ts components/forms/booking-request-form.tsx \
  'app/[locale]/dat-kho/page.tsx' tests/unit/booking-request-form.test.tsx \
  tests/e2e/booking-request.spec.ts
git commit -m "feat: add public viewing request flow"
```

---

### Task 7: Add the production verification gate

**Files:**
- Modify: `docs/production-checklist.md`

**Interfaces:**
- Produces the manual production-migration/smoke checklist.
- Does not change DNS, canonical origin, or `PRODUCTION_URL`.

- [ ] **Step 1: Add the pre-production requirements**

Write this checklist verbatim or equivalently:

```text
P2.3 production migration gate
[ ] CI quality succeeds on the exact implementation PR head SHA
[ ] Database Tests succeeds on the exact implementation PR head SHA
[ ] Vercel exact-head status succeeds
[ ] Preview smoke succeeds when the PR is deployable
[ ] PR is reviewed/approved
[ ] User explicitly approves applying 20260915000400_phase2_light_booking_crm.sql to production
```

- [ ] **Step 2: Add public production smoke**

Document two identifiable submissions using `utmCampaign=p23-production-smoke-YYYYMMDD`:

```text
1. Lead-only request: HTTP 201, exactly one lead, zero linked appointments.
2. Request with future preferred time: HTTP 201, exactly one lead and one linked appointment.
3. Linked appointment must be status=pending and source=customer.
4. Anonymous direct read of appointment/history data must not expose rows.
5. Public UI/response must not say the time is confirmed or reserved.
6. Preserve audit/history; mark smoke leads as test data and set lead status to lost after verification rather than deleting them.
```

- [ ] **Step 3: Add authenticated CRM smoke**

Document:

```text
With valid test credentials:
- viewer reads CRM detail but cannot mutate
- staff creates a pending appointment
- confirmation is rejected until location + active assignee + future time exist
- valid pending -> confirmed succeeds
- reschedule creates history
- stale updated_at update is rejected as a conflict
- confirmed -> completed/no_show/cancelled follows legal transitions
- terminal appointment rejects later edit
- appointment history shows material changes

If valid authenticated test credentials are unavailable, record this smoke as NOT PERFORMED.
Never report it as passed without credentials and direct evidence.
```

- [ ] **Step 4: Commit Task 7**

```bash
git add docs/production-checklist.md
git commit -m "docs: add P2.3 production verification checklist"
```

---

### Task 8: Run full verification and prepare the implementation PR

**Files:**
- No new feature files expected; fix only P2.3-caused failures.

**Interfaces:**
- Produces a reviewable implementation PR.
- Stops before production migration.

- [ ] **Step 1: Run the full test suite**

```bash
npm run test:run
```

Expected: zero failed tests.

- [ ] **Step 2: Run lint and typecheck**

```bash
npm run lint
npm run typecheck
```

Expected: both exit 0.

- [ ] **Step 3: Run the production build with CI-safe values**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co \
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ci_only \
NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
npm run build
```

Expected: exit 0.

- [ ] **Step 4: Recreate the local DB and run pgTAP**

```bash
supabase db reset
supabase test db
```

Expected: zero failed pgTAP assertions.

- [ ] **Step 5: Run the booking browser test**

```bash
npx playwright install chromium
npm run test:e2e -- tests/e2e/booking-request.spec.ts
```

Expected: pass.

- [ ] **Step 6: Verify generated-type drift**

```bash
npx supabase gen types typescript --local > /tmp/nupsbox-database.ts
diff -u types/database.ts /tmp/nupsbox-database.ts
```

Expected: no diff.

- [ ] **Step 7: Review the final scope diff**

```bash
git diff main...HEAD --stat
git diff main...HEAD --name-only
```

Expected: only P2.3 schema/tests/types/domain/admin/public-booking/checklist files plus approved P2.3 spec/plan docs. No DNS/domain/media/content-seeding changes.

- [ ] **Step 8: Push a feature branch and open the implementation PR**

Create the implementation branch from the then-current `main` (not from an outdated docs-only base if `main` advanced), carry the approved spec/plan into it, and use:

```text
PR title: feat: implement P2.3 light booking CRM
```

PR body must state:

```text
- appointment schema + RLS + immutable audit + atomic public RPC
- admin lead-detail CRM + appointment lifecycle
- public /dat-kho request form
- unit/pgTAP/browser verification
- explicitly no reservation/payment/domain cutover
```

- [ ] **Step 9: Verify exact-head checks before recommending merge**

On the exact implementation PR head SHA verify:

```text
CI quality: success
Database Tests: success
Vercel exact-head status: success
Preview smoke: success when deployable
```

Do not recommend merge while any applicable check is pending/failing.

- [ ] **Step 10: Stop at the production gate**

After any later approved merge, report the exact merge SHA and stop. Do not apply production migration `20260915000400_phase2_light_booking_crm.sql` until the user explicitly approves that production action. After production migration approval/application, perform the Task 7 smoke procedure; authenticated smoke remains conditional on valid credentials.
