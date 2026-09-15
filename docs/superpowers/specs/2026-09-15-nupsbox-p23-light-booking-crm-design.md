# NupsBox P2.3 — Light Booking CRM Design

Date: 2026-09-15  
Status: Proposed for implementation after user review  
Repository: `giang0110/nupsbox`

## 1. Purpose

P2.3 extends the existing lead CRM into a lightweight appointment workflow for storage viewings. It deliberately does **not** implement real-time inventory reservation, stock locking, online payment, or guaranteed booking.

The goal is to let a customer request a preferred viewing time from `/dat-kho`, while staff can confirm, reschedule, assign, complete, cancel, or mark that appointment as a no-show inside the admin CRM.

This phase builds on the existing `leads`, `lead_notes`, `lead_status_history`, `locations`, `unit_types`, and `profiles` models instead of replacing them.

## 2. Scope

### In scope

- Convert `/dat-kho` from a placeholder into a real lead + appointment request flow.
- Allow a lead to have multiple appointments over time.
- Preserve appointment history rather than overwriting operational history.
- Allow appointments to exist without a location or unit type until staff confirms details.
- Give each appointment its own assignee, independent from `leads.assigned_to`.
- Add a CRM lead-detail workspace with appointments, notes, status history, assignment, and timeline.
- Add appointment audit/history.
- Enforce role-based access and row-level security.
- Add validation, state-transition rules, tests, and production smoke coverage.

### Explicitly out of scope

- Real-time unit reservation.
- Locking or decrementing `available_count`.
- Payment, deposits, invoicing, or checkout.
- Calendar sync with Google/Outlook.
- SMS/Zalo/email automation.
- Generic task-management or full sales-activity platform.
- Replacing existing lead statuses or lead-note/history tables with a generic activity model.
- Production domain cutover to `nupsbox.vn`.
- Media upload/content seeding work.

## 3. Architectural decision

Use a dedicated appointment subsystem centered on `lead_appointments` plus immutable appointment history.

This is preferred over a generic activity/event table because the current codebase already has dedicated lead notes and lead status history. A focused appointment model is smaller, easier to secure, easier to test, and avoids an unnecessary CRM-wide refactor.

High-level flow:

```text
Public /dat-kho
   |
   +-- no preferred time --> create lead only
   |
   +-- preferred time ----> create lead + pending appointment
                                |
                                v
                         Admin CRM lead detail
                                |
              confirm / reschedule / assign / complete
                  cancel / no-show / add notes
```

## 4. Data model

### 4.1 `lead_appointments`

A new table stores the current operational state of each viewing appointment.

Recommended columns:

- `id uuid primary key`
- `lead_id uuid not null references leads(id)`
- `location_id uuid null references locations(id)`
- `unit_type_id uuid null references unit_types(id)`
- `assigned_to uuid null references profiles(id)`
- `scheduled_at timestamptz not null`
- `duration_minutes integer not null`
- `status appointment_status not null`
- `source appointment_source not null`
- `customer_note text null`
- `internal_note text null`
- `created_by uuid null references profiles(id)`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

`location_id` and `unit_type_id` remain nullable because a customer or staff member may create a proposed appointment before the best site or unit type is known.

`assigned_to` is appointment-specific. When staff creates an appointment from a lead, the UI should default it from `leads.assigned_to`, but the value can be changed independently.

### 4.2 Appointment status enum

Use these states only:

- `pending`
- `confirmed`
- `completed`
- `cancelled`
- `no_show`

Primary path:

```text
pending -> confirmed -> completed
```

Allowed terminal alternatives:

```text
pending   -> cancelled
confirmed -> cancelled
confirmed -> no_show
```

Terminal appointments (`completed`, `cancelled`, `no_show`) are read-only for core operational fields in the application layer. Corrections, if ever required operationally, should be a separately authorized action rather than ordinary editing.

### 4.3 Appointment source enum

Use:

- `customer`
- `staff`

`customer` means the appointment began as a public request. `staff` means a staff member created it from the CRM.

### 4.4 `lead_appointment_history`

A separate immutable history table records material appointment changes.

Recommended fields:

- `id uuid primary key`
- `appointment_id uuid not null references lead_appointments(id)`
- `lead_id uuid not null references leads(id)`
- `changed_by uuid null references profiles(id)`
- `event_type text not null`
- `before_state jsonb null`
- `after_state jsonb not null`
- `created_at timestamptz not null`

