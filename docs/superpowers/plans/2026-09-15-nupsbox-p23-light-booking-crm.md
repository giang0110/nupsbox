# NupsBox P2.3 Light Booking CRM Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the existing NupsBox lead CRM with lightweight storage-viewing appointments, allowing public customers to request a preferred time and authenticated staff to manage the appointment lifecycle without implementing real-time reservation, stock locking, or payment.

**Architecture:** Keep the existing lead pipeline and add a dedicated `lead_appointments` subsystem plus immutable appointment history. Public submissions continue through `/api/leads`, but lead + optional appointment creation moves behind one server-only transactional Postgres RPC; admin mutations use the authenticated Supabase server client so RLS remains authoritative. The admin UI gains a lead-detail workspace while `/dat-kho` becomes a bilingual request form whose selected time is explicitly only a request.

**Tech Stack:** Next.js 16.3.3 App Router, React 19.3, TypeScript 5.9, Zod 4.6, Supabase/Postgres 17, pgTAP, Vitest 5, Playwright 1.63, GitHub Actions, Vercel.

**Spec:** `docs/superpowers/specs/2026-09-15-nupsbox-p23-light-booking-crm-design.md`

## Global Constraints

- Do not implement real-time unit reservation, stock locking/decrement, payment, deposits, invoicing, or checkout.
- A public viewing time is only a request; it creates `pending`, never `confirmed`.
- A lead may have multiple appointments and appointment history must be preserved.
- `location_id` and `unit_type_id` may be null while an appointment is pending.
- `confirmed` requires a valid location, an active admin/staff assignee, and a future scheduled time.
- Default duration is 30 minutes; accepted duration range is 15–180 minutes.
- Terminal statuses are `completed`, `cancelled`, and `no_show`; ordinary application edits are rejected after terminal state.
- Allowed status transitions are only `pending -> confirmed`, `pending -> cancelled`, `confirmed -> completed`, `confirmed -> cancelled`, and `confirmed -> no_show`.
- Appointment status must not automatically force a lead status; UI may suggest lead transitions only.
- Public/anonymous users must not read or directly mutate appointments/history.
- `admin` and `staff` may mutate appointments; `viewer` is read-only.
- No Supabase service-role credential may reach the browser.
- Public lead + optional appointment creation must be atomic.
- Persist timestamps as `timestamptz`; interpret operational date/time input as `Asia/Ho_Chi_Minh` (`+07:00`).
- Reuse existing lead rate limiting and permission concepts; do not create a generic CRM activity platform.
- Do not change DNS, `nupsbox.vn`, media upload, or content seeding in this phase.
- Production migration/deployment is a separate explicit approval gate after the implementation PR is green.

---

## File Map

### Database

- Create `supabase/migrations/20260915000400_phase2_light_booking_crm.sql` — enums, appointment tables, invariants, audit triggers, RLS, safe assignee lookup extension, and atomic public submission RPC.
- Modify `supabase/tests/schema_contract.sql` — schema/enums/triggers/indexes/function contracts.
- Modify `supabase/tests/rls_contract.sql` — anonymous/viewer/staff/admin appointment access contracts.
- Modify `supabase/tests/crm_behavior.sql` — transition, assignee, terminal immutability, audit, and atomic-RPC behavior.
- Modify `types/database.ts` — regenerate from local Supabase after migration.

### Appointment domain

- Create `features/appointments/domain.ts` — appointment constants, types, transition predicate.
- Create `features/appointments/schema.ts` — public/admin appointment validation schemas.
- Create `features/appointments/time.ts` — deterministic `Asia/Ho_Chi_Minh` local-date conversion.
- Create `tests/unit/appointment-domain.test.ts`.
- Create `tests/unit/appointment-schema.test.ts`.
- Create `tests/unit/appointment-time.test.ts`.

### Public lead submission

- Create `features/leads/request-schema.ts` — backward-compatible lead request schema with optional appointment request.
- Modify `features/leads/create-lead.ts` — validate request, enforce existing rate limit, invoke atomic repository operation.
- Modify `features/leads/repository.ts` — call `submit_public_lead_request` RPC instead of directly inserting `leads`.
- Modify `app/api/leads/route.ts` — keep current HTTP error contract and return optional `appointmentId`.
- Create `tests/unit/lead-request-schema.test.ts`.

### Admin CRM read model

- Modify `features/admin/leads.ts` — include assignment and next-appointment summary in list rows.
- Create `features/admin/lead-detail.ts` — load lead, appointments, notes, status history, appointment history, and safe lookup data.
- Create `features/admin/lead-timeline.ts` — pure chronological timeline composition.
- Create `tests/unit/admin-lead-detail.test.ts`.
- Create `tests/unit/lead-timeline.test.ts`.

### Admin CRM mutations and UI

