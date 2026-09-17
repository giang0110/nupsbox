# NupsBox P2.4 Production Go-live Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the current NupsBox production deployment verifiably go-live ready without adding unrelated product scope, fabricating business facts, or cutting over `nupsbox.vn` before a separate approval.

**Architecture:** Keep the application surface unchanged. Add a deterministic production-smoke harness that runs from a trusted Node/Playwright test runner, calls the real deployed `/api/leads` endpoint, verifies rows through a service-role Supabase client that never reaches the browser, and performs exact-ID + marker-guarded cleanup. Keep production business data and domain/DNS cutover as explicit gated runbooks rather than automatic side effects.

**Tech Stack:** Next.js 16.3.3, React 19.3, TypeScript 5.9, Zod 4.6, Supabase/Postgres, Vitest 5, Playwright 1.63, GitHub Actions, Vercel.

**Spec:** `docs/superpowers/specs/2026-09-17-p24-production-go-live-readiness-design.md`

## Global Constraints

- Do not add inventory reservation, payments, calendar synchronization, automated messaging, new CRM lifecycle states, or unrelated product modules.
- Do not fabricate prices, stock counts, ratings, reviews, customer logos, phone numbers, Zalo accounts, addresses, business hours, media facts, or marketing claims.
- Do not intentionally trigger production rate limiting; the production smoke submits only two valid API requests per run and must not auto-retry them.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser code, public logs, `NEXT_PUBLIC_*`, or committed files.
- Synthetic production rows must use a deterministic marker, verify exact IDs and marker ownership before deletion, and fail loudly if cleanup cannot be proven safe.
- No production DDL is expected. If schema change becomes necessary, stop and require a separate TDD/migration approval before applying it.
- `nupsbox.vn` remains behind a separate explicit domain/DNS cutover approval gate.
- Existing quality gates remain mandatory: `npm ci`, `npm run lint`, `npm run typecheck`, `npm run test:run`, `npm run build`, plus the full local Supabase pgTAP workflow.

## File Map

- Modify: `docs/production-checklist.md` — replace stale Phase 1 status with the post-P2.3 production truth and evidence slots.
- Create: `features/ops/production-smoke.ts` — pure deterministic marker/payload/cleanup-guard helpers; no secrets and no network calls.
- Create: `tests/unit/production-smoke.test.ts` — RED/GREEN tests for marker validation, future appointment generation, and cleanup ownership guards.
- Create: `playwright.production.config.ts` — production-only Playwright config with no local `webServer` and serial execution.
- Create: `tests/production/lead-booking.spec.ts` — trusted-runner production smoke for invalid input, lead-only, lead+appointment+history, atomic RPC rollback, and guarded cleanup.
- Modify: `package.json` — add `test:production-smoke` only; do not make it part of normal CI or `test:run`.
- Modify: `features/leads/repository.ts` — remove the stale comment that says migration `00400` is feature-branch-only; no behavior change.
- Create: `docs/production-business-data-input.md` — explicit approval sheet for factual production content.
- Create: `docs/nupsbox-vn-cutover-runbook.md` — final domain/canonical/HTTPS cutover procedure, with no guessed DNS values.

---

### Task 1: Refresh the production checklist baseline

**Files:**
- Modify: `docs/production-checklist.md`

**Interfaces:**
- Consumes: verified post-P2.3 facts from production (`main` merge commit, migration state, Vercel production alias, Auth/admin counts, business table counts).
- Produces: a current readiness document that later tasks append evidence to.

- [ ] **Step 1: Replace the stale header/status block**

Set `Last reviewed: 2026-09-17` and record these facts exactly:

```text
Production code baseline: main at f0f323818d73be30ce65ef994634c042e62596bb
P2.3 PR: #13 merged
Vercel production alias: https://nupsbox.vercel.app
Supabase project: veglohnmofzkgovedxkb
Latest applied feature migration: 20260915000400_phase2_light_booking_crm
Auth users: 1
Profiles: 1
Active admins: 1
Locations: 0
Unit types: 0
FAQs: 0
Blog posts: 0
Site settings: 0
Leads before P2.4 smoke: 0
Appointments before P2.4 smoke: 0
```

Do not claim `nupsbox.vn`, Vercel environment-variable presence, Auth Site URL/callback configuration, or business content as verified unless a tool/result explicitly proves them.

- [ ] **Step 2: Rewrite the go-live blockers section**

The remaining blockers must be phrased as:

