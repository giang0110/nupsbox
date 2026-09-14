# NupsBox Phase 1 Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the remaining Phase 1 acceptance gaps: usable authenticated admin surfaces, complete homepage composition, technical SEO, and production-readiness verification.

**Architecture:** Keep the existing Next.js App Router + typed `next-intl` routes + Supabase/RLS architecture. Admin pages are server-rendered and read through the authenticated Supabase server client; mutations are narrow server actions guarded by `requireAdminUser()` plus `can()`, with RLS remaining the final authorization layer. SEO is generated from route/catalog data without inventing reviews, ratings, availability, or customer claims.

**Tech Stack:** Next.js 16.3.3, React 19.3, TypeScript 5.9, next-intl 4.14.4, Supabase SSR/JS, Tailwind CSS 4.3, Vitest 5, Playwright 1.63.

**Spec:** `docs/superpowers/specs/2026-09-14-nupsbox-website-design.md`

## Global Constraints

- Canonical production origin: `https://nupsbox.vn`.
- Vietnamese default; English under `/en` with localized pathnames.
- Lead-first Phase 1; `/dat-kho` remains preparation-only and non-indexed.
- RLS is authoritative; never expose service-role credentials to the browser.
- Never fabricate ratings, reviews, customer logos, live stock counts, or guaranteed availability.
- Keep Node at `24.21.0` in CI and package engine compatible with Node 24.
- Every production behavior change must be preceded by a failing automated check or an already-failing reproducible quality gate.

---

### Task 1: Admin dashboard and navigation

**Files:**
- Create: `app/admin/page.tsx`
- Create: `components/admin/admin-nav.tsx`
- Create: `features/admin/dashboard.ts`
- Modify: `app/admin/layout.tsx`
- Test: `tests/unit/admin-dashboard.test.ts`

**Interfaces:**
- Consumes: `requireAdminUser(): Promise<AdminSession>` and `can(role, action): boolean`.
- Produces: `getAdminDashboardSummary()` returning counts for leads, active locations, active unit types, FAQs and published blog posts.

- [ ] **Step 1: Write the failing dashboard summary test** that verifies the summary adapter maps nullable Supabase counts to zero and preserves numeric counts.
- [ ] **Step 2: Run `npm run test:run -- tests/unit/admin-dashboard.test.ts`** and confirm RED because the admin dashboard helper does not exist.
- [ ] **Step 3: Implement `features/admin/dashboard.ts`** with a server-only function that performs five `select('*', {count:'exact', head:true})` queries, applying `status='active'`, `active=true`, and `status='published'` filters where relevant.
- [ ] **Step 4: Implement `app/admin/page.tsx` and `components/admin/admin-nav.tsx`** to show role-aware navigation and summary cards; do not render links the current role cannot use.
- [ ] **Step 5: Run targeted tests, lint, typecheck and build; commit `feat: add admin dashboard foundation`.**

### Task 2: Admin leads workspace

**Files:**
- Create: `app/admin/leads/page.tsx`
- Create: `app/admin/leads/actions.ts`
- Create: `components/admin/lead-status-form.tsx`
- Create: `features/admin/leads.ts`
- Test: `tests/unit/admin-leads.test.ts`

**Interfaces:**
- Produces: `listAdminLeads({status, limit})`, `updateLeadStatus(leadId, nextStatus)` and a serializable lead-row model.
- Authorization: `leads:read` for list; `leads:update` for mutation.

- [ ] **Step 1: Write failing tests** for lead-status input validation and permission denial.
- [ ] **Step 2: Verify RED** with the targeted Vitest command.
- [ ] **Step 3: Implement query/validation helpers** using the authenticated server client; limit list results to 100, order newest first, and only accept defined `lead_status` values.
- [ ] **Step 4: Implement the server action** to validate UUID/status, verify `can(session.role,'leads:update')`, update the lead, insert a status-history row, and `revalidatePath('/admin/leads')`.
- [ ] **Step 5: Implement the page/form UI**, then run targeted tests + lint + typecheck + build; commit `feat: add admin lead workspace`.

### Task 3: Admin catalog workspace

**Files:**
- Create: `app/admin/catalog/page.tsx`
- Create: `features/admin/catalog.ts`
- Create: `components/admin/catalog-tables.tsx`
- Test: `tests/unit/admin-catalog.test.ts`

**Interfaces:**
- Produces read models for locations, unit types, and location-unit pricing/status rows.
- Authorization: `catalog:read` for the workspace; mutations are deferred until the read model is verified against the live Supabase schema.

