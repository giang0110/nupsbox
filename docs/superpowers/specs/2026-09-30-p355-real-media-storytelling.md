# P3.55 — Real Media & Commercial Storytelling

## Goal
Use verified NupsBox facility media in the editorial and solution experience without pretending that every photo represents every use case.

## Architecture
- Keep `media_assets` as the canonical image asset.
- Add `media_editorial_links` as a small mapping table.
- A link maps one media asset to:
  - `blog`
  - `solution`
  - `topic`
- Link roles:
  - `feature`
  - `inline`
  - `gallery`
- Public readers can only see a mapping when the linked media asset itself is public.
- Staff/admin can create/update/remove mappings through Admin Media.
- Media upload, storage, blog publishing and cover-media flows remain unchanged.

## Public storytelling
- Solution pages can show a compact “real NupsBox space” story strip when linked media exists.
- Article pages can show linked real-facility media separately from the conceptual editorial cover.
- Real facility imagery is explicitly labelled as facility imagery, not as a literal depiction of the article scenario.
- If no mapping exists, no empty media block is rendered.

## Initial production mapping
Seed links from existing public media by category only:
- online seller → lifestyle
- small business → location
- inventory → unit
- personal → lifestyle
- blog articles receive a category-appropriate facility image

The seed is data-dependent and idempotent. Clean/local databases with no media simply receive no seed rows.

## Admin
- Add an Editorial Media Mapping panel inside Admin Media.
- Show current mappings with public/private state.
- Allow staff/admin to add and remove mappings.
- Keep viewer read-only.
- Surface warnings for weak alt text and private assets.

## Release gate
1. Migration + pgTAP/RLS contracts.
2. lint/typecheck/unit/build.
3. Playwright.
4. Apply migration to production.
5. Verify seed mappings and public RLS.
6. Merge and production smoke.