```text
1. Safe production application-level lead/booking smoke and cleanup evidence.
2. Runtime/RLS/RPC verification after that smoke.
3. Approved factual production business content, or an explicit decision to launch with intentional null/contact fallbacks.
4. Vercel environment/domain verification without exposing secret values.
5. Separate approved nupsbox.vn DNS/HTTPS/canonical cutover.
6. Authenticated viewer/staff/admin runtime role E2E where test accounts/sessions are available; otherwise keep this sub-gate explicitly pending and rely only on local permission/RLS contracts.
```

- [ ] **Step 3: Verify the document change**

Run:

```bash
git diff --check -- docs/production-checklist.md
grep -F 'f0f323818d73be30ce65ef994634c042e62596bb' docs/production-checklist.md
grep -F '20260915000400_phase2_light_booking_crm' docs/production-checklist.md
grep -F 'Active admins: 1' docs/production-checklist.md
```

Expected: `git diff --check` exits 0 and every `grep` finds exactly the refreshed fact.

- [ ] **Step 4: Commit**

```bash
git add docs/production-checklist.md
git commit -m "docs: refresh production readiness baseline"
```

---

### Task 2: Add deterministic production-smoke guards with TDD

**Files:**
- Create: `features/ops/production-smoke.ts`
- Create: `tests/unit/production-smoke.test.ts`

**Interfaces:**
- Produces:
  - `buildProductionSmokeMarker(runId: string): string`
  - `buildProductionLeadPayload(marker: string): Record<string, unknown>`
  - `buildProductionAppointmentPayload(marker: string, now?: Date): Record<string, unknown>`
  - `assertLeadCleanupTarget(row, expectedId, marker): void`
  - `assertAppointmentCleanupTarget(row, expectedId, expectedLeadId, marker): void`
- Later Task 3 imports these helpers from `@/features/ops/production-smoke`.

- [ ] **Step 1: Write the failing unit tests**

Create `tests/unit/production-smoke.test.ts` with these cases:

```ts
import {describe, expect, it} from 'vitest';
import {
  assertAppointmentCleanupTarget,
  assertLeadCleanupTarget,
  buildProductionAppointmentPayload,
  buildProductionLeadPayload,
  buildProductionSmokeMarker
} from '@/features/ops/production-smoke';

describe('production smoke guards', () => {
  it('builds a deterministic marker from a safe run id', () => {
    expect(buildProductionSmokeMarker('20260917T040000Z')).toBe('p24-smoke:20260917T040000Z');
  });

  it('rejects unsafe run ids', () => {
    expect(() => buildProductionSmokeMarker('')).toThrow('invalid_production_smoke_run_id');
    expect(() => buildProductionSmokeMarker('../prod')).toThrow('invalid_production_smoke_run_id');
  });

  it('builds a clearly synthetic lead payload', () => {
    expect(buildProductionLeadPayload('p24-smoke:abc123')).toMatchObject({
      fullName: 'P2.4 Production Smoke',
      phone: '00000000',
      preferredLanguage: 'vi',
      source: 'p24_production_smoke',
      utmCampaign: 'p24-smoke:abc123'
    });
  });

  it('builds a future pending viewing request payload', () => {
    const payload = buildProductionAppointmentPayload(
      'p24-smoke:abc123',
      new Date('2026-09-17T04:00:00.000Z')
    );
    expect(payload).toEqual({
      scheduledAt: '2026-09-17T06:00:00.000Z',
      durationMinutes: 30,
      customerNote: 'p24-smoke:abc123'
    });
  });

  it('allows cleanup only for the exact marked lead', () => {
    expect(() => assertLeadCleanupTarget(
      {id: 'lead-1', utm_campaign: 'p24-smoke:abc123'},
      'lead-1',
      'p24-smoke:abc123'
    )).not.toThrow();
    expect(() => assertLeadCleanupTarget(
      {id: 'lead-1', utm_campaign: 'different'},
      'lead-1',
      'p24-smoke:abc123'
    )).toThrow('unsafe_production_smoke_cleanup');
  });

  it('allows appointment cleanup only for exact id, lead, and marker note', () => {
    expect(() => assertAppointmentCleanupTarget(
      {id: 'appt-1', lead_id: 'lead-1', customer_note: 'p24-smoke:abc123'},
      'appt-1',
      'lead-1',
      'p24-smoke:abc123'
    )).not.toThrow();
  });
});
```

- [ ] **Step 2: Run RED**

Run:

