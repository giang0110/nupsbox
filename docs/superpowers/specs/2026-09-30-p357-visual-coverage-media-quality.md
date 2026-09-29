# P3.57 — Visual Coverage & Media Quality

## Goal
Close the remaining high-impact visual gaps in the commercial experience by reusing verified media already linked to NupsBox unit types and solution contexts.

## Audit summary
Already visually covered:
- Homepage hero and decision flow
- Blog hub/cards/articles
- Solution detail pages
- About and location pages with facility gallery

Remaining high-impact gaps:
- unit catalog cards are text-only even when a unit-linked public asset exists;
- pricing cards repeat the same text-only unit presentation;
- unit detail pages do not surface their own linked media;
- location detail unit cards do not reuse unit-linked media;
- the solutions hub is text-only although P3.55 already stores solution media mappings.

## Unit media hierarchy
- Read only public `media_assets` whose `unit_type_id` matches the unit.
- Prefer the first published asset by existing `sort_order` and `created_at`.
- Limit eligible categories to unit-relevant commercial imagery.
- If no asset exists, keep the current navy/text card design unchanged.
- Never reuse one unit's image for a different unit.

## Public experience
- UnitCard can render a verified unit-linked image without changing its information or conversion controls.
- Mini-storage catalog and Pricing share one batched media map.
- Unit detail adds a compact visual panel when verified media exists.
- Location detail reuses unit media for its unit cards.
- Solutions hub reuses existing `solution` editorial mappings as compact card visuals.
- Real/mapped imagery is labelled so it is distinguishable from decorative fallback UI.

## Architecture and performance
- Add one batched `getPublicUnitMediaMap` reader.
- Do not query per card.
- Reuse `getPublicEditorialMediaForContexts` for solution cards.
- No new database columns or migration.
- No production data mutation.

## Release gate
1. Source-contract tests for unit scoping, fallbacks and solution mapping.
2. lint/typecheck/unit/build.
3. P2.5 E2E and Database Tests on exact PR head.
4. Merge only after exact-head gates pass.
5. Production smoke must confirm deployment identity, public routes, canonical/security checks and lead API guardrails.