Material events include creation, status changes, time changes, location changes, unit-type changes, assignment changes, and cancellation/completion/no-show events.

Audit rows are append-only and are never editable through normal application flows.

## 5. Public `/dat-kho` flow

`/dat-kho` becomes a real bilingual form rather than a preparation notice.

Required customer fields:

- Full name.
- Phone.
- Need type.
- Estimated volume.

Optional fields:

- Email.
- Preferred location.
- Preferred unit type.
- Preferred viewing date/time.
- Customer message/note.

The page must explicitly state that the selected time is a **request**, not a confirmed reservation. Suggested Vietnamese wording:

> Đây là yêu cầu lịch hẹn. NupsBox sẽ liên hệ xác nhận trước khi lịch có hiệu lực.

If no viewing time is selected, the system creates only a lead.

If a viewing time is selected, the server creates the lead and one `pending` appointment with `source = customer`.

The public client must not be allowed to submit privileged fields such as appointment status, appointment assignee, `created_by`, internal notes, or audit metadata.

## 6. Atomic public creation

Creating a public lead and its optional appointment must behave as one logical operation.

If the appointment portion fails, the API must not tell the customer that the appointment request succeeded. The preferred implementation is a database transaction/RPC or another server-side transactional boundary that creates both records atomically.

The public browser must never receive a service-role key.

Existing anti-abuse and rate-limit patterns from the lead flow should be reused rather than introducing a parallel security mechanism.

## 7. Admin CRM UX

### 7.1 `/admin/leads`

Keep the existing lead list and current status filtering, while adding operational context:

- Lead assignee.
- Next appointment date/time.
- Next appointment status.
- Visual warning for an overdue actionable appointment.

The list remains a lightweight navigation surface rather than becoming a dense full CRM dashboard.

### 7.2 `/admin/leads/[id]`

Add a dedicated lead-detail workspace containing:

- Customer/contact data.
- Need details.
- Preferred/current location and unit type.
- Lead assignee.
- Lead status controls.
- Next appointment summary.
- Full appointment history.
- Lead notes.
- Lead status history.
- Unified chronological timeline composed from existing lead history, notes, and appointment events.

The timeline is a presentation-layer composition. It does not require replacing the underlying dedicated tables with a generic event store.

### 7.3 Appointment actions

For a permitted staff/admin user, expose these operations:

- Create appointment.
- Confirm.
- Reschedule.
- Change location.
- Change unit type.
- Change appointment assignee.
- Complete.
- Mark no-show.
- Cancel.

Staff-created appointments use `source = staff`.

When a staff user creates an appointment, `assigned_to` should default to the lead assignee if present, but remain editable.

## 8. Lead status interaction

Appointment status does not fully automate lead status.

UI recommendations:

- When an appointment becomes `confirmed`, suggest moving the lead to `viewing`.
- When an appointment becomes `completed`, show appropriate next lead-state actions such as `negotiating`, `won`, or another valid lead status.
- `cancelled` and `no_show` must not automatically mark a lead `lost`.

The final lead-state decision remains with staff because appointment outcome and sales outcome are not equivalent.

## 9. Authorization model

Reuse the existing application role model.

### Admin

- Read all leads and appointments.
- Create/update appointments.
- Update lead status and assignment.
- Add notes.
- Read appointment history.

### Staff

- Read CRM data according to existing lead permissions.
- Create/update appointments.
- Update leads where the existing permission model allows it.
- Add notes.
- Read appointment history.

### Viewer

- Read permitted CRM records.
- No appointment mutation.
- No lead mutation.
- No note creation.

### Public/anonymous

- Cannot read leads, appointments, histories, internal notes, or CRM data.
- Cannot directly insert/update `lead_appointments` through open table access.
- May submit the controlled public lead/appointment request through the validated server endpoint only.

RLS remains the authoritative database boundary. Application checks improve UX but do not replace RLS.

## 10. Validation rules

### Appointment creation

- `scheduled_at` must be in the future when a new active appointment is created.
- `duration_minutes` must have a server-controlled default and an allowed minimum/maximum range.
- Optional foreign keys must point to valid records when present.
- Appointment status and source must come from fixed enums.
- Public submissions may create only `pending` appointments with `source = customer`.

### Updates

- State transitions must follow the defined transition graph.
- Terminal appointments are not ordinarily editable.
- Staff cannot bypass authorization merely by sending different IDs in a request.
- Rescheduling records a history event with before/after state.

