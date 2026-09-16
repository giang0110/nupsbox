## Task 4 — Admin lead-detail read model and timeline

Implemented the P2.3 CRM read-model layer without changing the Task 5 UI/actions or public pages.

### Delivered

- Enriched `listAdminLeads` while retaining its status filter and 100-row cap. Rows now include the lead assignee ID/name and next actionable appointment. Missing/inactive assignee labels resolve to `null`.
- Added `selectNextAppointment`, which chooses the earliest future pending/confirmed appointment, otherwise the latest overdue actionable appointment, and flags only overdue confirmed appointments.
- Preserved the established `AdminLeadDetail`, `projectAdminLeadDetail`, and one-argument `getAdminLeadDetail(leadId)` call. `getAdminLeadDetail` now accepts an optional viewer role defaulting to `viewer` and returns the compatible flat fields plus a `lead` alias, appointments, status/appointment history, options, unified timeline, and capability flags.
- Added authenticated server-client reads for lead notes and status history (newest first), appointments (scheduled time descending), appointment history for the loaded appointment IDs (newest first), active staff/admin profile labels, active locations, and active unit types.
- Added a presentation-layer timeline composition with note, lead-status, and appointment events sorted newest first.

### TDD and verification

- Added pure selector/timeline tests first and ran them red: `selectNextAppointment` was absent and `lead-timeline` could not resolve.
- Focused suite passed: 9 tests across the admin lead list/detail and timeline suites.
- CI-placeholder full suite passed: 92 passed, 1 skipped.
- Lint and typecheck passed after removing two unused type imports. `git diff --check` passed.

### Scope / concerns

- No Task 5 rendering/actions or public booking code was changed.
- The existing Vitest configuration prints its pre-existing native-config migration warning; it does not affect the successful test result.
- Database/RLS behavior remains governed by the authenticated Supabase server client and existing policies; live database verification is outside this task's local test scope.
