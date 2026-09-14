# NupsBox Website Design Specification

**Approved:** 2026-09-14

## Goal

Build a professional, modern bilingual website for **NupsBox - Cho thuê kho mini làm địa điểm kinh doanh tại TP.HCM giá rẻ**, using `https://nupsbox.vn` as the canonical production domain.

## Product direction

- Lead-first Phase 1: visitors discover a suitable unit, compare options, and submit an enquiry. Online booking is prepared in the information architecture but is not presented as real-time inventory or a guaranteed reservation.
- Launch with one physical NupsBox location while keeping the data model multi-location ready.
- Vietnamese is the default locale; English is available under `/en` with localized slugs.
- Use Next.js, Supabase, and Vercel.
- Public pages use real NupsBox imagery/content when available; no fabricated customer claims, stock counts, or real-time availability.
- Admin is a separate authenticated workspace.

## Public information architecture

- `/`
- `/kho-mini`
- `/kho-mini/[slug]`
- `/bang-gia`
- `/dia-diem`
- `/dia-diem/[slug]`
- `/giai-phap`
- `/giai-phap/shop-online`
- `/giai-phap/doanh-nghiep-nho`
- `/giai-phap/chua-hang`
- `/giai-phap/ca-nhan`
- `/cach-thue`
- `/ve-nupsbox`
- `/cau-hoi-thuong-gap`
- `/blog`
- `/lien-he`
- `/dat-kho`
- `/admin`

English equivalents live under `/en` and use localized slugs where configured.

## Homepage order

1. Header
2. Hero
3. Storage Finder
4. Featured unit types
5. Use cases
6. Cost comparison
7. Real NupsBox gallery
8. Security and convenience benefits
9. Featured location
10. How renting works
11. Social proof (only verifiable claims)
12. FAQ
13. Final CTA
14. Footer

## Data and security

- Supabase is the source of truth for locations, unit types, location pricing/availability labels, media, FAQ/content, blog, leads, staff profiles, settings, and audit data.
- RLS is authoritative for access control; UI role checks are only a presentation layer.
- Anonymous users can read only public catalog/content and cannot read CRM data.
- Lead submission goes through a server endpoint with validation, honeypot protection, rate limiting, and UTM/referrer attribution.
- Admin roles: `admin`, `staff`, `viewer`.

## Phase 1 admin acceptance

Authenticated admin workspace must provide practical management surfaces for:

- Leads/CRM
- Locations
- Unit types and location-specific pricing/availability labels
- FAQ/content
- Media metadata
- Site settings

Mutations must respect the existing permission/RLS contract.

## SEO and analytics acceptance

- Canonical domain is `https://nupsbox.vn`.
- Locale-aware title/description/canonical/hreflang metadata.
- `sitemap.xml` and `robots.txt` generated from the application.
- Relevant JSON-LD for Organization/LocalBusiness, FAQ and breadcrumb/page entities when data is available.
- Booking preparation page remains non-indexed until online booking is genuinely available.
- Do not publish fabricated ratings/reviews.

## Phase 1 quality gates

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run test:run`
- `npm run build`
- Public VI/EN routes render correctly.
- Deterministic Storage Finder behavior is tested.
- Supabase migrations/RLS contract are verified before production push.
- Lead validation + UTM flow is tested.
- Admin access is authenticated and permission-aware.
- HTTPS production deployment on `nupsbox.vn` occurs only after the code and database gates pass.
