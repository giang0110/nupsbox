# P3.15 UI/UX Refinement

Date: 2026-09-19

## Goal

Reduce visual density and repetitive card/form surfaces while keeping the current content, permissions and data model intact.

## Scope

- Convert Admin Media CMS from stacked full-width editors into a responsive visual media library.
- Keep preview, public/private state, category, location and unit visible at a glance.
- Collapse metadata editing and destructive actions until the user explicitly opens an item.
- Collapse Upload and Bulk Media tools by default to shorten the page.
- Preserve P3.14 Admin-only delete flow inside each media item.
- Improve homepage FAQ scanability with a single framed accordion, sticky intro on desktop, visible chevrons and the first answer open by default.

## Guardrails

- No database migration.
- No auth/RBAC/RLS changes.
- No media mutation behavior changes.
- No changes to upload/delete payloads or storage paths.
- No invented marketing claims or facility facts.

## Acceptance

- Media library uses 1 column on mobile, 2 on medium screens and 3 on very large screens.
- Each media card exposes summary information without opening the editor.
- Upload, bulk editing and metadata editing are collapsed by default.
- Delete remains available only when canDelete is true.
- Homepage FAQ keeps all existing content and links.
- Lint, typecheck, tests, build, E2E, Database Tests and Preview smoke pass before merge.
