# NupsBox P2.3 Light Booking CRM Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the existing NupsBox lead CRM with lightweight storage-viewing appointments so customers can request a preferred viewing time and staff can manage the appointment lifecycle without implementing real-time reservation, stock locking, or payment.

**Architecture:** Keep the existing `leads`, `lead_notes`, and `lead_status_history` model and add a dedicated `lead_appointments` subsystem plus immutable appointment history. Public submissions continue through `/api/leads`, while lead + optional appointment creation becomes one server-only Postgres transaction/RPC called by the existing Supabase admin client. Admin appointment mutations use the authenticated Supabase server client so application checks and RLS both apply.

**Tech Stack:** Next.js 16.3.3 App Router, React 19.3, TypeScript 5.9, Zod 4.6, Supabase/Postgres 17, pgTAP, Vitest 5, Playwright 1.63, GitHub Actions, Vercel.

**Spec:** `docs/superpowers/specs/2026-09-15-nupsbox-p23-light-booking-crm-design.md`

## Global Constraints

- Public viewing times are requests only; public flow creates `pending`, never `confirmed`.
- One lead may have many appointments; appointment history is retained.
- Statuses are exactly `pending`, `confirmed`, `completed`, `cancelled`, `no_show`.
- Allowed transitions are exactly `pending -> confirmed`, `pending -> cancelled`, `confirmed -> completed`, `confirmed -> cancelled`, `confirmed -> no_show`.
- Default duration is 30 minutes; valid range is 15–180 minutes.
- `location_id` and `unit_type_id` may be null while pending.
- `confirmed` requires a location, active admin/staff assignee, and future `scheduled_at`.
- `completed`, `cancelled`, and `no_show` are terminal and reject ordinary edits.
- Appointment status does not automatically change lead status.
- Public/anonymous users cannot read or directly mutate appointment/history tables.
- `admin` and `staff` may mutate appointments; `viewer` is read-only.
- No service-role credential may reach browser code.
- Public lead + optional appointment creation must be atomic.
- Store timestamps as `timestamptz`; interpret `datetime-local` input as `Asia/Ho_Chi_Minh` (`UTC+07:00`).
- Reuse existing lead rate limiting and existing `leads:*` permissions.
- Do not implement stock reservation, stock decrement, payment, calendar sync, messaging automation, generic tasks, media upload, content seeding, DNS, or `nupsbox.vn` cutover.
- Production migration is a separate explicit approval gate after the implementation PR is green.

## File Map

**Database**
- Create `supabase/migrations/20260915000400_phase2_light_booking_crm.sql`.
- Modify `supabase/tests/schema_contract.sql`.
- Modify `supabase/tests/rls_contract.sql`.
- Modify `supabase/tests/crm_behavior.sql`.
- Modify `types/database.ts` by regeneration.

**Domain and public submission**
- Create `features/appointments/domain.ts`.
- Create `features/appointments/schema.ts`.
- Create `features/appointments/time.ts`.
- Create `features/leads/request-schema.ts`.
- Modify `features/leads/create-lead.ts`.
- Modify `features/leads/repository.ts`.
- Modify `app/api/leads/route.ts`.

**Admin CRM**
- Modify `features/admin/leads.ts`.
- Create `features/admin/lead-detail.ts`.
- Create `features/admin/lead-timeline.ts`.
- Create `features/admin/appointments.ts`.
- Modify `app/admin/leads/actions.ts`.
- Create `app/admin/leads/[id]/actions.ts`.
- Create `app/admin/leads/[id]/page.tsx`.
- Modify `app/admin/leads/page.tsx`.
- Create `components/admin/appointment-form.tsx`.
- Create `components/admin/appointment-actions.tsx`.
- Create `components/admin/appointment-list.tsx`.
- Create `components/admin/lead-assignee-form.tsx`.
- Create `components/admin/lead-note-form.tsx`.
- Create `components/admin/lead-timeline.tsx`.

**Public page**
- Create `features/catalog/booking-options.ts`.
- Create `components/forms/booking-request-form.tsx`.
- Modify `app/[locale]/dat-kho/page.tsx`.

**Tests and delivery docs**
- Create `tests/unit/appointment-domain.test.ts`.
- Create `tests/unit/appointment-schema.test.ts`.
- Create `tests/unit/appointment-time.test.ts`.
- Create `tests/unit/lead-request-schema.test.ts`.
- Create `tests/unit/admin-lead-detail.test.ts`.
- Create `tests/unit/lead-timeline.test.ts`.
- Create `tests/unit/admin-appointments.test.ts`.
- Create `tests/unit/admin-lead-mutations.test.ts`.
- Create `tests/unit/booking-request-form.test.tsx`.
- Create `tests/e2e/booking-request.spec.ts`.
- Modify `docs/production-checklist.md`.

---

### Task 1: Add appointment tables, invariants, audit, RLS, and atomic public RPC

**Files:**
- Create: `supabase/migrations/20260915000400_phase2_light_booking_crm.sql`
- Modify: `supabase/tests/schema_contract.sql`
- Modify: `supabase/tests/rls_contract.sql`
- Modify: `supabase/tests/crm_behavior.sql`

