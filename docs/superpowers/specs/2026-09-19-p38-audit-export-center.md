# P3.8 Audit & Export Center

Date: 2026-09-19
Base: `main@5267eba33e365cd0e19ce3e05a9381d2423962e0`

## Goal

Make existing database audit history usable in Admin and activate the already-defined admin-only lead export permission.

## Audit Log

- Add `audit:read` application permission for admin only.
- Add `/admin/audit` under the Operations navigation group.
- Respect production RLS: `audit_log` is readable only when `is_admin()`.
- Show the 100 newest rows with table/action filters.
- Resolve actor display names through profiles.
- Link known audited tables back to their existing Admin workspaces.
- Render only allowlisted metadata fields; unknown metadata is not rendered.

## Lead CSV Export

- Use the existing `leads:export` permission; admin only.
- Export follows current CRM status/assignee/source/search filters.
- Maximum 5,000 rows, fetched in bounded pages.
- Exclude free-form lead message from CSV to reduce unnecessary PII exposure.
- Neutralize spreadsheet-formula prefixes.
- Return UTF-8 BOM CSV with private/no-store cache headers.

## Guardrails

- Staff and viewer cannot read Audit Log or export leads.
- No change to the seven CRM statuses.
- No DB migration, production write or RLS change.
- Audit metadata is not dumped as arbitrary JSON.