- Create `features/admin/appointments.ts` — role checks, appointment form parsing, patch construction, optimistic-concurrency errors.
- Modify `app/admin/leads/actions.ts` — retain lead-status update and add assignment/note helpers shared by list/detail.
- Create `app/admin/leads/[id]/actions.ts` — create/update appointment actions scoped to lead detail.
- Create `app/admin/leads/[id]/page.tsx` — main CRM workspace.
- Modify `app/admin/leads/page.tsx` — link to detail, show assignee/next appointment/overdue state.
- Create `components/admin/appointment-form.tsx` — create/reschedule/assignment fields.
- Create `components/admin/appointment-actions.tsx` — confirm/complete/no-show/cancel controls.
- Create `components/admin/appointment-list.tsx` — active + historical appointment rendering.
- Create `components/admin/lead-note-form.tsx` — internal lead note form.
- Create `components/admin/lead-assignee-form.tsx` — lead assignment form.
- Create `components/admin/lead-timeline.tsx` — timeline presentation.
- Create `tests/unit/admin-appointments.test.ts`.
- Create `tests/unit/admin-lead-mutations.test.ts`.

### Public booking page

- Create `features/catalog/booking-options.ts` — only real published DB location/unit choices; never marketing fallback IDs.
- Create `components/forms/booking-request-form.tsx` — bilingual form with optional preferred viewing time.
- Modify `app/[locale]/dat-kho/page.tsx` — render booking request page and noindex metadata.
- Create `tests/unit/booking-request-form.test.tsx`.
- Create `tests/e2e/booking-request.spec.ts` — browser payload/success/error behavior using request interception.

### Delivery verification

- Modify `docs/production-checklist.md` — add P2.3 manual production smoke steps and explicit authenticated-smoke credential requirement.
- Do not alter domain/canonical CI expectations in this phase.

---

### Task 1: Add appointment schema, audit, RLS, and atomic public submission

**Files:**
- Create: `supabase/migrations/20260915000400_phase2_light_booking_crm.sql`
- Modify: `supabase/tests/schema_contract.sql`
- Modify: `supabase/tests/rls_contract.sql`
- Modify: `supabase/tests/crm_behavior.sql`

**Interfaces:**
- Produces DB enums: `public.appointment_status`, `public.appointment_source`.
- Produces tables: `public.lead_appointments`, `public.lead_appointment_history`.
- Produces RPC: `public.submit_public_lead_request(p_lead jsonb, p_appointment jsonb default null) returns jsonb`.
- Produces invariant: only the approved appointment transitions are accepted at the database boundary.
- Produces audit behavior: immutable history rows capture creation and each material field/status change.
- Consumed later by `types/database.ts`, `features/leads/repository.ts`, and all admin appointment actions.

- [ ] **Step 1: Add failing pgTAP schema contracts**

Extend `supabase/tests/schema_contract.sql` with assertions equivalent to:

```sql
select has_type('public', 'appointment_status', 'appointment_status enum exists');
select has_type('public', 'appointment_source', 'appointment_source enum exists');
select has_table('public', 'lead_appointments', 'lead appointments exists');
select has_table('public', 'lead_appointment_history', 'lead appointment history exists');
select has_function(
  'public',
  'submit_public_lead_request',
  array['jsonb', 'jsonb'],
  'atomic public lead request RPC exists'
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
```

Increase the pgTAP plan count by exactly the number of new assertions.

- [ ] **Step 2: Add failing RLS contracts**

Extend `supabase/tests/rls_contract.sql` to prove:

```sql
select policies_are(
  'public',
  'lead_appointments',
  array[
    'lead_appointments_authenticated_read',
    'lead_appointments_staff_insert',
    'lead_appointments_staff_update'
  ],
  'appointment policies are explicit and deletion has no policy'
);

select policies_are(
  'public',
  'lead_appointment_history',
  array['lead_appointment_history_authenticated_read'],
  'history is read-only through normal RLS paths'
);
```

Use the same JWT/profile fixtures already used by this file to assert:

```sql
-- anonymous SELECT returns zero/permission denied according to existing test helpers
-- viewer SELECT succeeds but INSERT/UPDATE fails
-- staff SELECT/INSERT/UPDATE succeeds
-- admin SELECT/INSERT/UPDATE succeeds
-- no role has ordinary DELETE access
```

Also extend the safe `profiles_operational_read` contract so `viewer` can read active admin/staff rows needed to render assignee names, while writes remain unchanged.

- [ ] **Step 3: Add failing CRM behavior contracts**

Extend `supabase/tests/crm_behavior.sql` with transactions proving:

```sql
-- duration rejects 14 and 181, accepts 30
-- pending may exist without location/unit/assignee
-- pending -> confirmed fails without location
-- pending -> confirmed fails without active admin/staff assignee
-- pending -> confirmed fails when scheduled_at is not future
-- pending -> confirmed succeeds when all requirements are met
-- confirmed -> completed succeeds
-- confirmed -> no_show succeeds
-- pending -> completed fails
-- completed -> any ordinary update fails
-- changing scheduled_at on an active appointment writes a history row
-- changing assigned_to writes a history row
-- changing status writes a history row
```

Add an atomic RPC test that calls:

