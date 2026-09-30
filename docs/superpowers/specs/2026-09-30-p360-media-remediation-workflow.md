# P3.60 — Media Remediation Workflow

## Goal
Turn P3.59 diagnostics into an actionable remediation workflow inside the existing Admin Media screen.

## Workflow
Admin Media supports query-driven remediation queues:
- `issue=weak-alt`: only public assets with weak/generic bilingual alt text;
- `issue=broken-mapping`: editorial mappings pointing to private or missing assets, plus any still-existing private assets referenced by those mappings;
- `issue=overused`: assets reused across more than three distinct public contexts.

The existing location and unit filters remain compatible and intersect with remediation queues.

## Deep links
Coverage gaps route directly to the place where they can be fixed:
- missing active unit/location visual → pre-filtered media upload area;
- missing Solution visual → Editorial Mapping with that Solution context preselected;
- missing Blog visual → Editorial Mapping with that Blog context preselected.

## Editing behavior
- Media cards opened from a remediation queue are highlighted and their metadata details are expanded by default.
- Weak-alt cards explain the bilingual alt repair.
- Broken-mapping cards explain the safe choice: publish only verified media or remove the mapping.
- Overused cards show the distinct-context usage count.
- New editorial mappings only offer public assets, preventing new mappings that cannot render publicly.
- Broken-mapping mode shows only mappings needing remediation and retains explicit remove actions.

## Safety
- No automatic publish, delete, remap or metadata rewrite.
- No database migration.
- No public query changes.
- No auth/RBAC/RLS changes.
- Existing upload, bulk update, delete and optimistic-concurrency protections remain unchanged.

## Verification
Exact PR head must pass lint, typecheck, unit tests, build, P2.5 E2E and Database Tests before merge, followed by exact-head Vercel and production smoke checks.