# P3.3 Facility Media Integrity

Date: 2026-09-18  
Base: `main@40cf871ea83bc8fc26fef18bc418cd3f2d655d93`

## Goal

Prevent facility imagery from being attributed to the wrong published location.

## Rules

- Facility media must be mapped explicitly by `location.slug`.
- The existing Tan Phu corridor asset is scoped only to `tan-phu`.
- A published location without a mapped asset keeps its real text facts but receives a neutral visual.
- An unpublished location never receives facility imagery.
- Homepage Hero, homepage proof bento and About gallery use the same media registry.

## Guardrails

- No database migration or production write.
- No new facility fact, address, feature, price or availability claim.
- No assumption that a generic published location is Tan Phu.
- Existing CRM, auth, SEO routes and conversion flows remain unchanged.
