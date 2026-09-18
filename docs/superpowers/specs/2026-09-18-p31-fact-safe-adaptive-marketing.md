# P3.1 Fact-Safe Adaptive Marketing

Date: 2026-09-18  
Base: `main@291da246f115da32f2b8f9de14687732ae2fa40e`

## Goal

Keep the compact P2.9/P3.0 homepage while ensuring facility-specific marketing claims are derived only from published catalog data.

## Guardrails

- No database migration or production write.
- No auth/RBAC/RLS change.
- No new facility-feature fields.
- No hard-coded location name, unit area, CCTV, keypad, price, availability or address claims on the homepage.
- The existing facility image may render only when a published location exists.
- When catalog/location data is absent, render a polished neutral state rather than invented facts.
- Preserve existing CTA intents, routes, SEO metadata, bilingual content and P2.8 empty-state behavior.

## Acceptance

- Hero receives `location` and published units.
- Hero location overlay uses database-backed `location.name` and area values only when available.
- Hero neutral state contains no facility-specific fact.
- Proof bento derives location/unit facts from props and otherwise uses system/process claims.
- CCTV/Keypad hard-coded claims are removed.
- Existing compact six-block homepage composition remains.
- Exact-head lint, typecheck, unit/integration tests, build, E2E and Database Tests pass.
