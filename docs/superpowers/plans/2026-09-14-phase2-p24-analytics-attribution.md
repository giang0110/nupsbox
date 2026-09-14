# NupsBox Phase 2 P2.4 — Attribution & Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize privacy-safe public conversion events, conditionally enable GA4/Meta, preserve Phase 1 tracking semantics during migration, and add an internal attribution dashboard derived from the existing leads table.

**Architecture:** Keep `features/analytics/events.ts` as the single client analytics adapter. Replace the loose event/payload contract with a typed canonical event map, runtime PII-key guard, and narrow legacy aliases only where semantics match exactly. Load provider scripts only when environment IDs are configured. Admin attribution reads the existing CRM attribution fields; no second analytics database is introduced.

**Tech Stack:** Next.js 16.3.3, React 19.3, TypeScript 5.9, next/script, Supabase/PostgreSQL, Vitest 5, Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-14-phase2-conversion-operations-design.md`

## Global Constraints

- P2.1–P2.3 must be green before P2.4.
- Canonical events are exactly: `storage_finder_used`, `unit_viewed`, `location_viewed`, `contact_clicked`, `phone_clicked`, `zalo_clicked`, `lead_started`, `lead_submitted`, `lead_submit_failed`.
- Analytics payloads must never contain full name, phone, email, free-form lead message, auth IDs, tokens or secrets.
- GA4 and Meta Pixel are optional. Missing IDs must not break render, tests, build or lead submission.
- Preserve semantic meaning when migrating Phase 1 events. Do not map an old event to an unrelated canonical event merely to avoid deletion.
- Attribution summaries come from `leads.source`, UTM fields, landing page, status and created time.
- No client-side CRM data export for analytics.
- No third analytics vendor or warehouse is added in Phase 2.

---

### Task 1: Make analytics environment configuration optional and explicit

**Files:**
- Modify: `.env.example`
- Modify: `lib/env.ts`
- Modify: `tests/unit/env.test.ts`

**Interfaces:**
- Produces optional public configuration values:

```ts
NEXT_PUBLIC_GA4_ID?: string;
NEXT_PUBLIC_META_PIXEL_ID?: string;
```

- [ ] **Step 1: Add failing env tests**

Cover:

```ts
expect(readPublicEnv({required Supabase vars, no analytics ids})).toSucceed();
expect(readPublicEnv({NEXT_PUBLIC_GA4_ID: ''}).analytics.ga4Id).toBeUndefined();
expect(readPublicEnv({NEXT_PUBLIC_META_PIXEL_ID: ''}).analytics.metaPixelId).toBeUndefined();
```

Use the existing env parser shape rather than creating a second environment module.

- [ ] **Step 2: Verify RED**

```bash
npm run test:run -- tests/unit/env.test.ts
```

- [ ] **Step 3: Extend `lib/env.ts` with optional analytics IDs**

Trim empty values to `undefined`. Do not validate or expose any server-only secret through this public config path.

- [ ] **Step 4: Update `.env.example`**

Document optional placeholders only:

```text
NEXT_PUBLIC_GA4_ID=
NEXT_PUBLIC_META_PIXEL_ID=
```

- [ ] **Step 5: Verify and commit**

```bash
npm run test:run -- tests/unit/env.test.ts
npm run typecheck
git add .env.example lib/env.ts tests/unit/env.test.ts
git commit -m "feat: add optional analytics configuration"
```

---

### Task 2: Replace the loose analytics event contract with typed canonical events

**Files:**
- Modify: `features/analytics/events.ts`
- Create: `tests/unit/analytics-events.test.ts`

**Interfaces:**
- Produces a typed event payload map, for example:

```ts
export type AnalyticsEventPayloads = {
  storage_finder_used: {locale: 'vi' | 'en'; stage?: 'start' | 'complete'; pagePath?: string};
  unit_viewed: {locale: 'vi' | 'en'; unitSlug: string; locationSlug?: string};
  location_viewed: {locale: 'vi' | 'en'; locationSlug: string};
  contact_clicked: {locale: 'vi' | 'en'; channel?: 'form' | 'generic'; pagePath?: string};
  phone_clicked: {locale: 'vi' | 'en'; pagePath?: string};
  zalo_clicked: {locale: 'vi' | 'en'; pagePath?: string};
  lead_started: {locale: 'vi' | 'en'; pagePath?: string; source?: string};
  lead_submitted: {locale: 'vi' | 'en'; pagePath?: string; source?: string};
  lead_submit_failed: {locale: 'vi' | 'en'; pagePath?: string; reason: 'validation' | 'rate_limited' | 'server' | 'network'};
};