```sql
select public.submit_public_lead_request(
  jsonb_build_object(
    'fullName', 'P2.3 pgTAP Customer',
    'phone', '+84900000001',
    'preferredLanguage', 'vi',
    'needType', 'other',
    'estimatedVolume', 'unknown',
    'source', 'pgtap'
  ),
  jsonb_build_object(
    'scheduledAt', (now() + interval '2 days')::text,
    'durationMinutes', 30,
    'customerNote', 'Database contract test'
  )
);
```

Then assert exactly one lead and one linked `pending/customer` appointment exist inside the test transaction. Also call the RPC with an invalid appointment and assert no lead remains after the failing statement/savepoint.

- [ ] **Step 4: Run database tests and verify RED**

Run:

```bash
supabase db start
supabase test db
```

Expected: FAIL because the new enums/tables/function/policies/triggers do not exist yet.

- [ ] **Step 5: Implement migration enums and tables**

Create `supabase/migrations/20260915000400_phase2_light_booking_crm.sql` starting with:

```sql
create type public.appointment_status as enum (
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'no_show'
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
  appointment_id uuid not null references public.lead_appointments(id) on delete cascade,
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

- [ ] **Step 6: Implement database validation trigger**

Add `public.validate_lead_appointment_change()` as a `security definer` trigger function with `set search_path = public`. It must enforce this logic exactly:

```plpgsql
if new.assigned_to is not null and not exists (
  select 1 from public.profiles p
  where p.id = new.assigned_to
    and p.active = true
    and p.role in ('admin', 'staff')
) then
  raise exception 'appointment assignee must be an active admin or staff member'
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
```

Attach it as:

```sql
create trigger lead_appointments_validate_change
before insert or update on public.lead_appointments
for each row execute function public.validate_lead_appointment_change();
```

Revoke direct execute from `public`, `anon`, and `authenticated` because it is trigger-only.

- [ ] **Step 7: Implement immutable appointment history trigger**

Create `public.audit_lead_appointment()` and attach it `after insert or update`. On insert, write `event_type = 'created'`. On update, insert one history row for each material change using these exact event names:

```text
status_changed
rescheduled
location_changed
unit_type_changed
assignment_changed
customer_note_changed
internal_note_changed
```

Use complete snapshots so each row contains:

```sql
jsonb_build_object(
  'id', new.id,
  'lead_id', new.lead_id,
  'location_id', new.location_id,
  'unit_type_id', new.unit_type_id,
  'assigned_to', new.assigned_to,
  'scheduled_at', new.scheduled_at,
  'duration_minutes', new.duration_minutes,
  'status', new.status,
  'source', new.source,
  'customer_note', new.customer_note,
  'internal_note', new.internal_note,
  'updated_at', new.updated_at
)
```

Use `auth.uid()` for `changed_by`; public requests may legitimately record null because they are server-originated anonymous customer requests.

- [ ] **Step 8: Implement RLS**

Enable RLS on both new tables and add:

```sql
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
```

Do not create DELETE policies and do not create normal INSERT/UPDATE policies for history.

Replace `profiles_operational_read` with the same active admin/staff row filter but permit `viewer` to select those rows:

```sql
using (
  public.current_app_role() in ('admin', 'staff', 'viewer')
  and active = true
  and role in ('admin', 'staff')
)
```

- [ ] **Step 9: Implement the server-only atomic RPC**

Create:

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
      nullif(p_lead->>'locationId', '')::uuid,
      nullif(p_lead->>'unitTypeId', '')::uuid,
      (p_appointment->>'scheduledAt')::timestamptz,
      coalesce((p_appointment->>'durationMinutes')::integer, 30),
      'pending'::public.appointment_status,
      'customer'::public.appointment_source,
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

Do not accept status, assignee, internal note, `created_by`, or audit metadata from the public payload.

- [ ] **Step 10: Recreate local DB and verify GREEN**

Run:

```bash
supabase db reset
supabase test db
```

Expected: PASS for `schema_contract.sql`, `rls_contract.sql`, and `crm_behavior.sql` with zero failed pgTAP assertions.

- [ ] **Step 11: Commit Task 1**

```bash
git add supabase/migrations/20260915000400_phase2_light_booking_crm.sql \
  supabase/tests/schema_contract.sql \
  supabase/tests/rls_contract.sql \
  supabase/tests/crm_behavior.sql
git commit -m "feat: add light booking appointment schema"
```

---

### Task 2: Sync database types and implement appointment domain validation

**Files:**
- Modify: `types/database.ts`
- Create: `features/appointments/domain.ts`
- Create: `features/appointments/schema.ts`
- Create: `features/appointments/time.ts`
- Create: `tests/unit/appointment-domain.test.ts`
- Create: `tests/unit/appointment-schema.test.ts`
- Create: `tests/unit/appointment-time.test.ts`

**Interfaces:**
- Produces `AppointmentStatus`, `AppointmentSource` aliases from generated DB types.
- Produces `canTransitionAppointment(from, to): boolean`.
- Produces `AppointmentCreateInputSchema`, `AppointmentUpdateInputSchema`, `PublicAppointmentRequestSchema`.
- Produces `hoChiMinhLocalToIso(value: string): string`.
- Consumed by admin actions and public booking form.

- [ ] **Step 1: Write failing state-machine tests**

Create `tests/unit/appointment-domain.test.ts`:

```ts
import {describe, expect, it} from 'vitest';
import {canTransitionAppointment, terminalAppointmentStatuses} from '@/features/appointments/domain';

