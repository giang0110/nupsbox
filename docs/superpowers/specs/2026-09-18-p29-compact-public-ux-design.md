# P2.9 Compact Public UX — Design Specification

Date: 2026-09-18  
Repository: `giang0110/nupsbox`  
Base: `main@d1f7d1e0c3962aef848214b4d98e41261e7cf135`  
Phase: P2.9  
Status: Approved for implementation by user instruction

## Purpose

Reduce homepage scroll depth without deleting important information. The design should feel modern, compact and conversion-oriented while preserving truthful business facts, SEO routes, accessibility, CRM lead flow and existing data contracts.

## Fixed decisions

- No database migration or production data mutation.
- No auth/RBAC/RLS changes.
- No payment, reservation, inventory, calendar or messaging expansion.
- Preserve all current public routes and CTA intents.
- Preserve bilingual VI/EN content.
- Preserve truthful production-fact behavior introduced in P2.8.
- Do not hide critical conversion actions behind hover-only interactions.
- Use progressive disclosure: tabs, details/accordion and compact bento layouts.
- Mobile must remain touch-friendly and readable.

## Homepage information architecture

The homepage is reduced from roughly twelve full-height sections to six primary blocks:

1. Hero
2. Choice Hub: Storage Finder + featured units + use cases in accessible tabs
3. Why NupsBox: facility imagery + security + flexibility + compact cost comparison in a bento layout
4. Location & Journey: location card + three steps + clarity/trust strip
5. FAQ: five questions in accordion
6. Compact final CTA

## Acceptance criteria

- All pre-existing homepage information remains available either directly, in a tab/details disclosure, or through the existing linked detail route.
- Initial desktop viewport flow is visibly shorter.
- Only one Choice Hub tab is visible at a time.
- Tabs use ARIA roles/relationships and keyboard-safe buttons.
- Cost comparison details are collapsed by default but fully available.
- Location remains omitted when no published location exists.
- FAQ remains limited to five homepage items with full FAQ route preserved.
- No business fact is invented.

## Verification

Exact branch head must pass lint, typecheck, unit/integration tests, build, P2.5 E2E, Database Tests and Preview smoke when Vercel permits.