export function trackEvent<K extends keyof AnalyticsEventPayloads>(
  event: K,
  payload: AnalyticsEventPayloads[K]
): void;
```

- [ ] **Step 1: Write failing canonical-event tests**

Assert the adapter pushes `{event: canonicalName, ...payload}` to `window.dataLayer` and is a no-op server-side.

- [ ] **Step 2: Add failing PII guard tests**

The runtime adapter must reject or strip forbidden keys recursively at least for:

```text
name
fullName
full_name
phone
email
message
password
token
secret
serviceRoleKey
```

Preferred behavior: throw in test/development and omit the event in production rather than sending a partial payload that could hide a developer mistake.

- [ ] **Step 3: Verify RED**

```bash
npm run test:run -- tests/unit/analytics-events.test.ts
```

- [ ] **Step 4: Implement the typed canonical adapter and guard**

Keep provider independence: `trackEvent()` writes to one normalized queue/dataLayer contract; provider components consume that contract.

- [ ] **Step 5: Add exact semantic legacy aliases only**

During migration support these deprecated aliases internally:

```text
click_zalo   → zalo_clicked
click_phone  → phone_clicked
lead_submit  → lead_submitted
view_unit    → unit_viewed
view_location→ location_viewed
```

For `storage_finder_start` and `storage_finder_complete`, callers should migrate to `storage_finder_used` with `stage`. Do not preserve them as permanent public event names.

Do **not** map `view_pricing` to `contact_clicked`; those events are semantically different. Convert/remove the actual call site after inspection in Task 4.

- [ ] **Step 6: Verify and commit**

```bash
npm run test:run -- tests/unit/analytics-events.test.ts
npm run lint
npm run typecheck
git add features/analytics/events.ts tests/unit/analytics-events.test.ts
git commit -m "feat: standardize privacy safe analytics events"
```

---

### Task 3: Add conditional GA4 and Meta providers

**Files:**
- Create: `components/analytics/analytics-providers.tsx`
- Modify: `app/[locale]/layout.tsx`
- Create: `tests/unit/analytics-providers.test.tsx`

**Interfaces:**
- Produces `<AnalyticsProviders ga4Id? metaPixelId? />` that renders no analytics scripts when IDs are absent.

- [ ] **Step 1: Write failing render tests**

Cover:

```text
no IDs → no GA4 script and no Meta script
GA4 only → GA4 scripts only
Meta only → Meta script only
both → both provider initializers
```

- [ ] **Step 2: Verify RED**

```bash
npm run test:run -- tests/unit/analytics-providers.test.tsx
```

- [ ] **Step 3: Implement GA4 loading**

Use Next.js `Script` with the configured measurement ID. Initialize a dataLayer-compatible queue without embedding lead PII.

- [ ] **Step 4: Implement Meta Pixel loading**

Use the configured public pixel ID. Do not enable advanced matching with user email/phone in Phase 2.

- [ ] **Step 5: Mount once in locale layout**

Read the already-parsed public env once and render the provider near the root. Do not duplicate scripts per page/component.

- [ ] **Step 6: Verify and commit**

```bash
npm run test:run -- tests/unit/analytics-providers.test.tsx
npm run lint
npm run typecheck
git add components/analytics/analytics-providers.tsx app/[locale]/layout.tsx tests/unit/analytics-providers.test.tsx
git commit -m "feat: add conditional analytics providers"
```

---

### Task 4: Migrate every public analytics call site to the canonical vocabulary

**Files:**
- Modify as found by search, expected baseline:
  - `components/storage-finder/storage-finder.tsx`
  - `components/storage-finder/storage-result.tsx`
  - `components/forms/lead-form.tsx`
  - `components/marketing/mobile-action-bar.tsx`
  - `components/units/unit-card.tsx`
  - `components/locations/location-card.tsx`
- Modify/create targeted component tests as needed.

**Interfaces:**
- Every public interaction emits only canonical event names and allowlisted context.

- [ ] **Step 1: Inventory actual call sites before editing**

```bash
rg -n "trackEvent\(" app components features
```

Record every result in the task notes. Do not rely only on the expected file list above.

- [ ] **Step 2: Add/adjust failing tests at the highest-value call sites**

At minimum cover:

```text
Storage Finder complete → storage_finder_used {stage:'complete'}
unit link/detail view → unit_viewed
location link/detail view → location_viewed
phone CTA → phone_clicked
Zalo CTA → zalo_clicked
first lead-form engagement → lead_started only once per form mount/session
successful lead API response → lead_submitted
validation/rate-limit/server/network failure → lead_submit_failed with categorical reason only
```

- [ ] **Step 3: Verify RED**.

- [ ] **Step 4: Replace old event names**

Use canonical payload fields only. Do not pass form values, phone, email, name or message.

For any existing `view_pricing` call site, inspect the user action:

- if it is only page-view telemetry, remove it in Phase 2 because `view_pricing` is not an approved canonical event;
- if the user actually clicks a contact CTA from pricing, emit `contact_clicked` at the CTA interaction instead.

- [ ] **Step 5: Confirm no old names remain in call sites**

```bash
rg -n "click_zalo|click_phone|lead_submit|storage_finder_start|storage_finder_complete|view_unit|view_location|view_pricing" app components features
```

Expected: only explicit compatibility definitions/tests in `features/analytics/events.ts` may match exact legacy names.

- [ ] **Step 6: Verify and commit**

```bash
npm run test:run
npm run lint
npm run typecheck
git add app components features tests
git commit -m "refactor: migrate public analytics events"
```

---

### Task 5: Add the admin attribution read model

**Files:**
- Create: `features/admin/attribution.ts`
- Create: `tests/unit/admin-attribution.test.ts`

**Interfaces:**
- Produces:

```ts
export type AttributionRange = {from: string; to: string};
export type AttributionSummary = {
  totalLeads: number;
  bySource: Array<{key: string; count: number}>;
  byCampaign: Array<{key: string; count: number}>;
  byStatus: Array<{status: OperationalLeadStatus; count: number}>;
  byDay: Array<{date: string; count: number}>;
  topLandingPages: Array<{path: string; count: number}>;
};

