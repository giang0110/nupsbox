# P2.8 Production Fact Safety & Launch Readiness — Design Specification

Date: 2026-09-18  
Repository: `giang0110/nupsbox`  
Base: `main@5a56bb866b9b0daf91b82a223fdea2ac8d6a3df4`  
Phase: P2.8  
Status: Approved for implementation by continuation instruction

## 1. Purpose

P2.8 removes unapproved factual fallback content from production-facing catalog and SEO surfaces before final go-live. Production must never invent a location, address, unit area, price, availability, or other business fact merely because the production database is empty or temporarily unreadable.

This phase is intentionally safe and reversible. It changes presentation/read-model behavior only.

## 2. Fixed decisions

- No database migration.
- No production data seed or mutation.
- No `nupsbox.vn` DNS, canonical, or HTTPS cutover.
- No auth/RBAC/RLS changes.
- CI/development may keep deterministic catalog fixtures when the configured Supabase URL is absent or the documented `example.supabase.co` CI placeholder.
- A real Supabase environment must use only published database rows. Empty/error reads return empty/null safe states rather than fixture business facts.
- Existing public lead and Light Booking behavior remains intact.
- Dynamic catalog detail routes return 404 when no published matching row exists.
- Sitemap must not advertise dynamic catalog URLs that do not exist in the real published catalog.
- Structured data must not emit a postal address unless a real published location exists.

## 3. Current risk

`features/catalog/public-catalog.ts` currently falls back to hard-coded catalog fixtures not only in CI/dev but also when a real Supabase query returns no rows or throws.

That means an empty production database can publish:

- a Tân Phú location identity;
- a specific street address;
- unit names and areas;
- derived dynamic catalog URLs;
- LocalBusiness structured data containing the fallback address.

The production approval sheet explicitly marks those business facts as pending approval.

## 4. In scope

- Separate fixture-mode behavior from real-environment behavior.
- Return `[]` / `null` for empty or failed real catalog reads.
- Make the locale layout structured data address-safe.
- Make homepage/location pages render truthful no-catalog states.
- Keep catalog detail pages truthful via existing `notFound()` behavior.
- Keep sitemap dynamic entries aligned with actual published data.
- Add unit tests for catalog mode and structured-data behavior.
- Update production readiness documentation after verification.

## 5. Out of scope

- Creating locations, unit types, pricing, FAQs, blog posts, or site settings in production.
- Approving any business address, phone, Zalo, price, availability, unit dimensions, or policy statement.
- Production environment-variable changes.
- Supabase Auth callback changes.
- Domain/DNS work.
- Payment, reservation, inventory locking, calendar sync, messaging, or portal work.

## 6. Catalog mode contract

### Fixture mode

Fixture mode is allowed only when `NEXT_PUBLIC_SUPABASE_URL` is absent or uses the explicit CI placeholder host `example.supabase.co`.

Fixture mode keeps deterministic content needed for local development and CI rendering tests.

### Real-data mode

Any other valid Supabase URL is real-data mode.

In real-data mode:

- `getMarketingUnits()`: database rows or `[]`;
- `getMarketingUnitBySlug()`: database row or `null`;
- `getMarketingFeaturedLocation()`: database row or `null`;
- `getMarketingLocationBySlug()`: database row or `null`;
- query errors degrade to the same empty/null result and do not activate fixtures.

## 7. Public rendering rules

### Global structured data

When a published location exists, emit `LocalBusiness` with its database-backed address.

When no published location exists, emit an `Organization` entity with only safe brand/contact fields that are actually available. No postal address is emitted.

### Homepage

If there is no published featured location, omit the location card/section. The rest of the public funnel remains available.

### Locations index

If there is no published location, show a truthful empty state explaining that no location details are currently published and direct the visitor to contact/request information. Do not invent a facility card.

### Dynamic location/unit routes

Existing `notFound()` behavior remains authoritative when a slug has no published row.

### Sitemap

Only include dynamic unit/location routes derived from currently returned catalog rows.

## 8. Acceptance gates

Exact branch head must pass:

- `npm run lint`
- `npm run typecheck`
- `npm run test:run`
- `npm run build`
- P2.5 public Playwright E2E
- Database Tests / pgTAP / RLS

Vercel Preview is desirable but an external Hobby build-rate-limit may remain a documented infrastructure blocker. A code build failure is not acceptable.
