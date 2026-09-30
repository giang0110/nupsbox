# P3.58 — Premium Visual Composition & Conversion Flow

## Goal
Refine the existing public composition so NupsBox feels more premium, visual and decisive without adding more homepage sections or increasing scroll depth.

## Fixed constraints
- Homepage remains exactly four primary blocks: Hero, Decision Hub, Insights, Final CTA.
- No database migration or production data mutation.
- No auth/RBAC/RLS changes.
- No pricing, availability or facility facts are invented.
- Existing public routes and conversion intents remain intact.
- Important CTAs remain visible without hover-only interaction.

## Composition changes

### Hero
- Keep the current two-column editorial layout.
- Tighten vertical footprint on desktop.
- Give verified facility imagery a premium inset-frame treatment.
- Preserve the complete narrative and trust strip in low-height laptop viewports.

### Decision Hub
- Preserve the four use-case choices and compact fact rail.
- Add one tracked primary conversion CTA after the decision facts.
- Keep secondary links to facility and FAQ as supporting actions rather than competing primaries.

### Insights
- Increase the visual weight of the featured article image when available.
- Keep the two secondary articles compact.
- Do not add another editorial row or carousel.

### Final CTA
- Convert the large centered closing section into a compact horizontal conversion rail on desktop.
- Keep title, description and both actions.
- Reduce vertical padding while keeping mobile touch targets intact.

### Global compact rhythm
- Tighten `Section size="compact"` vertical spacing.
- Do not alter the default section rhythm.
- This reduces scroll depth on existing compact public surfaces without deleting content.

## Verification
1. Source-contract tests for four-block homepage, tracked Decision Hub CTA, larger featured visual and horizontal Final CTA.
2. Existing visual-layout E2E must continue to pass at laptop, tablet and mobile sizes.
3. lint/typecheck/unit/build.
4. P2.5 E2E and Database Tests on exact PR head.
5. Merge only after exact-head gates pass.
6. Confirm Vercel exact-head and post-merge production smoke.