### Time handling

Persist timestamps as `timestamptz`. UI display and date/time interpretation for operations should use the NupsBox operating timezone (`Asia/Ho_Chi_Minh`) unless a future multi-timezone requirement is introduced.

## 11. Concurrency and stale updates

CRM updates should guard against silent overwrites when two staff members edit the same appointment.

Implementation may use `updated_at` as an optimistic-concurrency token or an equivalent compare-and-update mechanism. If the record changed after the user loaded it, the action should fail clearly and request a refresh rather than silently overwriting the newer change.

## 12. Error handling

Public form errors must distinguish between validation failure and temporary server failure without exposing internal database details.

CRM errors should identify actionable cases such as:

- Appointment already changed by another user.
- Invalid state transition.
- Referenced location/unit/assignee no longer valid.
- Permission denied.

No error path should delete existing lead or appointment history.

## 13. Security requirements

- No Supabase service-role credential in the browser.
- Public table read access to appointments/history is denied.
- Public direct appointment mutation is denied.
- Admin/staff mutation requires authenticated role checks plus RLS.
- Viewer mutation is denied at both application and database layers.
- Appointment-history writes happen through controlled application/database paths and history is append-only.
- Existing lead rate limiting and request validation should be extended rather than duplicated.

## 14. Testing strategy

### Database / pgTAP

Test at minimum:

- New enums exist with only expected values.
- Appointment FK relationships.
- RLS read/write behavior for anonymous, authenticated viewer, staff, and admin roles.
- Anonymous users cannot read appointments/history.
- Viewer cannot mutate.
- Staff/admin allowed operations match permissions.
- Appointment history is append-only.
- Transition enforcement cannot be bypassed at the database boundary where implemented.

### Unit tests

Test:

- Public form validation.
- Appointment validation.
- State-transition function/state machine.
- Time validation.
- Permission helpers.
- Optimistic concurrency behavior.

### Application tests

Test:

- `/dat-kho` lead-only submission.
- `/dat-kho` lead + appointment submission.
- Failed appointment creation does not report false success.
- Lead detail renders appointments and history.
- Staff can create/confirm/reschedule/complete/cancel/no-show according to rules.
- Viewer sees controls as read-only.

### CI and production smoke

Required before merge/deploy claims:

- Lint.
- Typecheck.
- Unit/application test suite.
- Production build.
- Database Tests workflow.
- Exact-head Vercel status where applicable.

After deployment, production smoke should verify:

- Valid public lead-only request.
- Valid public appointment request.
- Public cannot read appointment data.
- Viewer cannot mutate appointment data.
- Staff/admin appointment operations work with authenticated test access.
- No partial lead/appointment success is reported.

Authenticated production smoke requires valid test credentials. It must not be claimed complete when such credentials are unavailable.

## 15. Implementation boundaries

Implementation should remain decomposed into focused units:

- Appointment domain/types and transition rules.
- Public request validation and server transaction.
- Appointment persistence/query layer.
- Appointment audit/history layer.
- Admin lead-detail UI.
- Appointment action forms/actions.
- Public `/dat-kho` form.
- RLS and migration tests.

Avoid unrelated refactors. Existing lead list/status behavior should remain stable unless directly required by this design.

## 16. Delivery gates

P2.3 B1 should be delivered in controlled gates:

1. Database schema, enums, RLS, history/audit, and pgTAP tests.
2. Domain validation/state machine and server-side appointment services.
3. Admin lead-detail CRM and staff appointment operations.
4. Public `/dat-kho` lead + optional appointment request.
5. Full CI and database verification on the feature branch/PR.
6. Production migration only after code/PR verification and explicit production approval.
7. Production smoke, including authenticated CRM smoke only when credentials are available.

No domain/DNS changes are part of this phase.

## 17. Success criteria

P2.3 B1 is successful when:

- A public customer can submit a lead with or without a preferred viewing time.
- A preferred viewing time creates a pending request rather than a real-time reservation.
- A lead can retain multiple appointments and full appointment history.
- Staff can manage appointment lifecycle without deleting history.
- Appointment location and unit type may remain unknown until confirmation.
- Appointment assignment can differ from lead assignment.
- Lead status is not incorrectly auto-derived from appointment outcome.
- Viewer/public mutation boundaries are enforced by RLS.
- No stock, reservation, or payment behavior is implied or implemented.
- Tests and smoke checks verify both happy paths and permission boundaries.