describe('appointment transitions', () => {
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

  it('defines the three terminal statuses', () => {
    expect(terminalAppointmentStatuses).toEqual(['completed', 'cancelled', 'no_show']);
  });
});
```

- [ ] **Step 2: Write failing schema/time tests**

Create `tests/unit/appointment-schema.test.ts` with cases for 30-minute default, 15/180 bounds, invalid UUIDs, and public rejection of privileged fields using `.strict()` on the public appointment object.

Create `tests/unit/appointment-time.test.ts`:

```ts
import {describe, expect, it} from 'vitest';
import {hoChiMinhLocalToIso} from '@/features/appointments/time';

describe('hoChiMinhLocalToIso', () => {
  it('interprets datetime-local in UTC+7', () => {
    expect(hoChiMinhLocalToIso('2026-09-20T09:30')).toBe('2026-09-20T02:30:00.000Z');
  });

  it('rejects malformed local datetime strings', () => {
    expect(() => hoChiMinhLocalToIso('20/09/2026 09:30')).toThrow('invalid_local_datetime');
  });
});
```

- [ ] **Step 3: Run targeted tests and verify RED**

```bash
npm run test:run -- tests/unit/appointment-domain.test.ts tests/unit/appointment-schema.test.ts tests/unit/appointment-time.test.ts
```

Expected: FAIL because the appointment domain files do not exist.

- [ ] **Step 4: Regenerate Supabase database types**

With local Supabase running on the new migration:

```bash
npx supabase gen types typescript --local > types/database.ts
npm run typecheck
```

Confirm generated types contain `lead_appointments`, `lead_appointment_history`, `appointment_status`, `appointment_source`, and `submit_public_lead_request`.

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

- [ ] **Step 6: Implement appointment schemas**

Create `features/appointments/schema.ts` with reusable preprocessing for empty optional UUID/text fields and these exported schemas:

```ts
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
});

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
});
```

- [ ] **Step 7: Implement deterministic HCMC time parsing**

Create `features/appointments/time.ts`:

```ts
const localDateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export function hoChiMinhLocalToIso(value: string): string {
  if (!localDateTimePattern.test(value)) throw new Error('invalid_local_datetime');
  const parsed = new Date(`${value}:00+07:00`);
  if (Number.isNaN(parsed.getTime())) throw new Error('invalid_local_datetime');
  return parsed.toISOString();
}
```

- [ ] **Step 8: Run targeted tests and verify GREEN**

```bash
npm run test:run -- tests/unit/appointment-domain.test.ts tests/unit/appointment-schema.test.ts tests/unit/appointment-time.test.ts
npm run typecheck
```

Expected: all targeted tests PASS and typecheck exits 0.

- [ ] **Step 9: Commit Task 2**

```bash
git add types/database.ts features/appointments tests/unit/appointment-*.test.ts
git commit -m "feat: add appointment domain validation"
```

---

### Task 3: Make public lead submission optionally create an appointment atomically

**Files:**
- Create: `features/leads/request-schema.ts`
- Modify: `features/leads/create-lead.ts`
- Modify: `features/leads/repository.ts`
- Modify: `app/api/leads/route.ts`
- Create: `tests/unit/lead-request-schema.test.ts`
- Modify: `tests/unit/lead-schema.test.ts` only if existing assumptions need to assert backward compatibility.

**Interfaces:**
- Produces `PublicLeadRequestSchema` and `PublicLeadRequest`.
- `createLead(input, context)` remains the route-level service name for backward compatibility.
- `insertLeadRequest(input)` returns `{leadId: string; appointmentId: string | null}`.
- Existing contact forms that omit `appointment` continue to create lead-only requests.

- [ ] **Step 1: Write failing request-schema tests**

Create `tests/unit/lead-request-schema.test.ts`:

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
  it('accepts the existing lead-only payload', () => {
    expect(PublicLeadRequestSchema.parse(base).appointment).toBeUndefined();
  });

  it('accepts a pending appointment request payload', () => {
    const parsed = PublicLeadRequestSchema.parse({
      ...base,
      appointment: {
        scheduledAt: '2026-09-20T02:30:00.000Z',
        durationMinutes: 30,
        customerNote: 'Morning preferred'
      }
    });
    expect(parsed.appointment?.durationMinutes).toBe(30);
  });

  it('rejects privileged appointment fields', () => {
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

- [ ] **Step 2: Run request-schema test and verify RED**

```bash
npm run test:run -- tests/unit/lead-request-schema.test.ts
```

Expected: FAIL because `request-schema.ts` does not exist.

- [ ] **Step 3: Implement `PublicLeadRequestSchema`**

```ts
import {LeadInputSchema} from './schema';
import {PublicAppointmentRequestSchema} from '@/features/appointments/schema';