```bash
npm run test:run -- tests/unit/production-smoke.test.ts
```

Expected: FAIL because `@/features/ops/production-smoke` does not exist.

- [ ] **Step 3: Implement the minimal pure helper module**

Create `features/ops/production-smoke.ts` with no `server-only`, Supabase, fetch, filesystem, or environment reads:

```ts
type LeadCleanupRow = {id: string; utm_campaign: string | null};
type AppointmentCleanupRow = {
  id: string;
  lead_id: string;
  customer_note: string | null;
};

export function buildProductionSmokeMarker(runId: string) {
  if (!/^[A-Za-z0-9_-]{6,64}$/.test(runId)) {
    throw new Error('invalid_production_smoke_run_id');
  }
  return `p24-smoke:${runId}`;
}

export function buildProductionLeadPayload(marker: string) {
  return {
    fullName: 'P2.4 Production Smoke',
    phone: '00000000',
    preferredLanguage: 'vi',
    needType: 'other',
    estimatedVolume: 'unknown',
    message: marker,
    source: 'p24_production_smoke',
    utmCampaign: marker,
    landingPage: '/p24-production-smoke'
  };
}

export function buildProductionAppointmentPayload(marker: string, now = new Date()) {
  return {
    scheduledAt: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    durationMinutes: 30,
    customerNote: marker
  };
}

export function assertLeadCleanupTarget(
  row: LeadCleanupRow | null,
  expectedId: string,
  marker: string
) {
  if (!row || row.id !== expectedId || row.utm_campaign !== marker) {
    throw new Error('unsafe_production_smoke_cleanup');
  }
}

export function assertAppointmentCleanupTarget(
  row: AppointmentCleanupRow | null,
  expectedId: string,
  expectedLeadId: string,
  marker: string
) {
  if (
    !row ||
    row.id !== expectedId ||
    row.lead_id !== expectedLeadId ||
    row.customer_note !== marker
  ) {
    throw new Error('unsafe_production_smoke_cleanup');
  }
}
```

- [ ] **Step 4: Run GREEN**

Run:

```bash
npm run test:run -- tests/unit/production-smoke.test.ts
npm run typecheck
```

Expected: both exit 0.

- [ ] **Step 5: Commit**

```bash
git add features/ops/production-smoke.ts tests/unit/production-smoke.test.ts
git commit -m "test: add guarded production smoke helpers"
```

---

### Task 3: Add the trusted-runner production lead/booking smoke

**Files:**
- Create: `playwright.production.config.ts`
- Create: `tests/production/lead-booking.spec.ts`
- Modify: `package.json`
- Modify: `features/leads/repository.ts`

**Interfaces:**
- Consumes Task 2 helper functions.
- Environment contract:
  - `PRODUCTION_BASE_URL` — expected `https://nupsbox.vercel.app` before custom-domain cutover.
  - `PRODUCTION_SMOKE_RUN_ID` — safe identifier matching `[A-Za-z0-9_-]{6,64}`.
  - `SUPABASE_URL` — `https://veglohnmofzkgovedxkb.supabase.co`.
  - `SUPABASE_SERVICE_ROLE_KEY` — trusted runner only.
- Produces package command: `npm run test:production-smoke`.

- [ ] **Step 1: Add the production Playwright config**

Create `playwright.production.config.ts`:

```ts
import {defineConfig} from '@playwright/test';

const baseURL = process.env.PRODUCTION_BASE_URL;
if (!baseURL) throw new Error('Missing PRODUCTION_BASE_URL');

export default defineConfig({
  testDir: './tests/production',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  reporter: 'list',
  use: {baseURL}
});
```

No `webServer` is allowed in this config.

- [ ] **Step 2: Add the package script**

Add exactly:

```json
"test:production-smoke": "playwright test --config=playwright.production.config.ts"
```

Do not add this script to normal `CI`, `test:run`, or automatic `main` push workflows because it writes synthetic production rows and consumes two production rate-limit slots.

- [ ] **Step 3: Write the production smoke spec**

Create `tests/production/lead-booking.spec.ts`. The file must:

