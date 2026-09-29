# P3.56 — Contextual Visual Merchandising

## Goal
Turn the P3.55 editorial media mappings into a compact, high-impact visual layer across the commercial site without creating fake facility claims or lengthening the homepage.

## Visual source hierarchy
For editorial cards and insight surfaces, use the first available source in this order:
1. explicit published Blog cover media;
2. direct `blog` editorial mapping;
3. matching `topic` editorial mapping;
4. existing generated editorial cover.

This keeps authored cover choices authoritative while allowing real NupsBox facility media to enrich articles that do not have a dedicated cover.

## Public experience
- Blog hub featured article can use mapped real media when no explicit cover is assigned.
- Blog library cards can use mapped real media before falling back to the generated editorial cover.
- Homepage Insights can show a compact visual tile for the featured article without adding another homepage section.
- Mapped real media is visibly labelled as NupsBox facility imagery.
- Topic mappings from P3.55 are now consumed publicly instead of remaining admin-only metadata.

## Data and safety
- No new database columns or migration.
- Reuse `media_editorial_links` and public `media_assets`.
- Public rendering still requires the underlying media asset to be public.
- No synthetic or generated image is inserted into production media automatically.
- Existing explicit Blog cover media always wins over editorial mappings.

## Performance
- Add a batched contextual media reader to avoid one query per article.
- Resolve direct Blog and Topic mappings in parallel.
- Limit each card/insight surface to one contextual image.

## Release gate
1. Unit regression contracts for source hierarchy and public surfaces.
2. lint/typecheck/unit/build.
3. Existing Playwright and production smoke routes remain green.
4. Merge only after exact-head CI passes.