export const PublicLeadRequestSchema = LeadInputSchema.extend({
  appointment: PublicAppointmentRequestSchema.optional()
}).strict();

export type PublicLeadRequest = z.infer<typeof PublicLeadRequestSchema>;
```

Keep the existing honeypot `website` field and attribution fields inherited from `LeadInputSchema`.

- [ ] **Step 4: Replace direct insert with atomic RPC repository call**

Change `features/leads/repository.ts` to export:

```ts
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

- [ ] **Step 5: Update `createLead()` without changing rate-limit behavior**

Implement:

```ts
export async function createLead(input: unknown, requestContext: LeadRequestContext) {
  const parsed = PublicLeadRequestSchema.parse(input);
  await enforceLeadRateLimit(requestContext.clientKey);
  const result = await insertLeadRequest(parsed);
  return {ok: true as const, ...result};
}
```

The rate limit must run before the database RPC.

- [ ] **Step 6: Keep the API HTTP contract stable**

`app/api/leads/route.ts` should continue returning:

```ts
201 // validated lead-only or lead+appointment request
400 // invalid_json or invalid_lead
429 // rate_limited
500 // submit_failed
```

Do not expose raw database errors or appointment internal fields.

- [ ] **Step 7: Run unit and type checks**

```bash
npm run test:run -- tests/unit/lead-schema.test.ts tests/unit/lead-request-schema.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 8: Commit Task 3**

```bash
git add features/leads app/api/leads/route.ts tests/unit/lead-request-schema.test.ts tests/unit/lead-schema.test.ts
git commit -m "feat: add atomic public appointment requests"
```

---

### Task 4: Add admin lead-detail read model and timeline composition

**Files:**
- Modify: `features/admin/leads.ts`
- Create: `features/admin/lead-detail.ts`
- Create: `features/admin/lead-timeline.ts`
- Create: `tests/unit/admin-lead-detail.test.ts`
- Create: `tests/unit/lead-timeline.test.ts`

**Interfaces:**
- `listAdminLeads()` adds `assignedTo`, `assignedName`, `nextAppointment`.
- `getAdminLeadDetail(leadId, role)` returns a single typed CRM workspace model.
- `buildLeadTimeline(input)` returns newest-first presentation events without creating a generic DB activity table.

- [ ] **Step 1: Write failing pure timeline test**

Create `tests/unit/lead-timeline.test.ts` using fixed timestamps and assert the output order interleaves note, lead-status, and appointment-history events correctly:

```ts
const result = buildLeadTimeline({
  notes: [{id: 'n1', note: 'Called customer', authorName: 'Staff A', createdAt: '2026-09-15T02:00:00Z'}],
  statusHistory: [{id: 's1', fromStatus: 'new', toStatus: 'contacted', changedByName: 'Staff A', createdAt: '2026-09-15T03:00:00Z'}],
  appointmentHistory: [{id: 'a1', eventType: 'created', changedByName: null, createdAt: '2026-09-15T04:00:00Z'}]
});
expect(result.map((item) => item.id)).toEqual(['a1', 's1', 'n1']);
```

- [ ] **Step 2: Write failing read-model mapping tests**

Create `tests/unit/admin-lead-detail.test.ts` around exported pure mapping helpers rather than mocking Supabase internals. Assert:

```text
- next appointment ignores terminal appointments
- next appointment is the earliest pending/confirmed future appointment
- overdue confirmed appointment is flagged when scheduled_at < now
- missing assignee profile maps to null name, never crashes
- viewer model remains read-only via `canMutateAppointments = false`
```

- [ ] **Step 3: Run tests and verify RED**

```bash
npm run test:run -- tests/unit/admin-lead-detail.test.ts tests/unit/lead-timeline.test.ts
```

Expected: FAIL because the read-model modules do not exist.

- [ ] **Step 4: Implement lead-list enrichment**

Extend `AdminLeadRow` in `features/admin/leads.ts`:

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

Query leads with their active appointments and active assignee profile, then compute the next appointment in a pure helper. Keep the existing 100-row maximum and existing status filtering.

- [ ] **Step 5: Implement `getAdminLeadDetail()`**

`features/admin/lead-detail.ts` should validate the UUID, then load with the authenticated server client:

```text
lead
lead_notes ordered created_at desc
lead_status_history ordered created_at desc
lead_appointments ordered scheduled_at desc
lead_appointment_history for those appointment ids ordered created_at desc
active admin/staff profiles for labels and assignment options
published/active locations and unit types for appointment controls
```

Return `null` for a missing lead rather than throwing a not-found database error. Derive `canMutateAppointments` from `can(role, 'leads:update')`, `canAssignLead` from `leads:assign`, and `canAddNote` from `leads:note`.

- [ ] **Step 6: Implement pure timeline composition**

`features/admin/lead-timeline.ts` must normalize to:

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

Sort by descending `createdAt`. Do not persist this timeline.

- [ ] **Step 7: Run tests and typecheck**

```bash
npm run test:run -- tests/unit/admin-leads.test.ts tests/unit/admin-lead-detail.test.ts tests/unit/lead-timeline.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 8: Commit Task 4**

