# P3.6 Media Gallery & Admin CMS

Date: 2026-09-19
Base: `main@b080a05846c9e7e9496cf6cae3b18f7cd52928b6`

## Goal

Give NupsBox a real warehouse-image presentation surface and make media/blog content manageable from Admin.

## Public UX

- Homepage gains a compact warehouse gallery only when public location-linked media exists.
- Gallery uses one large active image, previous/next controls and horizontal thumbnails.
- Images are always tied to the published location through `media_assets.location_id`.
- Empty media produces no extra homepage scroll block.
- Public Blog lists published CMS posts and can open an optional verified external/source URL.

## Admin UX

- Media page can upload JPG/PNG/WebP/AVIF up to 8 MB.
- Upload requires bilingual alt text, category and optional location/unit mapping.
- Media preview is visible in Admin.
- Blog editor supports an optional source/introduction URL and cover image chosen from Media CMS.
- New permission `media:create` is granted to admin/staff, not viewer.

## Storage/database contract

- Public bucket: `nupsbox-media`.
- Staff/admin can insert/update/delete objects in that bucket; viewers cannot upload.
- Upload paths are generated server-side and never overwrite existing files.
- Blog posts gain optional `source_url` restricted to HTTP(S).
- No production content is seeded by the migration.

## Guardrails

- No image is shown on a facility unless its media row is linked to that location and public.
- No SVG upload.
- No file over 8 MB.
- No client-provided storage path.
- No PII is stored in media metadata or blog source URL.