export async function getAttributionSummary(range: AttributionRange): Promise<AttributionSummary>;
```

- [ ] **Step 1: Write failing pure projection/aggregation tests**

Use fixture rows to prove null/blank source becomes `direct_or_unknown`, campaigns are grouped deterministically, legacy status labels never appear, landing pages are normalized to paths, and all arrays sort deterministically by count then key.

- [ ] **Step 2: Verify RED**.

- [ ] **Step 3: Implement the read adapter**

Use the authenticated Supabase server client and explicit fields:

```text
created_at,status,source,utm_source,utm_campaign,landing_page
```

Require `leads:read` at the page boundary. Use a bounded default range (last 30 days) and reject ranges over 366 days to avoid accidental full-table scans.

Do not create a second analytics storage table.

- [ ] **Step 4: Verify and commit**

```bash
npm run test:run -- tests/unit/admin-attribution.test.ts
npm run typecheck
git add features/admin/attribution.ts tests/unit/admin-attribution.test.ts
git commit -m "feat: add lead attribution summaries"
```

---

### Task 6: Add the admin attribution dashboard

**Files:**
- Create: `app/admin/analytics/page.tsx`
- Create: `components/admin/attribution-summary.tsx`
- Modify: `components/admin/admin-nav.tsx`
- Create: `tests/unit/admin-attribution-ui.test.tsx`

**Interfaces:**
- `/admin/analytics` is readable by roles with `leads:read`; no new analytics permission is introduced.

- [ ] **Step 1: Write failing rendering tests** for empty state, source/campaign/status cards and bounded date-range input.

- [ ] **Step 2: Verify RED**.

- [ ] **Step 3: Implement page authorization and query parsing**

```text
requireAdminUser()
→ can(role, 'leads:read')
→ parse from/to or default 30 days
→ getAttributionSummary
```

- [ ] **Step 4: Render summaries without chart-library dependency**

Use existing UI primitives and accessible tables/cards/bars. Do not add a chart dependency solely for Phase 2.

- [ ] **Step 5: Verify and commit**

```bash
npm run test:run -- tests/unit/admin-attribution.test.ts tests/unit/admin-attribution-ui.test.tsx
npm run lint
npm run typecheck
git add app/admin/analytics components/admin/attribution-summary.tsx components/admin/admin-nav.tsx tests/unit/admin-attribution-ui.test.tsx
git commit -m "feat: add admin attribution dashboard"
```

---

### Task 7: P2.4 full privacy and regression verification

- [ ] **Step 1: Run application quality gate**

```bash
npm ci
npm run lint
npm run typecheck
npm run test:run
npm run build
```

- [ ] **Step 2: Run a source-level PII review**

```bash
rg -n "trackEvent\([^\n]*(phone|email|fullName|full_name|message|password|token|secret)" app components features tests
```

Expected: no production tracking call includes PII fields. Review multiline calls manually with:

```bash
rg -n "trackEvent\(" app components features
```

- [ ] **Step 3: Verify optional-provider behavior**

Build/test once with both analytics IDs unset. The public site and lead flow must still work.

- [ ] **Step 4: Verify no semantic legacy alias abuse**

Confirm `view_pricing` is not remapped to a contact conversion and old Storage Finder event names are removed from call sites.

**P2.4 exit criteria:** canonical event contract is typed and PII-guarded, provider scripts are optional, all public call sites use approved events, attribution dashboard reads existing lead data, and full build/tests are green.