1. Import `createClient` from `@supabase/supabase-js` in the Node test runner only.
2. Fail immediately if `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, or `PRODUCTION_SMOKE_RUN_ID` is missing.
3. Build `marker = buildProductionSmokeMarker(PRODUCTION_SMOKE_RUN_ID)`.
4. Use `test.describe.serial`.
5. Track only IDs returned by this exact run.
6. Never print the service-role key.

Use these test cases in this order:

```ts
test('invalid public input returns 400 and creates no marked rows', async ({request}) => {
  const response = await request.post('/api/leads', {
    data: {
      ...buildProductionLeadPayload(marker),
      phone: 'bad-phone'
    }
  });
  expect(response.status()).toBe(400);
  const {count, error} = await supabase
    .from('leads')
    .select('id', {count: 'exact', head: true})
    .eq('utm_campaign', marker);
  expect(error).toBeNull();
  expect(count).toBe(0);
});
```

Lead-only test requirements:

```text
POST /api/leads with buildProductionLeadPayload(marker)
expect 201
expect JSON ok=true, leadId present, appointmentId=null
select that exact lead id
expect utm_campaign=marker and source=p24_production_smoke
store the returned leadId for guarded cleanup
```

Lead+appointment test requirements:

```text
POST /api/leads with a second synthetic lead payload whose utmCampaign is `${marker}:booking`
and appointment = buildProductionAppointmentPayload(`${marker}:booking`)
expect 201
expect leadId and appointmentId
verify exact appointment: lead_id matches, status=pending, source=customer, customer_note marker
verify exactly one `lead_appointment_history` row for that appointment with event_type=created
store exact IDs for guarded cleanup
```

For the second lead payload, override `phone` with `00000001` and use the booking marker in `message` and `utmCampaign` so cleanup ownership remains unambiguous.

Atomic RPC rollback test requirements:

```text
Call `submit_public_lead_request` directly through the trusted service-role client with marker `${marker}:atomic`.
Use a past `scheduledAt` (now minus one hour) so the database validation trigger rejects the appointment.
Expect the RPC to return an error.
Query leads with utm_campaign `${marker}:atomic` and expect count=0.
This proves the production RPC remains atomic without consuming a third HTTP rate-limit slot.
```

- [ ] **Step 4: Implement guarded cleanup in `afterAll`**

Cleanup order must be explicit to avoid the appointment-history `ON DELETE RESTRICT` edge:

```text
for each appointment created by this run:
  SELECT appointment by exact id
  assertAppointmentCleanupTarget(...)
  DELETE lead_appointment_history WHERE appointment_id = exact appointment id
  DELETE lead_appointments WHERE id = exact appointment id
for each lead created by this run:
  SELECT lead by exact id
  assertLeadCleanupTarget(...)
  DELETE leads WHERE id = exact lead id