**Interfaces:**
- Produces `public.appointment_status`, `public.appointment_source`.
- Produces `public.lead_appointments`, `public.lead_appointment_history`.
- Produces `public.submit_public_lead_request(p_lead jsonb, p_appointment jsonb default null) returns jsonb`.
- Produces DB enforcement for status transitions, assignee validity, active time, terminal immutability, and immutable audit history.

- [ ] **Step 1: Add failing schema and RLS contract tests**

Add these assertions and increase the relevant `plan(...)` counts exactly:

```sql
-- schema_contract.sql
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

-- rls_contract.sql
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
```

- [ ] **Step 2: Add failing database behavior tests**

Seed one auth-backed staff profile, one location, and one lead inside the test transaction:

```sql
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
```

Append concrete behavior assertions:

```sql
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
```

Add a separate illegal direct transition:

```sql
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
```

Add atomic success/failure assertions:

```sql
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
```

- [ ] **Step 3: Run database tests and verify RED**

```bash
supabase db start
supabase test db
```

Expected: new assertions fail because migration `00400` is absent.

- [ ] **Step 4: Implement enums, tables, indexes, and updated-at trigger**

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
  duration_minutes integer not null default 30 check (duration_minutes between 15 and 180),
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
on public.lead_appointments(assigned_to, scheduled_at) where assigned_to is not null;
create index lead_appointments_status_scheduled_idx
on public.lead_appointments(status, scheduled_at);
create index lead_appointment_history_appointment_created_idx
on public.lead_appointment_history(appointment_id, created_at desc);
```

- [ ] **Step 5: Implement the DB validation trigger**

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
    where p.id = new.assigned_to and p.active = true and p.role in ('admin', 'staff')
  ) then
    raise exception 'appointment assignee must be an active admin or staff member'
      using errcode = '23514';
  end if;

  if tg_op = 'UPDATE' and (
    old.lead_id is distinct from new.lead_id or
    old.source is distinct from new.source or
    old.created_by is distinct from new.created_by
  ) then
    raise exception 'appointment ownership fields are immutable' using errcode = '23514';
  end if;

  if tg_op = 'UPDATE' and old.status in ('completed', 'cancelled', 'no_show') then
    raise exception 'terminal appointment is immutable' using errcode = '23514';
  end if;

  if tg_op = 'UPDATE' and old.status is distinct from new.status and not (
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
revoke all on function public.validate_lead_appointment_change()
from public, anon, authenticated;
```

- [ ] **Step 6: Implement appointment history trigger**

Create a snapshot helper with this exact shape:

```sql
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
```

Implement `public.audit_lead_appointment()` as `security definer`. On `INSERT`, insert one history row with `event_type='created'`, `before_state=null`, and `after_state=appointment_snapshot(new)`. On `UPDATE`, for each changed field insert one row using:

```text
status -> status_changed
scheduled_at -> rescheduled
duration_minutes -> duration_changed
location_id -> location_changed
unit_type_id -> unit_type_changed
assigned_to -> assignment_changed
customer_note -> customer_note_changed
internal_note -> internal_note_changed
```

Each update history row uses `appointment_snapshot(old)` and `appointment_snapshot(new)`, `lead_id=new.lead_id`, and `changed_by=auth.uid()`. Attach it:

```sql
create trigger lead_appointments_audit
after insert or update on public.lead_appointments
for each row execute function public.audit_lead_appointment();
revoke all on function public.appointment_snapshot(public.lead_appointments)
from public, anon, authenticated;
revoke all on function public.audit_lead_appointment()
from public, anon, authenticated;
```

- [ ] **Step 7: Implement RLS**

```sql
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
  and active = true and role in ('admin', 'staff')
);
```

No DELETE policy is created; no normal INSERT/UPDATE policy is created for history.

- [ ] **Step 8: Implement atomic public RPC**

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
    nullif(p_lead->>'utmSource', ''), nullif(p_lead->>'utmMedium', ''),
    nullif(p_lead->>'utmCampaign', ''), nullif(p_lead->>'utmContent', ''),
    nullif(p_lead->>'landingPage', ''), nullif(p_lead->>'referrer', ''),
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
      'pending', 'customer', nullif(p_appointment->>'customerNote', ''), null
    ) returning id into v_appointment_id;
  end if;

  return jsonb_build_object('lead_id', v_lead_id, 'appointment_id', v_appointment_id);
end;
$$;
revoke all on function public.submit_public_lead_request(jsonb, jsonb)
from public, anon, authenticated;
grant execute on function public.submit_public_lead_request(jsonb, jsonb) to service_role;
```

- [ ] **Step 9: Reset local DB and verify GREEN**

```bash
supabase db reset
supabase test db
```

Expected: all pgTAP files pass with zero failed assertions.

- [ ] **Step 10: Commit Task 1**

```bash
git add supabase/migrations/20260915000400_phase2_light_booking_crm.sql \
  supabase/tests/schema_contract.sql supabase/tests/rls_contract.sql \
  supabase/tests/crm_behavior.sql
