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

---

# Fix round 1 — strict local datetime validation and schema coverage

Date: 2026-09-16

## Reviewer findings addressed

1. `hoChiMinhLocalToIso` accepted pattern-matching overflow values because `Date` normalizes them.
2. Appointment create/update schemas lacked focused unit coverage for duration/default and clearable patch semantics.

## Root cause and minimal correction

The original implementation only checked the input shape and whether `Date` produced `NaN`. JavaScript normalizes values such as `2026-02-30T09:30` and `2026-09-20T24:00`, producing valid timestamps rather than `NaN`.

`features/appointments/time.ts` now captures the five local components, parses the fixed `+07:00` timestamp, shifts the resulting instant back to Ho Chi Minh local time, and compares its UTC component getters with the original input. Any mismatch throws `invalid_local_datetime`.

No schema production change was needed: the new tests confirmed the existing create/update schema behavior already matches the required contract.

## Tests added

- `tests/unit/appointment-time.test.ts`
  - rejects an invalid normalized calendar date (`2026-02-30T09:30`)
  - rejects an invalid normalized clock value (`2026-09-20T24:00`)
- `tests/unit/appointment-schema.test.ts`
  - create input defaults duration to 30 and coerces a valid string duration
  - create input rejects durations below 15 and above 180
  - update input keeps omitted clearable fields `undefined`
  - update input converts explicit `null` and blank clearable values to `null`
  - update input rejects durations outside 15–180

## TDD evidence

### RED

Focused appointment command (with CI placeholder environment values) before the time fix:

```powershell
npm run test:run -- tests/unit/appointment-domain.test.ts tests/unit/appointment-schema.test.ts tests/unit/appointment-time.test.ts
```

Result: `tests/unit/appointment-time.test.ts` failed exactly in the two new regressions. Both expected `invalid_local_datetime`, but received no throw. The full focused result was 1 failed / 2 passed files and 2 failed / 13 passed tests. The added schema coverage passed against existing behavior.

### GREEN

After the minimal time validation change, the same focused command passed:

```text
Test Files  3 passed (3)
Tests  15 passed (15)
```

`npm run typecheck` also completed successfully (`tsc --noEmit`, exit 0).

### Full suite

Ran once with the same placeholder environment values:

```text
Test Files  26 passed | 1 skipped (27)
Tests  87 passed | 1 skipped (88)
```

## Self-review

- The component round-trip detects both date rollover and hour rollover while preserving valid HCMC-to-UTC conversion.
- The validation remains intentionally limited to the phase's fixed `+07:00` HCMC offset.
- Patch tests distinguish omission (`undefined`, no change) from explicit clear (`null`), including blank normalization, preserving nullable lead unassignment conventions.
- Scope is limited to the time helper, appointment schema/time tests, and this appended report.

## Remaining warnings / concerns

- Vitest continues to emit the existing Vite `configLoader: 'native'` future-warning about ESM syntax in `vitest.config.ts`.
- The full run reports jsdom setup overhead (27 environments / 115.35 seconds tracked); no functional failure resulted and this fix does not alter test infrastructure.