```bash
git add features/admin/leads.ts features/admin/lead-detail.ts features/admin/lead-timeline.ts \
  tests/unit/admin-lead-detail.test.ts tests/unit/lead-timeline.test.ts tests/unit/admin-leads.test.ts
git commit -m "feat: add CRM lead detail read model"
```

---

### Task 5: Add admin appointment mutations and lead-detail CRM UI

**Files:**
- Create: `features/admin/appointments.ts`
- Modify: `app/admin/leads/actions.ts`
- Create: `app/admin/leads/[id]/actions.ts`
- Create: `app/admin/leads/[id]/page.tsx`
- Modify: `app/admin/leads/page.tsx`
- Create: `components/admin/appointment-form.tsx`
- Create: `components/admin/appointment-actions.tsx`
- Create: `components/admin/appointment-list.tsx`
- Create: `components/admin/lead-note-form.tsx`
- Create: `components/admin/lead-assignee-form.tsx`
- Create: `components/admin/lead-timeline.tsx`
- Create: `tests/unit/admin-appointments.test.ts`
- Create: `tests/unit/admin-lead-mutations.test.ts`

**Interfaces:**
- Produces `AppointmentConflictError` for optimistic-concurrency failures.
- Produces `prepareAppointmentCreate(role, input, now)` and `prepareAppointmentUpdate(role, currentStatus, input, now)`.
- Server actions revalidate both `/admin/leads` and `/admin/leads/[id]`.
- Viewer renders all data but no mutation forms/buttons.

- [ ] **Step 1: Write failing permission/state tests**

Create `tests/unit/admin-appointments.test.ts` with fixed `now = new Date('2026-09-15T03:00:00Z')` and assert:

```text
viewer create -> throws forbidden
staff/admin create -> accepted
confirmed creation without location -> rejected
confirmed creation without assignee -> rejected
pending future appointment without location -> accepted
pending -> confirmed with location/assignee/future time -> accepted
pending -> completed -> rejected
completed update -> rejected
scheduledAt <= now for pending/confirmed -> rejected
```

Create `tests/unit/admin-lead-mutations.test.ts` proving `viewer` cannot assign or note, while staff/admin can according to current permissions.

- [ ] **Step 2: Run targeted tests and verify RED**

```bash
npm run test:run -- tests/unit/admin-appointments.test.ts tests/unit/admin-lead-mutations.test.ts
```

Expected: FAIL because mutation preparation functions do not exist.

- [ ] **Step 3: Implement mutation preparation**

In `features/admin/appointments.ts`:

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

For updates, reject terminal current status, use `canTransitionAppointment()` when status changes, and require `locationId`, `assignedTo`, and future `scheduledAt` when the resulting status is `confirmed`.

- [ ] **Step 4: Add lead assignment and note actions**

Keep `updateLeadStatus()` in `app/admin/leads/actions.ts`. Add helpers/server actions that enforce:

```ts
can(session.role, 'leads:assign')
can(session.role, 'leads:note')
```

Assignment must validate target profile is active admin/staff; DB trigger remains final enforcement. Notes insert `author_id = session.user.id` and `lead_id` from validated UUID input.

- [ ] **Step 5: Implement appointment server actions with optimistic concurrency**

In `app/admin/leads/[id]/actions.ts`, create appointment using the authenticated Supabase server client and `source = 'staff'`, `created_by = session.user.id`.

For updates use:

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

Never update history directly; DB triggers own history creation.

- [ ] **Step 6: Implement lead-detail page authorization and layout**

`app/admin/leads/[id]/page.tsx` must:

```ts
const session = await requireAdminUser();
if (!can(session.role, 'leads:read')) redirect('/admin');
const detail = await getAdminLeadDetail(id, session.role);
if (!detail) notFound();
```

Render these sections in order:

```text
Header + back link
Customer/contact + need summary
Lead status and assignee controls
Next appointment summary
Create appointment form (admin/staff only)
Appointment list/history
Lead note form + notes
Unified chronological timeline
```

- [ ] **Step 7: Implement appointment form/action components**

`components/admin/appointment-form.tsx` must expose:

```text
datetime-local
30-minute default duration
optional location
optional unit type
optional assignee defaulted from lead assignee
customer note
internal note
```

Convert the `datetime-local` value with `hoChiMinhLocalToIso()` before sending it to the server action.

`components/admin/appointment-actions.tsx` must render only legal next actions for the current status:

```text
pending: Confirm, Cancel
confirmed: Complete, No-show, Cancel
terminal: no mutation buttons
```

Reschedule/edit controls are available only while pending/confirmed.

- [ ] **Step 8: Add viewer read-only behavior**

When `detail.canMutateAppointments` is false:

```text
hide create/edit/status appointment controls
hide lead assignment control
hide lead note form
retain lead status label, appointment details, notes, histories, and timeline
```

Do not rely on hidden buttons as security; server action checks + RLS remain required.

