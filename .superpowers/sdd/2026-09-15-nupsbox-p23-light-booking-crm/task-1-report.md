# Task 1 implementer report

Status: DONE_WITH_CONCERNS

## What was implemented

- Added appointment status/source enums, appointment and immutable-history tables, indexes, timestamp trigger, validation trigger, audit trigger, and append-only history protection.
- Added explicit authenticated read/admin-staff mutation RLS policies and widened operational profile lookup to viewer-readable active staff/admin targets.
- Added the security-definer atomic public lead request RPC; only `service_role` can execute it.
- Extended pgTAP schema/RLS/CRM behavior contracts and synchronized `types/database.ts` with the new tables, enums, and RPC.

## Verification

- `git diff --check`: passed.
- `npm run test:run` with CI environment values: 23 files passed, 72 tests passed, 1 skipped.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npx supabase db lint` / `npx supabase test db`: not runnable because Docker/Podman is not installed; CLI could not connect to local Postgres at `127.0.0.1:54322`.

## TDD evidence

- RED: contract assertions were added before the migration; expected database objects were absent. The intended `supabase test db` execution was blocked by the missing Docker/Podman runtime rather than producing pgTAP output.
- GREEN: migration was added and static application checks passed; database GREEN remains pending a Docker-capable environment.

## Files changed

- `supabase/migrations/20260915000400_phase2_light_booking_crm.sql`
- `supabase/tests/schema_contract.sql`
- `supabase/tests/rls_contract.sql`
- `supabase/tests/crm_behavior.sql`
- `types/database.ts`

## Concerns

The migration needs fresh local Supabase/pgTAP execution before production use. The audit event names for duration/customer/internal note changes follow the implementation plan's granular mapping.

## Review fix round 1

The task reviewer found that direct inserts could choose a non-pending appointment status and bypass the transition graph. The fix worker is adding a pgTAP regression assertion and a validation-trigger guard requiring every newly inserted appointment to start as `pending`; Docker/Podman remains unavailable for executing the database test.

## Review fix round 1 report

Status: FIXED_WITH_DATABASE_TEST_BLOCKED

### Finding and fix

The appointment validation trigger previously enforced lifecycle transitions only for `UPDATE`, allowing a direct `INSERT` to specify `confirmed`, `completed`, `cancelled`, or `no_show`. The trigger now rejects every `INSERT` whose status is not `pending` before the remaining validation checks run:

```text
new appointments must start as pending (SQLSTATE 23514)
```

The public RPC and staff action contracts were not changed; the RPC already inserts `pending` appointments.

### Files changed in round 1

- `supabase/tests/crm_behavior.sql`: increased `plan(22)` to `plan(23)` and added a focused `throws_ok` assertion for a direct `confirmed` INSERT expecting SQLSTATE `23514` and the clear error message.
- `supabase/migrations/20260915000400_phase2_light_booking_crm.sql`: added the minimal INSERT status guard to `public.validate_lead_appointment_change()`.

### TDD evidence

- RED attempt: `npx supabase test db` was run after adding the assertion and before the migration guard. It could not reach pgTAP because the local database was unavailable:

  ```text
  exit 1
  Connecting to local database...
  failed to connect to postgres ... host=127.0.0.1 ... 127.0.0.1:54322
  suggestion: Make sure Docker is running, then run: supabase start
  ```

  Therefore, no database-level failing assertion output can be claimed in this environment.

- GREEN attempt: after applying the trigger guard, the same database execution remains blocked by the identical unavailable Docker/Podman-backed local Postgres condition. Application/static verification passed, but database GREEN cannot be claimed until a container runtime is available.

### Checks and output

- `git diff --check`: passed, exit 0.
- `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=ci-test-key NEXT_PUBLIC_SITE_URL=http://localhost:3000 npm run test:run`: passed; `Test Files 23 passed | 1 skipped (24)`, `Tests 72 passed | 1 skipped (73)`, exit 0.
- `npm run lint`: passed, exit 0.
- `npm run typecheck`: passed, exit 0.
- `npx supabase db lint`: blocked; connection refused at `127.0.0.1:54322` because Docker/Podman is unavailable.
- `npx supabase test db`: blocked; connection refused at `127.0.0.1:54322` because Docker/Podman is unavailable.

### Commit

The round-1 fix is committed separately from the prior Task 1 implementation.

## Review fix round 1 completion

### What changed

- Added one pgTAP assertion to `supabase/tests/crm_behavior.sql` and increased its plan from 22 to 23. An explicit non-`pending` appointment INSERT must fail with SQLSTATE `23514` and message `new appointments must start as pending`.
- Added the minimal `BEFORE INSERT` guard to `public.validate_lead_appointment_change()` in `20260915000400_phase2_light_booking_crm.sql`. UPDATE transition behavior, the public RPC, and staff behavior are unchanged.

### Tests and output

- RED: `npx supabase test db` exited 1 before database execution: connection refused at `127.0.0.1:54322`.
- GREEN/static: `git diff --check` exited 0; `npm run lint` exited 0; `npm run typecheck` exited 0; CI-placeholder `npm run test:run` reported 23 files passed, 72 tests passed, 1 skipped.
- Database pgTAP remains blocked: `npx supabase start` reported `docker: command not found (podman also not found) — install Docker Desktop or Podman and ensure it is on PATH`.

### Concerns

Fresh `supabase db reset` and `supabase test db` execution is still required in an environment with Docker or Podman.
