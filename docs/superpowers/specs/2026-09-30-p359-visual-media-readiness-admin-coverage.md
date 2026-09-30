# P3.59 — Visual Media Readiness & Admin Coverage

## Goal
Turn Admin Media from an asset library into a visual readiness dashboard that shows which real public surfaces are still missing usable imagery.

## Coverage model
Track only surfaces already rendered by the public site:
- four Solution contexts;
- active unit types;
- active locations;
- currently published Blog posts.

A surface is covered only when the public rendering hierarchy can actually resolve a public asset.

### Blog hierarchy
1. public explicit cover;
2. public direct Blog mapping;
3. public Topic mapping;
4. generated editorial fallback is not counted as real-media coverage.

### Unit and location rules
- Unit coverage requires a public asset linked to the exact unit type and in a category consumed by the public unit reader.
- Location coverage requires a public asset linked to the exact active location and in a category consumed by the public location gallery.

## Quality signals
- weak bilingual alt text;
- editorial mappings pointing to private or missing media;
- one media asset reused across more than three distinct contexts.

These are review signals only. P3.59 does not automatically delete, unpublish, remap or rewrite media.

## UX
- Add a Visual Coverage panel near the top of Admin Media.
- Show total coverage score and compact counts.
- List only missing surfaces as actionable links.
- Link unit/location gaps back to pre-filtered Admin Media.
- Link editorial gaps directly to the mapping area.
- Keep the existing upload, bulk edit, mapping and media library workflows unchanged.

## Constraints
- No database migration.
- No production data mutation.
- No new public query.
- No auth/RBAC/RLS change.
- Reuse already loaded Admin Media page data.

## Verification
Exact PR head must pass lint, typecheck, unit tests, build, P2.5 E2E and Database Tests before merge, followed by production smoke.