git commit -m "feat: add light booking appointment schema"
```

---

### Task 2: Add appointment domain types, schemas, and HCMC time conversion

**Files:**
- Modify: `types/database.ts`
- Create: `features/appointments/domain.ts`
- Create: `features/appointments/schema.ts`
- Create: `features/appointments/time.ts`
- Test: `tests/unit/appointment-domain.test.ts`
- Test: `tests/unit/appointment-schema.test.ts`
- Test: `tests/unit/appointment-time.test.ts`

**Interfaces:**
- Produces `AppointmentStatus`, `AppointmentSource`.
- Produces `canTransitionAppointment(from, to): boolean`.
- Produces `PublicAppointmentRequestSchema`, `AppointmentCreateInputSchema`, `AppointmentUpdateInputSchema`.
- Produces `hoChiMinhLocalToIso(value: string): string`.

- [ ] **Step 1: Write failing domain/schema/time tests**

```ts
// appointment-domain.test.ts
expect(canTransitionAppointment('pending', 'confirmed')).toBe(true);
expect(canTransitionAppointment('confirmed', 'no_show')).toBe(true);
expect(canTransitionAppointment('pending', 'completed')).toBe(false);
expect(canTransitionAppointment('completed', 'confirmed')).toBe(false);
expect(terminalAppointmentStatuses).toEqual(['completed', 'cancelled', 'no_show']);

// appointment-schema.test.ts
expect(PublicAppointmentRequestSchema.parse({
  scheduledAt: '2026-09-20T02:30:00.000Z'
}).durationMinutes).toBe(30);
expect(() => PublicAppointmentRequestSchema.parse({
  scheduledAt: '2026-09-20T02:30:00.000Z', durationMinutes: 14
})).toThrow();
expect(() => PublicAppointmentRequestSchema.parse({
  scheduledAt: '2026-09-20T02:30:00.000Z', status: 'confirmed'
})).toThrow();

// appointment-time.test.ts
expect(hoChiMinhLocalToIso('2026-09-20T09:30'))
  .toBe('2026-09-20T02:30:00.000Z');
expect(() => hoChiMinhLocalToIso('20/09/2026 09:30'))
  .toThrow('invalid_local_datetime');
```

- [ ] **Step 2: Run tests to verify RED**

```bash
npm run test:run -- tests/unit/appointment-domain.test.ts \
  tests/unit/appointment-schema.test.ts tests/unit/appointment-time.test.ts
```

Expected: fail because appointment modules do not exist.

- [ ] **Step 3: Regenerate DB types**

```bash
npx supabase gen types typescript --local > types/database.ts
```

Before proceeding, `types/database.ts` must contain both appointment tables, both enums, and `submit_public_lead_request`.

- [ ] **Step 4: Implement status/source domain**

```ts
import type {Database} from '@/types/database';
export type AppointmentStatus = Database['public']['Enums']['appointment_status'];
export type AppointmentSource = Database['public']['Enums']['appointment_source'];
export const terminalAppointmentStatuses = ['completed', 'cancelled', 'no_show'] as const;
const transitions: Record<AppointmentStatus, readonly AppointmentStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled', 'no_show'],
  completed: [], cancelled: [], no_show: []
};
export function canTransitionAppointment(from: AppointmentStatus, to: AppointmentStatus) {
  return transitions[from].includes(to);
}
```

- [ ] **Step 5: Implement input schemas with clearable patch fields**

```ts
import {z} from 'zod';
const createUuid = z.preprocess(
  (v) => typeof v === 'string' && v.trim() === '' ? undefined : v,
  z.uuid().optional()
);
const patchUuid = z.preprocess(
  (v) => typeof v === 'string' && v.trim() === '' ? null : v,
  z.uuid().nullable().optional()
);
const optionalText = (max: number) => z.preprocess(
  (v) => typeof v === 'string' && v.trim() === '' ? undefined : v,
  z.string().trim().max(max).optional()
);
const patchText = (max: number) => z.preprocess(
  (v) => typeof v === 'string' && v.trim() === '' ? null : v,
  z.string().trim().max(max).nullable().optional()
);

export const PublicAppointmentRequestSchema = z.object({
  scheduledAt: z.iso.datetime({offset: true}),
  durationMinutes: z.number().int().min(15).max(180).default(30),
  customerNote: optionalText(1000)
}).strict();

export const AppointmentCreateInputSchema = z.object({
  leadId: z.uuid(),
  locationId: createUuid,
  unitTypeId: createUuid,
  assignedTo: createUuid,
  scheduledAt: z.iso.datetime({offset: true}),
  durationMinutes: z.coerce.number().int().min(15).max(180).default(30),
  customerNote: optionalText(1000),
  internalNote: optionalText(2000)
}).strict();

