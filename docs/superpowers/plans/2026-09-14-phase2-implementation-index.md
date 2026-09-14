# NupsBox Phase 2 — Implementation Plan Index

**Written spec status:** APPROVED by the user on 2026-09-14.  
**Implementation status:** NOT STARTED.  
**Hard prerequisite:** Phase 1 must be production-ready, merged into `main`, and `main` must be green before any Phase 2 production code or migration is created.

This approval record supersedes the earlier draft-status wording in the design document header. The approved design source remains:

`docs/superpowers/specs/2026-09-14-phase2-conversion-operations-design.md`

## Execution order

1. `2026-09-14-phase2-p21-data-permissions.md`
2. `2026-09-14-phase2-p22-cms.md`
3. `2026-09-14-phase2-p23-crm.md`
4. `2026-09-14-phase2-p24-analytics-attribution.md`
5. `2026-09-14-phase2-p25-hardening-release.md`

Each subphase must satisfy its exit criteria before the next subphase begins.

## Branch rule

The documentation branch is not an implementation base.

At implementation time:

```text
close Phase 1 production blockers
→ merge Phase 1 into main
→ verify main exact head green
→ create a fresh Phase 2 implementation branch from updated main
→ execute P2.1 through P2.5
```

Do not stack Phase 2 code onto PR #1 or onto `docs/phase-2-conversion-operations-design`.

## Migration-version rule

The plans reserve this intended order:

```text
20260915000100 phase2 lead status values
20260915000200 phase2 CRM integrity/RLS/audit
20260915000300 phase2 CMS publishing/RLS/audit
20260915000400 phase2 lead export audit RPC
20260915000500 phase2 verified indexes — only if query-plan evidence requires it
```

Immediately before P2.1 creates the first migration, compare the then-current `main` migration directory and production migration history. If any planned version collides with a migration that now exists, renumber the complete Phase 2 migration sequence to fresh monotonically increasing versions while preserving the dependency order above. Update all plan references before writing SQL. Never rewrite an already-applied migration.

## Release rule

A green Phase 2 branch is not authorization to merge or deploy. P2.5 ends by reporting exact-head evidence and waiting for explicit go-live approval.