- [ ] **Step 9: Enrich `/admin/leads`**

Add a detail link per lead and columns/summary text for assignee and next appointment. Mark `confirmed` appointments whose scheduled time is in the past as overdue. Do not turn the page into a calendar/dashboard.

- [ ] **Step 10: Run targeted tests, lint, and typecheck**

```bash
npm run test:run -- tests/unit/admin-leads.test.ts tests/unit/admin-appointments.test.ts tests/unit/admin-lead-mutations.test.ts tests/unit/lead-timeline.test.ts
npm run lint
npm run typecheck
```

Expected: all commands exit 0.

- [ ] **Step 11: Commit Task 5**

```bash
git add features/admin/appointments.ts app/admin/leads components/admin tests/unit/admin-appointments.test.ts tests/unit/admin-lead-mutations.test.ts
git commit -m "feat: add appointment management to CRM"
```

---

### Task 6: Turn `/dat-kho` into the public lightweight booking request form

**Files:**
- Create: `features/catalog/booking-options.ts`
- Create: `components/forms/booking-request-form.tsx`
- Modify: `app/[locale]/dat-kho/page.tsx`
- Create: `tests/unit/booking-request-form.test.tsx`
- Create: `tests/e2e/booking-request.spec.ts`

**Interfaces:**
- `getBookingOptions(locale)` returns only real DB-backed published IDs; no `verified-*` marketing fallback identifiers.
- `BookingRequestForm` posts the existing lead fields plus optional `appointment` to `/api/leads`.
- Success copy distinguishes lead-only submission from an appointment request only if useful, but neither may imply a confirmed reservation.

- [ ] **Step 1: Write failing component contract test**

Create `tests/unit/booking-request-form.test.tsx` and render with empty options. Assert Vietnamese copy includes:

```text
Gửi yêu cầu đặt lịch
Đây là yêu cầu lịch hẹn. NupsBox sẽ liên hệ xác nhận trước khi lịch có hiệu lực.
```

Assert the form still renders when there are zero locations/unit types, because production content may legitimately be empty.

- [ ] **Step 2: Write failing Playwright payload test**

Create `tests/e2e/booking-request.spec.ts`:

```ts
import {expect, test} from '@playwright/test';

test('submits an optional appointment request without claiming confirmation', async ({page}) => {
  let payload: Record<string, unknown> | null = null;
  await page.route('**/api/leads', async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ok: true, leadId: '11111111-1111-4111-8111-111111111111', appointmentId: '22222222-2222-4222-8222-222222222222'})
    });
  });

  await page.goto('/dat-kho');
  await page.getByLabel('Tên').fill('Khach Test');
  await page.getByLabel('Số điện thoại').fill('0901234567');
  await page.getByLabel(/Ngày.*giờ|Thời gian/i).fill('2026-09-20T09:30');
  await page.getByRole('button', {name: 'Gửi yêu cầu đặt lịch'}).click();

  await expect(page.getByRole('status')).toContainText(/đã nhận/i);
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

Use stable label text in the final component so the selector is deterministic; adjust the regex only if the final approved copy requires it.

- [ ] **Step 3: Run tests and verify RED**

```bash
npm run test:run -- tests/unit/booking-request-form.test.tsx
npm run test:e2e -- tests/e2e/booking-request.spec.ts
```

Expected: FAIL because the form does not exist and `/dat-kho` is still a placeholder.

- [ ] **Step 4: Implement real-only booking option loader**

`features/catalog/booking-options.ts` must use the server Supabase client and return empty arrays when Supabase is unconfigured/example CI config. Query only records that are actually publishable:

```text
locations: status = active AND published_at IS NOT NULL
unit_types: active = true AND published_at IS NOT NULL
```

Return only:

```ts
type BookingOption = {id: string; label: string};
```

Do not use the marketing fallback catalog because those fallback IDs are not UUIDs and must never be submitted as foreign keys.

- [ ] **Step 5: Implement `BookingRequestForm`**

The form must include:

```text
full name (required)
phone (required)
email (optional)
need type (required/defaulted)
estimated volume (required/defaulted)
location (optional; include “Chưa xác định / Let NupsBox advise”)
unit type (optional; include “Chưa xác định / Let NupsBox advise”)
preferred datetime-local (optional)
message/customer note (optional)
honeypot website field
UTM/landing/referrer attribution
```

Build payload so appointment is omitted completely when no preferred datetime is chosen:

```ts
const localViewingTime = String(form.get('preferredViewingAt') ?? '');
const appointment = localViewingTime ? {
  scheduledAt: hoChiMinhLocalToIso(localViewingTime),
  durationMinutes: 30,
  customerNote: String(form.get('appointmentNote') ?? '') || undefined
} : undefined;
```

POST to `/api/leads` using the existing 429/error handling style from `LeadForm`.

- [ ] **Step 6: Implement bilingual `/dat-kho` page**

Keep:

```ts
export const metadata: Metadata = {robots: {index: false, follow: true}};
```

Use `setRequestLocale(locale)`, load `getBookingOptions(locale)`, render the form, and explicitly state the request-not-confirmation message in both Vietnamese and English.

- [ ] **Step 7: Run unit + browser tests**

```bash
npm run test:run -- tests/unit/booking-request-form.test.tsx tests/unit/lead-request-schema.test.ts tests/unit/appointment-time.test.ts
npx playwright install chromium
npm run test:e2e -- tests/e2e/booking-request.spec.ts
```

Expected: PASS.

- [ ] **Step 8: Commit Task 6**

```bash
git add features/catalog/booking-options.ts components/forms/booking-request-form.tsx \
  'app/[locale]/dat-kho/page.tsx' tests/unit/booking-request-form.test.tsx tests/e2e/booking-request.spec.ts