- [ ] **Step 1: Write failing tests** for price/status formatting and public-safe availability labels.
- [ ] **Step 2: Verify RED**.
- [ ] **Step 3: Implement server-side list queries** for locations, unit types, and location pricing/availability with deterministic ordering.
- [ ] **Step 4: Render three admin tables** with clear links/identifiers and no claim of real-time inventory.
- [ ] **Step 5: Verify all quality gates; commit `feat: add admin catalog workspace`.**

### Task 4: Admin content workspace

**Files:**
- Create: `app/admin/content/page.tsx`
- Create: `features/admin/content.ts`
- Test: `tests/unit/admin-content.test.ts`

**Interfaces:**
- Produces FAQ/media/site-setting summary rows.
- Authorization: `content:read`; settings visibility also checks `settings:read`.

- [ ] **Step 1: Write failing tests** for FAQ locale projection and media alt-text completeness detection.
- [ ] **Step 2: Verify RED**.
- [ ] **Step 3: Implement authenticated queries** for FAQ, media metadata and public site settings.
- [ ] **Step 4: Render a content QA workspace** that surfaces missing VI/EN alt text and inactive FAQ state; no destructive mutations in this task.
- [ ] **Step 5: Verify and commit `feat: add admin content workspace`.**

### Task 5: Complete homepage composition

**Files:**
- Create: `components/marketing/featured-units.tsx`
- Create: `components/marketing/home-faq.tsx`
- Create: `components/marketing/social-proof.tsx`
- Modify: `app/[locale]/page.tsx`
- Modify: `features/catalog/public-catalog.ts`
- Test: `tests/unit/home-content.test.ts`

**Interfaces:**
- `FeaturedUnits` consumes the existing marketing-unit model.
- `HomeFaq` consumes active FAQ rows from Supabase or a safe empty state.
- `SocialProof` contains only verifiable operational propositions (secure access, flexible size, business-friendly location), never ratings/reviews unless real data exists.

- [ ] **Step 1: Write failing tests** proving featured units sort by `featured` then `sortOrder`, and FAQ projection returns only active rows.
- [ ] **Step 2: Verify RED**.
- [ ] **Step 3: Add catalog/FAQ read helpers** and UI components.
- [ ] **Step 4: Reorder the homepage to match the approved spec**, keeping the featured location before How It Works and adding FAQ before Final CTA.
- [ ] **Step 5: Verify and commit `feat: complete homepage phase1 sections`.**

### Task 6: Technical SEO

**Files:**
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`
- Create: `components/seo/json-ld.tsx`
- Create: `features/seo/routes.ts`
- Modify: `app/[locale]/layout.tsx`
- Modify: key public page metadata where needed
- Test: `tests/unit/seo-routes.test.ts`

**Interfaces:**
- Produces an indexable route manifest with VI/EN URL pairs, excluding `/admin`, `/auth`, API routes and `/dat-kho` from sitemap indexing.

- [ ] **Step 1: Write failing route-manifest tests** for canonical VI URL, `/en` alternate URL, exclusion of admin/auth/booking-prep, and dynamic unit/location URLs.
- [ ] **Step 2: Verify RED**.
- [ ] **Step 3: Implement `features/seo/routes.ts`, sitemap and robots** using `https://nupsbox.vn` and catalog data where available.
- [ ] **Step 4: Add locale-aware `alternates.languages` metadata and Organization/LocalBusiness JSON-LD** without aggregateRating/review fields.
- [ ] **Step 5: Verify and commit `feat: add technical seo foundation`.**

### Task 7: CI and production preflight

**Files:**
- Modify if needed: `.github/workflows/ci.yml`
- Create: `docs/production-checklist.md`

**Interfaces:**
- Quality gate remains `npm ci -> lint -> typecheck -> test:run -> build`.
- Database deployment is never performed before inspecting the actual Supabase project and migration history.

- [ ] **Step 1: Confirm the latest PR workflow is green** on the exact head SHA.
- [ ] **Step 2: Inspect connected Supabase project(s) read-only**, compare remote migration history/schema with the four local Phase 1 migrations, and document blockers rather than forcing a push.
- [ ] **Step 3: Inspect Vercel project/domain state** and confirm `nupsbox.vn` configuration before production deployment.
- [ ] **Step 4: Add `docs/production-checklist.md`** with required environment variables, migration order, auth redirect URLs, DNS/domain checks and rollback points.
- [ ] **Step 5: Only after all preflight gates pass, merge/deploy using the user's connected infrastructure.**

## Self-review

- Spec coverage: public routes already exist; this plan closes admin, homepage composition, SEO and deployment-preflight gaps while preserving the existing lead, Storage Finder and RLS implementation.
- No booking/live-availability claims are introduced.
- No destructive database action is planned before a read-only production preflight.
- Admin write operations begin only with lead status because its audit/history model already exists; broader catalog/content mutation will follow only after the read models are verified against the live database.
