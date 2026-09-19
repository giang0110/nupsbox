# P3.7 Admin Operations & Content Hub

Date: 2026-09-19
Base: `main@b9a59fdcbec93573b2977d207299e0be891e37ea`

## Goal

Turn Admin into a compact operations hub that tells staff what to do next instead of only showing counts.

## Dashboard

- Add role-aware Quick Actions.
- Show the five highest-priority QA issues from production data.
- Keep the existing CRM attention panel.
- Collapse the seven-status pipeline into a native disclosure to reduce vertical scrolling.
- Expand operational health to catalog, pricing, media, FAQ and blog counts.

## Vận hành & QA

Add `/admin/quality` with three rule groups:

- Public & SEO readiness: published location/unit types, pricing configuration and public contact channels.
- Content & media: public media, bilingual alt text, location mapping and blog publication readiness.
- CRM follow-up: new leads older than four hours, unassigned open leads, and open leads stale for more than three days.

Rules report factual database state only. They do not mutate data.

## Media bulk operations

Allow users with `media:update` to select up to 100 media rows and change:

- public/private state;
- category;
- linked location (set, clear or keep).

No bulk delete, storage overwrite or file mutation is introduced.

## Guardrails

- Preserve exactly seven CRM statuses.
- No database migration.
- No production content seed.
- No changes to Auth/RBAC/RLS.
- Viewer remains read-only.
- QA rules link to the existing management surfaces rather than auto-fixing business facts.