git commit -m "feat: add public viewing request flow"
```

---

### Task 7: Add P2.3 production verification checklist without changing domain cutover

**Files:**
- Modify: `docs/production-checklist.md`

**Interfaces:**
- Produces a manual post-deploy verification procedure.
- Does not change `PRODUCTION_URL`, canonical origin, DNS, or `nupsbox.vn`.

- [ ] **Step 1: Add the P2.3 pre-production gate**

Document that production migration `20260915000400_phase2_light_booking_crm.sql` must not be applied until:

```text
CI quality is green on exact PR head
Database Tests is green on exact PR head
Vercel preview status is success on exact PR head
PR code review is approved
user explicitly approves production migration
```

- [ ] **Step 2: Add manual public smoke procedure**

Use a uniquely identifiable test lead such as source/UTM campaign `p23-production-smoke-YYYYMMDD`. Verify:

```text
lead-only request returns success and creates no appointment
request with preferred time creates exactly one pending/customer appointment
public cannot query appointment/history tables directly
response never says confirmed/reserved
```

Do not delete audit/history. If the production test lead must remain, mark it clearly as test data and set its lead status to `lost` after verification.

- [ ] **Step 3: Add authenticated CRM smoke procedure**

With valid test credentials only, verify:

```text
viewer can read but cannot mutate
staff can create pending appointment
staff can confirm only after location + assignee + future time are set
staff can reschedule confirmed appointment
stale updated_at causes conflict instead of overwrite
staff can complete/no-show/cancel only through legal transitions
history shows each material change
terminal appointment rejects further edits
```

State explicitly: if authenticated test credentials are unavailable, this smoke remains **not performed** and must not be claimed complete.

- [ ] **Step 4: Commit Task 7**

```bash
git add docs/production-checklist.md
git commit -m "docs: add P2.3 production verification checklist"
```

---

### Task 8: Run full branch verification and prepare the implementation PR

**Files:**
- No new feature files expected.
- Fix only failures caused by P2.3; do not perform unrelated refactors.

**Interfaces:**
- Produces a reviewable feature branch and PR.
- Stops before production migration/deployment.

- [ ] **Step 1: Run the full unit/application suite**

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

- [ ] **Step 3: Run production build**

Using the same CI-safe environment values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co \
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ci_only \
NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
npm run build
```

Expected: build exits 0.

- [ ] **Step 4: Re-run database contracts from a fresh local database**

```bash
supabase db reset
supabase test db
```

Expected: all pgTAP files PASS.

- [ ] **Step 5: Run the booking browser test**

```bash
npx playwright install chromium
npm run test:e2e -- tests/e2e/booking-request.spec.ts
```

Expected: PASS.

- [ ] **Step 6: Verify migration/type drift**

Regenerate to a temporary file and compare:

```bash
npx supabase gen types typescript --local > /tmp/nupsbox-database.ts
diff -u types/database.ts /tmp/nupsbox-database.ts
```

Expected: no diff.

- [ ] **Step 7: Review the final diff for scope**

```bash
git diff main...HEAD --stat
git diff main...HEAD --name-only
```

Expected: only P2.3 migration/tests/types/domain/admin/public-booking/checklist files plus the already-approved P2.3 spec/plan docs. No DNS/domain/media/content-seeding changes.

- [ ] **Step 8: Push branch and open PR**

Use a feature branch for implementation, preferably created from the then-current `main`, not the docs-only branch if `main` has advanced. Suggested PR title:

```text
feat: implement P2.3 light booking CRM
```

PR body must summarize:

```text
DB appointment model + RLS/audit/atomic public RPC
admin lead-detail CRM + appointment lifecycle
public /dat-kho request form
unit/pgTAP/browser verification
explicitly no reservation/payment/domain cutover
```

- [ ] **Step 9: Verify exact-head CI before any merge recommendation**

Confirm on the PR head SHA:

```text
CI quality: success
Database Tests: success
Vercel exact-head status: success
Preview smoke: success when deployable
```

Do not recommend merge until all applicable checks are green.

- [ ] **Step 10: Stop at the production gate**

After merge, do **not** apply the production migration automatically. Report the exact merge SHA and ask for explicit approval to apply migration `20260915000400_phase2_light_booking_crm.sql` to Supabase production. After migration approval/application, run the manual production smoke from Task 7; authenticated CRM smoke remains conditional on valid credentials.
