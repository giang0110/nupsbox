# P2.9 Compact Public UX — Implementation Plan

## Task 1 — Choice Hub tabs

Create `components/marketing/home-choice-hub.tsx`.

- Tabs: Finder / Unit types / Use cases.
- Render all tab panels in DOM; hide inactive panels with `hidden`.
- Reuse StorageFinder and UnitCard.
- Preserve links to the four existing solution pages.
- Add focused unit tests for tab switching and ARIA state.

## Task 2 — Why NupsBox bento

Create `components/marketing/home-proof-bento.tsx`.

- Reuse the real facility image.
- Present security/flexibility as compact cards.
- Put the full three-row cost comparison inside `details`.
- Preserve wording that avoids unsupported savings claims.

## Task 3 — Location & journey consolidation

Create `components/marketing/home-location-journey.tsx`.

- Keep location nullable.
- Keep the existing LocationCard when available.
- Place the three journey steps beside it.
- Add three compact clarity/trust points below.

## Task 4 — Homepage composition and density

Modify `app/[locale]/page.tsx`.

- Remove separate UseCases, Gallery, SecurityBenefits, CostComparison, HowItWorks and SocialProof sections.
- Use the new consolidated components.
- Keep FAQ and Final CTA.
- Keep Storage Finder anchor reachable.

Modify `components/marketing/home-faq.tsx` and `components/marketing/final-cta.tsx` to use more compact spacing.

## Task 5 — Verification

- lint
- typecheck
- unit/integration tests
- build
- P2.5 E2E
- Database Tests
- Vercel Preview smoke

Open PR to `main` and merge only after exact-head gates are green.