export const AppointmentUpdateInputSchema = z.object({
  appointmentId: z.uuid(), leadId: z.uuid(),
  expectedUpdatedAt: z.iso.datetime({offset: true}),
  locationId: patchUuid, unitTypeId: patchUuid, assignedTo: patchUuid,
  scheduledAt: z.iso.datetime({offset: true}).optional(),
  durationMinutes: z.coerce.number().int().min(15).max(180).optional(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show']).optional(),
  customerNote: patchText(1000), internalNote: patchText(2000)
}).strict();
```

- [ ] **Step 6: Implement HCMC time conversion**

```ts
const pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
export function hoChiMinhLocalToIso(value: string): string {
  if (!pattern.test(value)) throw new Error('invalid_local_datetime');
  const parsed = new Date(`${value}:00+07:00`);
  if (Number.isNaN(parsed.getTime())) throw new Error('invalid_local_datetime');
  return parsed.toISOString();
}
```

- [ ] **Step 7: Run tests and typecheck**

```bash
npm run test:run -- tests/unit/appointment-domain.test.ts \
  tests/unit/appointment-schema.test.ts tests/unit/appointment-time.test.ts
npm run typecheck
```

Expected: pass.

- [ ] **Step 8: Commit Task 2**

```bash
git add types/database.ts features/appointments tests/unit/appointment-domain.test.ts \
  tests/unit/appointment-schema.test.ts tests/unit/appointment-time.test.ts
git commit -m "feat: add appointment domain validation"
```

---

### Task 3: Extend the existing public lead API with optional appointment creation

**Files:**
- Create: `features/leads/request-schema.ts`
- Modify: `features/leads/create-lead.ts`
- Modify: `features/leads/repository.ts`
- Modify: `app/api/leads/route.ts`
- Test: `tests/unit/lead-request-schema.test.ts`

**Interfaces:**
- Produces `PublicLeadRequestSchema`, `PublicLeadRequest`.
- Keeps `createLead(input, requestContext)` as route-level service.
- Produces `insertLeadRequest(input): Promise<{leadId: string; appointmentId: string | null}>`.

- [ ] **Step 1: Write failing request-schema tests**

```ts
const base = {
  fullName: 'Nguyen Van A', phone: '0901234567',
  preferredLanguage: 'vi' as const, needType: 'other' as const,
  estimatedVolume: 'unknown' as const
};
expect(PublicLeadRequestSchema.parse(base).appointment).toBeUndefined();
expect(PublicLeadRequestSchema.parse({
  ...base,
  appointment: {scheduledAt: '2026-09-20T02:30:00.000Z'}
}).appointment?.durationMinutes).toBe(30);
expect(() => PublicLeadRequestSchema.parse({
  ...base,
  appointment: {scheduledAt: '2026-09-20T02:30:00.000Z', status: 'confirmed'}
})).toThrow();
```

- [ ] **Step 2: Run test to verify RED**

```bash
npm run test:run -- tests/unit/lead-request-schema.test.ts
```

Expected: fail because `request-schema.ts` does not exist.

- [ ] **Step 3: Implement request schema**

```ts
import {z} from 'zod';
import {PublicAppointmentRequestSchema} from '@/features/appointments/schema';
import {LeadInputSchema} from './schema';
export const PublicLeadRequestSchema = LeadInputSchema.extend({
  appointment: PublicAppointmentRequestSchema.optional()
}).strict();
export type PublicLeadRequest = z.infer<typeof PublicLeadRequestSchema>;
```

- [ ] **Step 4: Replace direct insert with RPC repository call**

```ts
export async function insertLeadRequest(input: PublicLeadRequest) {
  const supabase = createSupabaseAdminClient();
  const {data, error} = await supabase.rpc('submit_public_lead_request', {
    p_lead: {
      fullName: input.fullName, phone: input.phone, email: input.email ?? null,
      preferredLanguage: input.preferredLanguage,
      locationId: input.locationId ?? null, unitTypeId: input.unitTypeId ?? null,
      needType: input.needType, estimatedVolume: input.estimatedVolume,
      message: input.message ?? null,
      source: input.source ?? input.utmSource ?? null,
      utmSource: input.utmSource ?? null, utmMedium: input.utmMedium ?? null,
      utmCampaign: input.utmCampaign ?? null, utmContent: input.utmContent ?? null,
      landingPage: input.landingPage ?? null, referrer: input.referrer ?? null
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

- [ ] **Step 5: Update `createLead()` while preserving the current rate-limit order**

```ts
export async function createLead(input: unknown, requestContext: LeadRequestContext) {
  const parsed = PublicLeadRequestSchema.parse(input);
  await enforceLeadRateLimit(requestContext.clientKey);
  const result = await insertLeadRequest(parsed);
  return {ok: true as const, ...result};
}
```

- [ ] **Step 6: Keep route errors stable**

`app/api/leads/route.ts` retains this mapping and only includes optional `appointmentId` on success:

```text
201 -> valid lead-only or lead+appointment
400 -> invalid_json / invalid_lead
429 -> rate_limited
500 -> submit_failed
```

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

### Task 4: Add admin lead-detail read model and timeline

**Files:**
- Modify: `features/admin/leads.ts`
- Create: `features/admin/lead-detail.ts`
- Create: `features/admin/lead-timeline.ts`
- Test: `tests/unit/admin-lead-detail.test.ts`
- Test: `tests/unit/lead-timeline.test.ts`

**Interfaces:**
- `listAdminLeads()` adds `assignedTo`, `assignedName`, `nextAppointment`.
- Produces `selectNextAppointment(rows, now)`.
- Produces `getAdminLeadDetail(leadId, role)`.
- Produces `buildLeadTimeline(input): LeadTimelineItem[]`.

- [ ] **Step 1: Write failing pure mapping tests**

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

const timeline = buildLeadTimeline({
  notes: [{id: 'n1', note: 'Called', authorName: 'Staff A', createdAt: '2026-09-15T02:00:00Z'}],
  statusHistory: [{id: 's1', fromStatus: 'new', toStatus: 'contacted', changedByName: 'Staff A', createdAt: '2026-09-15T03:00:00Z'}],
  appointmentHistory: [{id: 'a1', eventType: 'created', changedByName: null, createdAt: '2026-09-15T04:00:00Z'}]
});
expect(timeline.map((item) => item.id)).toEqual(['a1', 's1', 'n1']);
```

- [ ] **Step 2: Run tests to verify RED**

```bash
npm run test:run -- tests/unit/admin-lead-detail.test.ts tests/unit/lead-timeline.test.ts
```

Expected: fail because the helpers do not exist.

- [ ] **Step 3: Implement lead-list enrichment**

Extend `AdminLeadRow`:

```ts
assignedTo: string | null;
assignedName: string | null;
nextAppointment: {
  id: string; scheduledAt: string; status: 'pending' | 'confirmed'; overdue: boolean;
} | null;
```

`selectNextAppointment()` filters to `pending|confirmed`, sorts by `scheduledAt` ascending, returns the first future item when one exists, otherwise the latest overdue actionable item, and sets `overdue = status === 'confirmed' && scheduledAt < now`.

- [ ] **Step 4: Implement `getAdminLeadDetail()`**

Use the authenticated server client and load one lead plus:

```text
lead_notes ordered created_at desc
lead_status_history ordered created_at desc
lead_appointments ordered scheduled_at desc
lead_appointment_history for those appointment IDs ordered created_at desc
active admin/staff profiles for labels
locations for CRM selection
unit_types for CRM selection
```

Return:

```ts
{
  lead, appointments, notes, statusHistory, appointmentHistory,
  assigneeOptions, locationOptions, unitTypeOptions, timeline,
  canMutateAppointments: can(role, 'leads:update'),
  canAssignLead: can(role, 'leads:assign'),
  canAddNote: can(role, 'leads:note')
}
```

Return `null` for a missing lead; map missing assignee labels to `null`, not an exception.

- [ ] **Step 5: Implement timeline type and sorting**

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

Map each source into this shape and sort by `Date.parse(b.createdAt) - Date.parse(a.createdAt)`.

- [ ] **Step 6: Run tests and typecheck**

```bash
npm run test:run -- tests/unit/admin-leads.test.ts tests/unit/admin-lead-detail.test.ts \
  tests/unit/lead-timeline.test.ts
npm run typecheck
```

Expected: pass.

- [ ] **Step 7: Commit Task 4**

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
- Test: `tests/unit/admin-appointments.test.ts`
- Test: `tests/unit/admin-lead-mutations.test.ts`

**Interfaces:**
- Produces `AppointmentConflictError`.
- `prepareAppointmentCreate(role, input, now)` always prepares a new pending appointment.
- `prepareAppointmentUpdate(role, current, input, now)` handles confirmation/transition validation.
- Server update uses `expectedUpdatedAt` as optimistic-concurrency token.

- [ ] **Step 1: Write failing mutation tests**

```ts
const now = new Date('2026-09-15T03:00:00Z');
const validCreate = {
  leadId: '10000000-0000-4000-8000-000000000002',
  scheduledAt: '2026-09-20T03:00:00.000Z', durationMinutes: 30
};
expect(() => prepareAppointmentCreate('viewer', validCreate, now)).toThrow('forbidden');
expect(prepareAppointmentCreate('staff', validCreate, now).leadId).toBe(validCreate.leadId);

const pending = {
  id: '40000000-0000-4000-8000-000000000001',
  leadId: validCreate.leadId, status: 'pending' as const,
  locationId: null, assignedTo: null,
  scheduledAt: validCreate.scheduledAt,
  updatedAt: '2026-09-15T03:00:00.000Z'
};
expect(() => prepareAppointmentUpdate('staff', pending, {
  appointmentId: pending.id, leadId: pending.leadId,
  expectedUpdatedAt: pending.updatedAt, status: 'confirmed'
}, now)).toThrow('confirmed_requires_location_assignee_future_time');
expect(() => prepareAppointmentUpdate('staff', pending, {
  appointmentId: pending.id, leadId: pending.leadId,
  expectedUpdatedAt: pending.updatedAt, status: 'completed'
}, now)).toThrow('invalid_status_transition');
const ready = {
  ...pending,
  locationId: '30000000-0000-4000-8000-000000000001',
  assignedTo: '20000000-0000-4000-8000-000000000001'
};
expect(prepareAppointmentUpdate('staff', ready, {
  appointmentId: ready.id, leadId: ready.leadId,
  expectedUpdatedAt: ready.updatedAt, status: 'confirmed'
}, now).status).toBe('confirmed');
const completed = {...ready, status: 'completed' as const};
expect(() => prepareAppointmentUpdate('staff', completed, {
  appointmentId: completed.id, leadId: completed.leadId,
  expectedUpdatedAt: completed.updatedAt, internalNote: 'edit'
}, now)).toThrow('terminal_appointment');
```

Lead mutation tests:

```ts
expect(() => prepareLeadAssignment('viewer', leadId, staffId)).toThrow('forbidden');
expect(prepareLeadAssignment('staff', leadId, staffId)).toEqual({leadId, assignedTo: staffId});
expect(() => prepareLeadNote('viewer', leadId, 'note')).toThrow('forbidden');
expect(prepareLeadNote('admin', leadId, 'note')).toEqual({leadId, note: 'note'});
```

- [ ] **Step 2: Run tests to verify RED**

```bash
npm run test:run -- tests/unit/admin-appointments.test.ts tests/unit/admin-lead-mutations.test.ts
```

Expected: fail because preparation functions do not exist.

- [ ] **Step 3: Implement appointment mutation validation**

```ts
export class AppointmentConflictError extends Error {
  constructor() { super('appointment_conflict'); this.name = 'AppointmentConflictError'; }
}

export function prepareAppointmentCreate(role: AppRole, input: unknown, now = new Date()) {
  if (!can(role, 'leads:update')) throw new Error('forbidden');
  const parsed = AppointmentCreateInputSchema.parse(input);
  if (new Date(parsed.scheduledAt) <= now) throw new Error('scheduled_at_not_future');
  return parsed;
}
```

For updates, use explicit null-aware patch resolution:

```ts
const parsed = AppointmentUpdateInputSchema.parse(input);
if (!can(role, 'leads:update')) throw new Error('forbidden');
if (terminalAppointmentStatuses.includes(current.status)) throw new Error('terminal_appointment');
if (parsed.status && parsed.status !== current.status &&
    !canTransitionAppointment(current.status, parsed.status)) {
  throw new Error('invalid_status_transition');
}
const locationId = parsed.locationId !== undefined ? parsed.locationId : current.locationId;
const assignedTo = parsed.assignedTo !== undefined ? parsed.assignedTo : current.assignedTo;
const scheduledAt = parsed.scheduledAt ?? current.scheduledAt;
const status = parsed.status ?? current.status;
if (status === 'confirmed' && (!locationId || !assignedTo || new Date(scheduledAt) <= now)) {
  throw new Error('confirmed_requires_location_assignee_future_time');
}
if ((status === 'pending' || status === 'confirmed') && new Date(scheduledAt) <= now) {
  throw new Error('scheduled_at_not_future');
}
return {...parsed, locationId, assignedTo, scheduledAt, status};
```

- [ ] **Step 4: Implement lead assignment/note preparation and server actions**

Use existing permission names:

```ts
export function prepareLeadAssignment(role: AppRole, leadId: string, assignedTo: string) {
  if (!can(role, 'leads:assign')) throw new Error('forbidden');
  if (!uuidPattern.test(leadId) || !uuidPattern.test(assignedTo)) throw new Error('invalid_id');
  return {leadId, assignedTo};
}
export function prepareLeadNote(role: AppRole, leadId: string, rawNote: string) {
  if (!can(role, 'leads:note')) throw new Error('forbidden');
  const note = rawNote.trim();
  if (!uuidPattern.test(leadId) || !note || note.length > 4000) throw new Error('invalid_note');
  return {leadId, note};
}
```

Assignment action updates `leads.assigned_to`; note action inserts `{lead_id, author_id: session.user.id, note}`.

- [ ] **Step 5: Implement appointment server actions with optimistic concurrency**

Create inserts only `pending`/`staff` regardless of browser payload:

```ts
await supabase.from('lead_appointments').insert({
  lead_id: parsed.leadId,
  location_id: parsed.locationId ?? null,
  unit_type_id: parsed.unitTypeId ?? null,
  assigned_to: parsed.assignedTo ?? null,
  scheduled_at: parsed.scheduledAt,
  duration_minutes: parsed.durationMinutes,
  status: 'pending', source: 'staff',
  customer_note: parsed.customerNote ?? null,
  internal_note: parsed.internalNote ?? null,
  created_by: session.user.id
});
```

Update compares `updated_at`:

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

Revalidate `/admin/leads` and `/admin/leads/${leadId}` after successful mutations. Never write history directly from application code.

- [ ] **Step 6: Implement lead-detail UI and viewer read-only behavior**

Page authorization:

```ts
const session = await requireAdminUser();
if (!can(session.role, 'leads:read')) redirect('/admin');
const detail = await getAdminLeadDetail(id, session.role);
if (!detail) notFound();
```

Render: customer summary → lead status/assignee → next appointment → create appointment → appointment list/history → notes → timeline.

Mutation controls are conditional:

```tsx
{detail.canMutateAppointments ? <AppointmentForm {...props} /> : null}
{detail.canAssignLead ? <LeadAssigneeForm {...props} /> : null}
{detail.canAddNote ? <LeadNoteForm {...props} /> : null}
```

`appointment-actions.tsx` exposes exactly:

```text
pending: Confirm, Cancel
confirmed: Complete, No-show, Cancel
terminal: no status mutation buttons
```

`appointment-form.tsx` exposes `datetime-local`, duration default 30, optional location/unit/assignee, customer note, internal note; convert time with:

```ts
const scheduledAt = hoChiMinhLocalToIso(String(form.get('scheduledAtLocal') ?? ''));
```

- [ ] **Step 7: Enrich `/admin/leads`**

Add a detail link, assignee label, and next appointment label. Show “Quá hạn” only when next appointment is `confirmed` and its time is before `now`. Preserve current status filter and 100-row limit.

- [ ] **Step 8: Run tests, lint, and typecheck**

```bash
npm run test:run -- tests/unit/admin-leads.test.ts tests/unit/admin-lead-detail.test.ts \
  tests/unit/lead-timeline.test.ts tests/unit/admin-appointments.test.ts \
  tests/unit/admin-lead-mutations.test.ts
npm run lint
npm run typecheck
```

Expected: pass.

- [ ] **Step 9: Commit Task 5**

```bash
git add features/admin app/admin/leads components/admin tests/unit/admin-lead-detail.test.ts \
  tests/unit/lead-timeline.test.ts tests/unit/admin-appointments.test.ts \
  tests/unit/admin-lead-mutations.test.ts tests/unit/admin-leads.test.ts
git commit -m "feat: add appointment management to CRM"
```

---

### Task 6: Replace `/dat-kho` placeholder with a public viewing-request form

**Files:**
- Create: `features/catalog/booking-options.ts`
- Create: `components/forms/booking-request-form.tsx`
- Modify: `app/[locale]/dat-kho/page.tsx`
- Test: `tests/unit/booking-request-form.test.tsx`
- Test: `tests/e2e/booking-request.spec.ts`

**Interfaces:**
- Produces `getBookingOptions(locale)` with only real UUID-backed published options.
- `BookingRequestForm` posts existing lead fields + optional appointment to `/api/leads`.
- No marketing fallback ID may be submitted as `locationId`/`unitTypeId`.

- [ ] **Step 1: Write failing component and Playwright tests**

Unit contract:

```tsx
render(<BookingRequestForm locale="vi" locations={[]} unitTypes={[]} />);
expect(screen.getByRole('button', {name: 'Gửi yêu cầu đặt lịch'})).toBeInTheDocument();
expect(screen.getByText(
  'Đây là yêu cầu lịch hẹn. NupsBox sẽ liên hệ xác nhận trước khi lịch có hiệu lực.'
)).toBeInTheDocument();
expect(screen.getAllByText('Chưa xác định').length).toBeGreaterThan(0);
```

Playwright appointment payload:

```ts
let payload: Record<string, unknown> | null = null;
await page.route('**/api/leads', async (route) => {
  payload = route.request().postDataJSON();
  await route.fulfill({
    status: 201, contentType: 'application/json',
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
  appointment: {scheduledAt: '2026-09-20T02:30:00.000Z', durationMinutes: 30}
});
```

Lead-only payload in a second Playwright test:

```ts
await page.getByLabel('Tên').fill('Lead Only');
await page.getByLabel('Số điện thoại').fill('0901234568');
await page.getByRole('button', {name: 'Gửi yêu cầu đặt lịch'}).click();
expect(payload).not.toHaveProperty('appointment');
```

- [ ] **Step 2: Run tests to verify RED**

```bash
npm run test:run -- tests/unit/booking-request-form.test.tsx
npm run test:e2e -- tests/e2e/booking-request.spec.ts
```

Expected: fail because the page is still a placeholder.

- [ ] **Step 3: Implement real-only booking options**

If `NEXT_PUBLIC_SUPABASE_URL` is missing or contains `example.supabase.co`, return `{locations: [], unitTypes: []}`. Otherwise query only public-ready records:

```ts
const [locationsResult, unitTypesResult] = await Promise.all([
  supabase.from('locations')
    .select('id, name_vi, name_en')
    .eq('status', 'active').not('published_at', 'is', null).order('sort_order'),
  supabase.from('unit_types')
    .select('id, name_vi, name_en')
    .eq('active', true).not('published_at', 'is', null).order('sort_order')
]);
```

Map to `{id, label}` by locale. Do not call `features/catalog/public-catalog.ts`; its `verified-*` fallback IDs are not valid DB UUIDs.

- [ ] **Step 4: Implement `BookingRequestForm`**

Fields: full name, phone, optional email, need type, estimated volume, optional location, optional unit type, optional `datetime-local`, message, optional appointment note, honeypot, attribution.

Only include appointment when time exists:

```ts
const localViewingTime = String(form.get('preferredViewingAt') ?? '');
const appointment = localViewingTime ? {
  scheduledAt: hoChiMinhLocalToIso(localViewingTime),
  durationMinutes: 30,
  customerNote: String(form.get('appointmentNote') ?? '') || undefined
} : undefined;
const response = await fetch('/api/leads', {
  method: 'POST', headers: {'content-type': 'application/json'},
  body: JSON.stringify({...leadPayload, ...(appointment ? {appointment} : {})})
});
```

Handle 429 separately, generic safe error otherwise. Success copy says the request was received; never say booked/reserved/confirmed.

- [ ] **Step 5: Implement bilingual `/dat-kho` page**

Keep:

```ts
export const metadata: Metadata = {robots: {index: false, follow: true}};
```

Use `setRequestLocale(locale)`, `getBookingOptions(locale)`, and render the form. Vietnamese copy must contain exactly:

```text
Đây là yêu cầu lịch hẹn. NupsBox sẽ liên hệ xác nhận trước khi lịch có hiệu lực.
```

English copy states that the selected time is a request and NupsBox will confirm it.

- [ ] **Step 6: Run unit and browser tests**

```bash
npm run test:run -- tests/unit/booking-request-form.test.tsx \
  tests/unit/lead-request-schema.test.ts tests/unit/appointment-time.test.ts
npx playwright install chromium
npm run test:e2e -- tests/e2e/booking-request.spec.ts
```

Expected: pass.

- [ ] **Step 7: Commit Task 6**

```bash
git add features/catalog/booking-options.ts components/forms/booking-request-form.tsx \
  'app/[locale]/dat-kho/page.tsx' tests/unit/booking-request-form.test.tsx \
  tests/e2e/booking-request.spec.ts
git commit -m "feat: add public viewing request flow"
```

---

### Task 7: Add production verification documentation

**Files:**
- Modify: `docs/production-checklist.md`

**Interfaces:**
- Defines the production migration/smoke gate.
- Does not modify domain/canonical/DNS configuration.

- [ ] **Step 1: Add exact pre-production checklist**

```text
P2.3 production migration gate
[ ] CI quality succeeds on exact implementation PR head SHA
[ ] Database Tests succeeds on exact implementation PR head SHA
[ ] Vercel exact-head status succeeds
[ ] Preview smoke succeeds when deployable
[ ] PR is reviewed/approved
[ ] User explicitly approves production migration 20260915000400_phase2_light_booking_crm.sql
```

- [ ] **Step 2: Add exact public smoke checklist**

```text
Use utmCampaign=p23-production-smoke-YYYYMMDD.
[ ] Lead-only request returns HTTP 201 and creates zero linked appointments.
[ ] Future-time request returns HTTP 201 and creates exactly one linked appointment.
[ ] That appointment is status=pending and source=customer.
[ ] Anonymous/direct public access exposes no appointment/history rows.
[ ] Public UI/response never claims confirmed/reserved status.
[ ] Preserve audit/history; mark smoke leads as test data and set lead status=lost after verification instead of deleting them.
```

- [ ] **Step 3: Add exact authenticated smoke checklist**

```text
With valid test credentials only:
[ ] viewer reads CRM detail but cannot mutate.
[ ] staff creates a pending appointment.
[ ] confirmation fails until location + active assignee + future time are present.
[ ] valid pending -> confirmed succeeds.
[ ] reschedule creates appointment history.
[ ] stale updated_at update returns conflict instead of overwriting.
[ ] confirmed -> completed/no_show/cancelled follows legal transitions.
[ ] terminal appointment rejects later edit.
[ ] appointment history shows material changes.

If valid credentials are unavailable: record authenticated CRM smoke as NOT PERFORMED.
```

- [ ] **Step 4: Commit Task 7**

```bash
git add docs/production-checklist.md
git commit -m "docs: add P2.3 production verification checklist"
```

---

### Task 8: Full branch verification and implementation PR

**Files:**
- No new expected feature files; fix only failures introduced by P2.3.

**Interfaces:**
- Produces a reviewable implementation PR.
- Stops before production migration.

- [ ] **Step 1: Run full unit/application tests**

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

- [ ] **Step 3: Run CI-equivalent build**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co \
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ci_only \
NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
npm run build
```

Expected: exit 0.

- [ ] **Step 4: Run fresh database contracts**

```bash
supabase db reset
supabase test db
```

Expected: zero failed pgTAP assertions.

- [ ] **Step 5: Run booking browser test**

```bash
npx playwright install chromium
npm run test:e2e -- tests/e2e/booking-request.spec.ts
```

Expected: pass.

- [ ] **Step 6: Verify generated DB types have no drift**

```bash
npx supabase gen types typescript --local > /tmp/nupsbox-database.ts
diff -u types/database.ts /tmp/nupsbox-database.ts
```

Expected: no diff.

- [ ] **Step 7: Review scope diff**

```bash
git diff main...HEAD --stat
git diff main...HEAD --name-only
```

Expected: only P2.3 migration/tests/types/domain/admin/public-booking/checklist files plus approved P2.3 spec/plan docs; no DNS/domain/media/content-seeding change.

- [ ] **Step 8: Open implementation PR from a feature branch based on then-current `main`**

```text
PR title: feat: implement P2.3 light booking CRM
PR body:
- appointment schema + RLS + immutable audit + atomic public RPC
- admin lead-detail CRM + appointment lifecycle
- public /dat-kho viewing request form
- unit/pgTAP/browser verification
- explicitly no reservation/payment/domain cutover
```

If `main` advanced after this plan was written, create the implementation branch from current `main` and carry the approved spec/plan forward rather than building on an outdated docs-only base.

- [ ] **Step 9: Verify exact-head checks before any merge recommendation**

```text
CI quality: success
Database Tests: success
Vercel exact-head status: success
Preview smoke: success when deployable
```

Do not recommend merge while any applicable check is pending/failing.

- [ ] **Step 10: Stop at the production gate**

After any later approved merge, report the exact merge SHA and stop. Do not apply `20260915000400_phase2_light_booking_crm.sql` to production until the user explicitly approves that action. After production migration approval/application, run Task 7 smoke; authenticated smoke remains conditional on valid credentials.

