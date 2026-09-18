# P3.0 Performance, Resilience & Observability — Implementation Plan

## Task 1 — Split inactive Choice Hub panels

Files:
- Create `components/marketing/home-unit-options-panel.tsx`
- Create `components/marketing/home-use-cases-panel.tsx`
- Modify `components/marketing/home-choice-hub.tsx`
- Update `tests/unit/home-choice-hub.test.tsx`

Steps:
- Move unit-card panel out of the main client component.
- Move use-case panel out of the main client component.
- Load both with `next/dynamic`.
- Render lazy content only for the active tab.
- Keep Finder as initial content.
- Keep tab panel IDs and keyboard navigation.

## Task 2 — Add field Core Web Vitals telemetry

Files:
- Create `features/analytics/web-vitals.ts`
- Create `components/analytics/web-vitals-reporter.tsx`
- Create `app/api/telemetry/web-vitals/route.ts`
- Modify `app/[locale]/layout.tsx`
- Add `tests/unit/web-vitals.test.ts`

Steps:
- Normalize safe metric payloads.
- Sample client reporting at 25%.
- Send with `sendBeacon` and fetch fallback.
- Require same-origin POST.
- Log normalized metrics only.
- Keep telemetry best-effort and non-blocking.

## Task 3 — Add route loading/error boundaries

Files:
- Create `app/[locale]/loading.tsx`
- Create `app/[locale]/error.tsx`
- Create `app/admin/loading.tsx`
- Create `app/admin/error.tsx`
- Add focused source/render tests.

Steps:
- Add intentional skeleton/loading surfaces.
- Add reset buttons.
- Never show raw error messages.
- Preserve existing layouts and auth behavior.

## Task 4 — Verification

- lint
- typecheck
- unit/integration tests
- build
- P2.5 E2E
- Database Tests
- Preview smoke when available

Open PR to `main` and merge only after exact-head code gates pass.