finally query both run markers and assert zero remaining rows
```

If any ownership assertion fails, throw `unsafe_production_smoke_cleanup` and do not broaden the DELETE predicate.

- [ ] **Step 5: Remove the stale migration comment in `features/leads/repository.ts`**

Replace the obsolete comment:

```ts
// `types/database.ts` reflects the currently deployed production schema (00300).
// Migration 00400 stays feature-branch-only until the explicit production gate,
// so type this new RPC locally rather than pretending production already exposes it.
```

with:

```ts
// Keep the RPC result typed locally until the generated base database types are
// intentionally regenerated; production already exposes this P2.3 RPC.
```

No runtime behavior changes in this step.

- [ ] **Step 6: Verify without touching production**

Run only static/local gates here:

```bash
npm run lint
npm run typecheck
npm run test:run
npm run build
```

Expected: all exit 0. Do **not** run `npm run test:production-smoke` in this task.

- [ ] **Step 7: Commit**

```bash
git add playwright.production.config.ts tests/production/lead-booking.spec.ts package.json features/leads/repository.ts
git commit -m "test: add guarded production lead booking smoke"
```

---

### Task 4: Prepare factual business-data and domain cutover runbooks

**Files:**
- Create: `docs/production-business-data-input.md`
- Create: `docs/nupsbox-vn-cutover-runbook.md`

**Interfaces:**
- Produces explicit human approval inputs; does not write production business rows or DNS.

- [ ] **Step 1: Create the business-data approval sheet**

`docs/production-business-data-input.md` must contain a table with these rows and default status `PENDING APPROVAL`:

```text
Legal/public business name
Primary Tân Phú address
Phone
Zalo URL/account
Business hours
Unit type names VI/EN
Unit dimensions/area
Public price / pricing unit
Availability label
Availability count semantics
Real media asset + alt text
FAQ statements
Blog/company factual claims
```

For price, availability count, phone, Zalo, and business hours add the rule: `Leave database value null until explicitly approved.`

Record that current production counts for `locations`, `unit_types`, `faqs`, `blog_posts`, and `site_settings` were zero before P2.4 content work.

- [ ] **Step 2: Create the domain cutover runbook**

`docs/nupsbox-vn-cutover-runbook.md` must list this exact order:

```text
1. Confirm Vercel project team ntg2299 / project nupsbox.
2. Confirm production environment variable names/presence without printing secret values.
3. Add/verify nupsbox.vn in Vercel.
4. Decide primary host and www redirect behavior.
5. Copy DNS records only from Vercel's verified domain instructions; do not guess A/CNAME targets.
6. Confirm HTTPS certificate is issued.
7. Update NEXT_PUBLIC_SITE_URL/canonical origin only after domain verification.
8. Deploy/redeploy the exact approved main head if the environment change requires it.
9. Smoke public VI/EN routes, sitemap, robots, canonical, hreflang, JSON-LD, /dat-kho, /api/leads invalid-input behavior, and anonymous /admin protection on the custom domain.
10. Keep the prior Vercel production deployment as rollback until post-cutover smoke passes.
```

Finish the document with: `Actual domain/DNS cutover requires a separate explicit user approval.`

- [ ] **Step 3: Verify docs**

Run:

```bash
git diff --check -- docs/production-business-data-input.md docs/nupsbox-vn-cutover-runbook.md
grep -F 'PENDING APPROVAL' docs/production-business-data-input.md
grep -F 'do not guess' docs/nupsbox-vn-cutover-runbook.md
grep -F 'separate explicit user approval' docs/nupsbox-vn-cutover-runbook.md
```

Expected: all exit 0.

- [ ] **Step 4: Commit**

```bash
git add docs/production-business-data-input.md docs/nupsbox-vn-cutover-runbook.md
git commit -m "docs: prepare production data and domain cutover gates"
```

---

### Task 5: Run exact-head branch verification before any production write

**Files:**
- No code changes expected.
- Update only `docs/production-checklist.md` if verification reveals a new factual status.

**Interfaces:**
- Consumes Tasks 1–4.
- Produces a branch head eligible for production smoke.

- [ ] **Step 1: Run full application quality gates**

```bash
npm ci
npm run lint
npm run typecheck
npm run test:run
npm run build
```

Expected: every command exits 0.

- [ ] **Step 2: Run full database contracts**

```bash
test -f supabase/config.toml || supabase init
supabase db start
supabase test db
supabase stop --no-backup
```

Expected: full migration chain applies locally and all pgTAP tests, including `light_booking_contract.sql`, pass.

- [ ] **Step 3: Push the exact branch head and require Preview/Vercel success**

```bash
git push -u origin codex/p24-production-go-live-readiness
```

Verify GitHub CI, Database Tests, and exact-head Vercel Preview are green before Task 6. Do not use a previous commit's status as evidence.

- [ ] **Step 4: Stop on any failure**

If any application, DB, or exact-head deployment gate fails, do not run the production smoke. Fix via TDD and repeat Task 5 from Step 1.

---

### Task 6: Execute the single production smoke run and capture evidence

**Files:**
- Modify: `docs/production-checklist.md` after the smoke with actual results and identifiers/timestamps that are safe to record. Never record secrets or customer-like synthetic phone details beyond the fixed marker scheme.

**Interfaces:**
- Consumes trusted environment variables and the Task 3 smoke runner.
- Produces production evidence plus zero residual synthetic lead/appointment rows.

- [ ] **Step 1: Record the pre-smoke database snapshot**

Using an authorized Supabase query path, record counts for:

```sql
select
  (select count(*) from public.leads) as leads,
  (select count(*) from public.lead_appointments) as appointments,
  (select count(*) from public.lead_appointment_history) as appointment_history;
```

Also verify migration `20260915000400_phase2_light_booking_crm` remains present before the smoke.

- [ ] **Step 2: Run exactly one production smoke invocation**

From a trusted runner with secrets injected out-of-band:

```bash
PRODUCTION_BASE_URL=https://nupsbox.vercel.app \
SUPABASE_URL=https://veglohnmofzkgovedxkb.supabase.co \
SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
PRODUCTION_SMOKE_RUN_ID=20260917T-P24-001 \
npm run test:production-smoke
```

The literal run ID may change, but it must satisfy the helper regex and be unique. Do not echo the service-role key. Do not auto-retry this command; two successful valid API requests consume two production lead-rate-limit slots.

Expected test evidence:

```text
invalid public payload -> HTTP 400, zero marked rows
lead-only -> HTTP 201, exact marked lead verified
lead+appointment -> HTTP 201, pending customer appointment + created history verified
invalid direct RPC appointment -> error, zero atomic-failure lead rows
cleanup -> exact IDs/markers verified, history then appointment then lead deleted
final marker query -> zero residual synthetic rows
```

- [ ] **Step 3: Verify post-smoke RLS/RPC contracts on production**

Run read-only SQL checks equivalent to:

```sql
select relname, relrowsecurity
from pg_class
where relname in ('lead_appointments', 'lead_appointment_history');

