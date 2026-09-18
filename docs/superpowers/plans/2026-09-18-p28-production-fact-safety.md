# P2.8 Production Fact Safety & Launch Readiness — Implementation Plan

**Goal:** Prevent unapproved hard-coded catalog facts from being published in real production environments while preserving deterministic CI/dev fixtures.

**Base:** `5a56bb866b9b0daf91b82a223fdea2ac8d6a3df4`

## Global constraints

- No schema migration.
- No production write.
- No domain cutover.
- Preserve public lead/Light Booking paths.
- Preserve fixture content only for missing/example Supabase URL.
- Treat real Supabase empty/error reads as empty/null.
- Never replace missing business facts with invented alternatives.

## Task 1 — Catalog mode policy

Files:
- Create `features/catalog/public-catalog-mode.ts`
- Test `tests/unit/public-catalog-mode.test.ts`

Steps:
- Add a pure helper that recognizes fixture mode only for absent URL or `example.supabase.co`.
- Test missing/example versus real project URLs.

## Task 2 — Real-data-safe catalog facade

Files:
- Modify `features/catalog/public-catalog.ts`

Steps:
- Use the mode helper.
- Keep fixtures in fixture mode.
- In real-data mode return database rows only.
- Empty list remains empty.
- Query errors return `[]` / `null`; never fall through to fixtures.
- Change featured-location return type to `PublicLocation | null`.

## Task 3 — Safe structured data and public empty states

Files:
- Create `features/seo/business-entity.ts`
- Modify `app/[locale]/layout.tsx`
- Modify `app/[locale]/page.tsx`
- Modify `app/[locale]/dia-diem/page.tsx`
- Verify `app/sitemap.ts`
- Test `tests/unit/business-entity.test.ts`

Steps:
- Build LocalBusiness only from a published location.
- Build Organization without address when location is absent.
- Omit homepage location section when no location exists.
- Render a truthful locations empty state instead of a fabricated card.
- Keep detail routes on `notFound()` for missing rows.

## Task 4 — Verification and docs

Files:
- Modify `docs/production-checklist.md`
- Modify `docs/production-business-data-input.md`

Steps:
- Run exact-head quality gates.
- Confirm P2.5 E2E and Database Tests.
- Record that hard-coded production fallback facts were removed.
- Do not mark production seed/domain/auth configuration as complete.

## Merge gate

Open a PR from `codex/p28-production-fact-safety` to `main`. Merge only after exact-head code/build/tests are green; document external Vercel quota separately if it blocks Preview.
