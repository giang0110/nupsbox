# P3.2 Accessibility & SEO Polish

Date: 2026-09-18  
Base: `main@9c1deb32470928b622db978699c5456930286c8e`

## Goal

Improve keyboard accessibility, assistive-technology navigation and search/social metadata without changing application data or business behavior.

## Scope

- Add a localized skip-to-content link and focusable content target.
- Localize public navigation accessibility labels.
- Expose form submission busy state with `aria-busy`.
- Add Twitter summary metadata to the shared localized metadata helper.
- Add route-specific metadata to major public landing pages.
- Preserve canonical and hreflang generation through the existing SEO route manifest.

## Guardrails

- No database migration or production write.
- No auth/RBAC/RLS change.
- No change to CRM payloads or conversion intent.
- No invented business facts, prices, locations or facility features.
- No social image claim until an approved reusable asset exists.

## Routes receiving specific metadata

- /kho-mini
- /bang-gia
- /dia-diem
- /giai-phap
- /cach-thue
- /ve-nupsbox
- /cau-hoi-thuong-gap
- /lien-he

English alternates continue to use the route manifest.

## Acceptance

- Keyboard users can focus a skip link and land at `#main-content`.
- Mobile menu and primary navigation labels are localized.
- Lead form exposes busy state while submitting.
- Localized metadata includes Open Graph, Twitter summary, canonical and hreflang.
- Listed public pages export `generateMetadata` via `createStaticPageMetadata`.
- Exact-head lint, typecheck, unit/integration tests, build, E2E, Preview smoke and Database Tests pass.