select
  has_function_privilege('service_role', 'public.submit_public_lead_request(jsonb,jsonb)', 'EXECUTE') as service_role_execute,
  has_function_privilege('anon', 'public.submit_public_lead_request(jsonb,jsonb)', 'EXECUTE') as anon_execute,
  has_function_privilege('authenticated', 'public.submit_public_lead_request(jsonb,jsonb)', 'EXECUTE') as authenticated_execute;
```

Expected:

```text
lead_appointments relrowsecurity=true
lead_appointment_history relrowsecurity=true
service_role_execute=true
anon_execute=false
authenticated_execute=false
```

- [ ] **Step 4: Verify public/admin/runtime health**

Confirm on the exact production deployment:

```text
/dat-kho returns HTTP 200 and shows the Light Booking form
/admin does not expose authenticated content to an anonymous request
Vercel runtime error clusters since the smoke start contain no new P2.4-caused errors
```

Do not claim viewer/staff/admin authenticated runtime behavior unless corresponding authorized sessions exist. Keep that sub-gate pending if only the one admin account is available.

- [ ] **Step 5: Verify cleanup with a fresh DB query**

Query both the lead-only marker and booking marker. Expected: zero remaining rows in `leads`, `lead_appointments`, and `lead_appointment_history` attributable to this run.

A cleanup mismatch is a failed P2.4 gate even if all functional assertions passed.

- [ ] **Step 6: Update the checklist evidence**

In `docs/production-checklist.md`, record:

```text
production smoke run id
exact branch/main SHA tested
lead-only PASS/FAIL
lead+appointment+history PASS/FAIL
atomic rollback PASS/FAIL
synthetic cleanup PASS/FAIL
RLS/RPC verification PASS/FAIL
anonymous admin protection PASS/FAIL
runtime error check PASS/FAIL
viewer/staff authenticated runtime E2E: PASS or PENDING (never guessed)
```

- [ ] **Step 7: Commit the factual evidence update**

```bash
git add docs/production-checklist.md
git commit -m "docs: record P2.4 production readiness evidence"
```

After this commit, rerun Task 5 quality/DB gates because the exact head changed, even though the new commit is documentation-only.

---

### Task 7: Final P2.4 review and PR handoff

**Files:**
- Review all files changed by Tasks 1–6.

**Interfaces:**
- Produces a reviewable PR. It does not seed unapproved business facts and does not cut over `nupsbox.vn`.

- [ ] **Step 1: Verify scope**

Run:

```bash
git diff main...HEAD --name-only
```

Expected changed paths are limited to the file map in this plan. No production migration, payment, reservation, messaging, or DNS implementation should appear.

- [ ] **Step 2: Fresh final verification**

Run:

```bash
npm ci
npm run lint
npm run typecheck
npm run test:run
npm run build
```

Then run the local database workflow again:

```bash
test -f supabase/config.toml || supabase init
supabase db start
supabase test db
supabase stop --no-backup
```

Expected: all green on the exact final branch head.

Do not rerun the production smoke merely because documentation changed; its prior run ID/evidence remains the single production write run unless a functional code change after Task 6 invalidates it. If functional code changes after the smoke, require a deliberate decision before consuming production rate-limit slots again.

- [ ] **Step 3: Open the PR**

Title:

```text
chore: add P2.4 production go-live readiness gates
```

PR body must state:

```text
- adds guarded production lead/booking smoke tooling;
- records production RLS/runtime/readiness evidence;
- prepares factual business-data approval sheet;
- prepares nupsbox.vn cutover runbook;
- performs no production DDL migration;
- performs no unapproved business-data seed;
- does not cut over nupsbox.vn.
```

- [ ] **Step 4: Preserve the domain gate**

Do not attach/configure DNS for `nupsbox.vn` as part of this PR. The next action after P2.4 is a separate explicit approval for domain/DNS cutover, optionally preceded by explicit approval of the business-data values in `docs/production-business-data-input.md`.
