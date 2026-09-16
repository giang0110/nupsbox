# Task 2 Report — Appointment domain, schemas, and HCMC time conversion

Date: 2026-09-16

## Scope delivered

- Created `features/appointments/domain.ts` with database-derived appointment status/source types, terminal statuses, and the permitted transition graph.
- Created `features/appointments/schema.ts` with strict public/create/update schemas, duration boundaries/defaults, and empty-string normalization appropriate to create versus patch requests.
- Created `features/appointments/time.ts` to convert `YYYY-MM-DDTHH:mm` Ho Chi Minh local values to UTC ISO timestamps and reject invalid input shape.
- Added focused real-behavior unit suites:
  - `tests/unit/appointment-domain.test.ts`
  - `tests/unit/appointment-schema.test.ts`
  - `tests/unit/appointment-time.test.ts`
- Verified Task 1's existing `types/database.ts` snapshot contains both appointment tables, both appointment enums, and `submit_public_lead_request`; it already provides the required aliases and was not changed in this task.

## TDD evidence

### RED

Command (with placeholder values for the eager environment parser):

```powershell
npm run test:run -- tests/unit/appointment-domain.test.ts tests/unit/appointment-schema.test.ts tests/unit/appointment-time.test.ts
```

Result: failed as expected before implementation. All three suites failed at Vite import resolution because `@/features/appointments/domain`, `schema`, and `time` did not exist.

### GREEN

The same focused command was rerun after the minimal implementations.

Result:

```text
Test Files  3 passed (3)
Tests  8 passed (8)
```

`npm run typecheck` then completed successfully (`tsc --noEmit`, exit 0).

### Full suite

Command run once (with the same placeholder environment values):

```powershell
npm run test:run
```

The command harness reported completion, but returned only Vitest's startup header rather than its usual final file/test counts. The captured output included the pre-existing Vite `configLoader: 'native'` future-warning. No failure diagnostics were returned. This output truncation/anomaly is retained as a verification concern rather than represented as a counted pass.

## Self-review

- Transition graph exactly allows `pending → confirmed/cancelled` and `confirmed → completed/cancelled/no_show`; terminal states have no outgoing transitions.
- Public schema is `.strict()`, rejects `status`, defaults duration to 30, and enforces the 15–180 minute range.
- Create schemas convert blank optional UUID/text values to `undefined`; update schemas convert blank clearable UUID/text values to `null`, preserving the branch contract that unassignment is nullable.
- HCMC conversion uses the phase's fixed `+07:00` offset and produces the required canonical UTC ISO result.
- No migration, public page, admin feature, or unrelated file was changed.

## Concerns

- The full-suite result did not include final Vitest counts in the execution harness output, despite the command reporting completion. Focused tests and typecheck have explicit successful output.
- Vitest emits an existing Vite future-warning about ESM syntax in `vitest.config.ts`; this task did not alter test configuration.
- Local Supabase CLI generation remains unavailable per the SDD ledger. The Task 1 synchronized `types/database.ts` snapshot was inspected and contains the required appointment contracts.
