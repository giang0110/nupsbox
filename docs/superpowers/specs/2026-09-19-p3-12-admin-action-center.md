# P3.12 Admin Action Center

Date: 2026-09-19  
Base: `main@dbc8badda0a50e3f3d0bb27f2edd856677accedc`

## Goal

Turn the existing Admin dashboard, QA rules, CRM attention queue and content calendar into one compact action queue so staff can see what needs attention first without opening multiple screens.

## Scope

- Add `/admin/action-center`.
- Reuse existing production-safe sources:
  - Admin QA snapshot/issues.
  - CRM dashboard attention data.
  - P3.11 content calendar.
- Group work into CRM, Content and Public website/data.
- Sort by `danger → warning → info`.
- Add overdue confirmed viewing appointments as an urgent CRM action.
- Add reminders for content scheduled in the next 7 days and outstanding drafts.
- Add an Admin dashboard quick action linking to the Action Center.
- Do not add a migration, cron job, notification table, new auth role or new RLS policy.
- Do not expose additional lead PII in the Action Center.

## Acceptance

- Existing permissions remain unchanged.
- Viewer/staff/admin access continues to follow `dashboard:read` and existing feature RLS.
- Action Center contains counts and links, not a new copy of lead identity data.
- Unit tests cover ordering, overdue appointment triage and empty state.
- Lint, typecheck, unit/integration tests and build must pass on the exact branch head before merge.
