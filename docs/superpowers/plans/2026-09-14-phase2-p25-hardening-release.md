# NupsBox Phase 2 P2.5 — Hardening & Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prove the complete Phase 2 CMS/CRM/analytics stack is secure, regression-safe, deployable and recoverable before any production promotion.

**Architecture:** Run deep authenticated E2E against an isolated local Supabase + local Next.js stack so synthetic users/leads/content never contaminate production. Keep Vercel Preview checks non-destructive and use only an authorized access/bypass path if the project exposes one. Production deployment remains a gated forward migration plus minimal smoke verification, never an automatic consequence of CI success.

**Tech Stack:** Next.js 16.3.3, React 19.3, TypeScript 5.9, Supabase CLI 2.117.0/PostgreSQL, Playwright 1.63, Vitest 5, pgTAP, GitHub Actions, Vercel.

**Spec:** `docs/superpowers/specs/2026-09-14-phase2-conversion-operations-design.md`

## Global Constraints

- P2.1–P2.4 must all be green before P2.5 release work.
- Automated deep E2E uses local Supabase test data, not production data.
- Test-only local service-role credentials may exist only inside server-side test setup/CI process environment; never ship them to browser bundles or application source.
- Do not disable Vercel Deployment Protection merely to make tests pass.
- Never commit preview bypass tokens, Supabase secrets, test passwords or production credentials.
- Production migrations are forward-only and are applied only after local clean-reset + pgTAP + exact-head application CI are green.
- No merge or production promotion without explicit go-live approval after all gates are reported.

---

### Task 1: Build an isolated local authenticated E2E harness

**Files:**
- Modify: `playwright.config.ts`
- Create: `tests/e2e/helpers/test-env.ts`
- Create: `tests/e2e/helpers/supabase-admin.ts`
- Create: `tests/e2e/global-setup.ts`
- Create: `tests/e2e/global-teardown.ts`
- Modify: `package.json`
- Create: `tests/e2e/auth-smoke.spec.ts`

**Interfaces:**
- Produces a local E2E environment with three fixture users: admin, staff, viewer; fixture credentials live only in process env and are generated/seeded by test setup.

- [ ] **Step 1: Make Playwright configurable without changing its safe default**

Change only the base URL/webServer config to accept:

```ts
const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3000';
```

Keep localhost as the default.

- [ ] **Step 2: Add failing authenticated smoke test**

`tests/e2e/auth-smoke.spec.ts` should attempt to sign in with the test admin fixture and reach `/admin`.

- [ ] **Step 3: Verify RED before fixture setup exists**

```bash
npm run test:e2e -- tests/e2e/auth-smoke.spec.ts
```

Expected: fixture/env setup missing or login unavailable.

- [ ] **Step 4: Implement server-side local Supabase test helper**

`tests/e2e/helpers/supabase-admin.ts` may instantiate `@supabase/supabase-js` with **test-only** local URL/service-role env values. Its module must never be imported by application code.

The helper creates deterministic fixture users through `auth.admin.createUser`, then upserts `public.profiles`:

```text
admin fixture  → role admin, active true
staff fixture  → role staff, active true
viewer fixture → role viewer, active true
```

Use unique emails under an invalid/test-only domain such as `admin-e2e@example.invalid`.

- [ ] **Step 5: Implement global setup/teardown**

Setup must clean stale `e2e_*` fixtures before creating users/content. Teardown removes fixture rows/users even if tests fail. Use test marker prefixes and explicit IDs; never wildcard-delete normal records.

- [ ] **Step 6: Add local E2E script contract**

Add a script such as:

```json
"test:e2e:local": "playwright test"
```

The CI task later supplies local Supabase env values and `LEAD_RATE_LIMIT_SALT=e2e-only-salt` to the Next process.

- [ ] **Step 7: Verify and commit**

With local Supabase running and test env populated:

```bash
npm run test:e2e:local -- tests/e2e/auth-smoke.spec.ts
```

Expected: admin login reaches `/admin`; teardown leaves no `e2e_*` users/profiles.

Commit:

```bash
git add playwright.config.ts tests/e2e package.json package-lock.json
git commit -m "test: add isolated authenticated e2e harness"
```

---

### Task 2: Add role-boundary CMS and CRM E2E coverage

**Files:**
- Create: `tests/e2e/admin-cms.spec.ts`
- Create: `tests/e2e/admin-crm.spec.ts`
- Extend: `tests/e2e/helpers/test-env.ts`

**Interfaces:**
- Proves the approved admin/staff/viewer behavior through the real UI/server actions against local Supabase.

- [ ] **Step 1: Add CMS role tests**

Cover at minimum:

```text
admin can create/update location and settings
staff can create/update/publish catalog/content but cannot update settings
viewer can read CMS surfaces but sees no mutation controls and mutation requests fail if forced
published location/unit/blog slug cannot change
no hard-delete control exists
```

All created records use `e2e-` slug prefixes and are removed in teardown.

- [ ] **Step 2: Add CRM role tests**

Cover:

```text
admin sees lead detail, can backward-correct/reopen and export
staff can forward transition, mark lost, assign and append note, cannot export/reopen
viewer can read lead list/detail, cannot mutate/assign/note/export
notes remain append-only
status history shows every transition
```

- [ ] **Step 3: Verify tests fail on an intentionally withheld fixture/action before implementation adjustments**

Run targeted suites and confirm test harness is exercising real authorization, not mocked permissions.

- [ ] **Step 4: Run targeted E2E PASS**

```bash
npm run test:e2e:local -- tests/e2e/admin-cms.spec.ts tests/e2e/admin-crm.spec.ts
```

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/admin-cms.spec.ts tests/e2e/admin-crm.spec.ts tests/e2e/helpers/test-env.ts
git commit -m "test: cover admin cms and crm roles"
```

---

### Task 3: Add lead API security/rate-limit E2E on local Supabase

**Files:**
- Create: `tests/e2e/lead-api.spec.ts`
- Extend: `tests/e2e/helpers/supabase-admin.ts`

**Interfaces:**
- Proves actual `/api/leads` behavior without touching production.

- [ ] **Step 1: Add valid submission test**

POST a synthetic payload with source `e2e_phase2` and verify HTTP 201 plus one local `leads` row with expected normalized phone/UTM attribution.

- [ ] **Step 2: Add invalid/honeypot tests**

Cover malformed phone/body → 400 and populated honeypot → rejected according to the route’s intended anti-bot response. Verify no CRM row is created.

- [ ] **Step 3: Add rate-limit test using the existing contract**

Current Phase 1 limit is 5 requests per 15 minutes. From one deterministic client fingerprint:

```text
requests 1–5 → allowed according to valid-submission behavior
request 6 → HTTP 429
```

Reset local rate-limit fixture state between tests; do not lower production constants merely to speed the test.

- [ ] **Step 4: Verify cleanup**

Teardown removes all `source='e2e_phase2'` leads and their cascade-dependent notes/history plus test rate-limit rows by exact test fingerprints/markers.

- [ ] **Step 5: Run and commit**

```bash
npm run test:e2e:local -- tests/e2e/lead-api.spec.ts
git add tests/e2e/lead-api.spec.ts tests/e2e/helpers/supabase-admin.ts
git commit -m "test: cover lead api security and rate limit"
```

---

### Task 4: Add a dedicated local E2E GitHub Actions job

**Files:**
- Create: `.github/workflows/e2e-local.yml`
- Modify if needed: `playwright.config.ts`

**Interfaces:**
- PR and `main` runs must reproduce local Supabase + application E2E without production secrets.

- [ ] **Step 1: Create workflow**

Workflow outline:

```text
checkout
setup Node 24.21.0
npm ci
setup Supabase CLI 2.117.0
supabase db start
extract local API URL / anon / service-role values from `supabase status` in the runner
export only into current job environment
set test-only LEAD_RATE_LIMIT_SALT
install Playwright Chromium
run npm run test:e2e:local
always: supabase stop --no-backup
```

Do not echo service-role values to logs. Use GitHub masking if any command could print them.

- [ ] **Step 2: Keep Vercel outside this deep E2E job**

The job tests local application behavior. It must not POST synthetic leads to a Preview URL.

- [ ] **Step 3: Verify workflow YAML and local equivalent**

Run the same command chain locally where possible, then push the workflow and require one successful PR run before considering this task complete.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/e2e-local.yml playwright.config.ts
git commit -m "ci: add isolated phase2 e2e gate"
```

---

### Task 5: Strengthen database behavior tests beyond policy existence

**Files:**
- Create: `supabase/tests/phase2_behavior_contract.sql`
- Modify if needed: `supabase/tests/rls_contract.sql`

**Interfaces:**
- Exercises actual role/RLS/trigger behavior transactionally in local Postgres.

- [ ] **Step 1: Add failing pgTAP behavior cases**

Cover:

```text
viewer can SELECT CRM rows but cannot UPDATE leads
staff can UPDATE leads and INSERT notes
staff cannot write site_settings
admin can write site_settings
assigning an inactive/viewer profile fails
lead status update writes exactly one history row and one audit row
lead assignment update writes audit row
lead note insert writes audit row without note text in metadata
published slug mutation fails
CMS DELETE through authenticated roles fails
```

Use transaction-local fixture identities/claims and rollback the file at the end.

- [ ] **Step 2: Verify RED then implement only concrete fixes**

```bash
supabase db reset
supabase test db
```

Any failure must be traced to a missing/incorrect Phase 2 migration or policy; fix with a new forward migration if an already-reviewed migration has been applied remotely by that point.

- [ ] **Step 3: Commit tests/fixes** with a narrow message such as `test: add phase2 database behavior contracts`.

---

### Task 6: Perform query/index verification; add indexes only with evidence

**Files:**
- Create only if evidence requires it: `supabase/migrations/20260915000500_phase2_verified_indexes.sql`
- Create: `docs/phase2-query-review.md`

**Interfaces:**
- Evidence-based performance checkpoint for CRM list/detail, attribution and CMS queries.

- [ ] **Step 1: Seed representative local fixture volume**

Use disposable/local-only data sufficient to make query plans meaningful (for example thousands of leads), never production seed claims.

- [ ] **Step 2: Run `EXPLAIN (ANALYZE, BUFFERS)` locally** for:

```text
leads by status + created_at
leads by assigned_to + created_at
leads by location + created_at
lead detail notes/history
attribution by created_at/source/campaign/status
blog published listing
```

Record plans/findings in `docs/phase2-query-review.md`.

- [ ] **Step 3: Add an index migration only when the plan demonstrates a real avoidable scan/sort**

Do not create speculative indexes. If no new index is justified, do not create `20260915000500_phase2_verified_indexes.sql`.

- [ ] **Step 4: Re-run plans and DB tests** after any index addition.

- [ ] **Step 5: Commit review and any justified index migration**.

---

### Task 7: Inspect current Vercel access/domain/env state and design the Preview smoke path

**Files:**
- Modify: `docs/production-checklist.md`
- Modify only if supported by current verified access method: `.github/workflows/ci.yml`

**Interfaces:**
- Produces a non-destructive exact-head Preview gate and a documented authorized path for app-level smoke.

- [ ] **Step 1: Inspect the current verified Vercel project**

At execution time re-read:

```text
project/team identity
latest exact-head deployment
Preview Deployment Protection mode
available authorized automation/access mechanism
Production/Preview env presence (names only; never reveal secret values)
domain `nupsbox.vn` state
HTTPS state
```

Do not rely on assumptions from the Phase 1 troubleshooting session because platform/project settings may have changed.

- [ ] **Step 2: Keep existing public Preview smoke**

Public route probes must continue to verify key VI/EN pages, sitemap, robots and auth/login on the exact head.

- [ ] **Step 3: Add protected app-level smoke only if an authorized project-supported access mechanism is available**

Store any required bypass/access secret in the CI secret store; never in repository files or logs. If no authorized mechanism exists, keep deep E2E local and defer one application-level protected smoke to the manual release checklist.

Do not turn off Preview Protection as a testing workaround.

- [ ] **Step 4: Update checklist with the actual state** and commit.

---

### Task 8: Production migration and release preflight

**Files:**
- Modify: `docs/production-checklist.md`
- No database mutation until all read-only checks pass.

**Interfaces:**
- Gate from tested Phase 2 branch to production migration candidate.

- [ ] **Step 1: Verify exact-head repository gates**

Required exact head:

```bash
npm ci
npm run lint
npm run typecheck
npm run test:run
npm run build
npm run test:e2e:local
supabase db reset
supabase test db
```

GitHub CI/Database/E2E jobs and Vercel deployment for that same SHA must be green.

- [ ] **Step 2: Read-only production Supabase preflight**

Confirm project identity and compare local/remote migration history. Required Phase 2 migrations must be pending in the expected order and no unknown newer remote migration may exist.

- [ ] **Step 3: Re-run production security/performance advisors read-only**

Record blockers; do not force migration if history or prerequisites diverge.

- [ ] **Step 4: Confirm recovery/rollback points**

Record current production Vercel deployment, current remote migration history, and the recovery procedure. Database rollback strategy is forward-fix unless an independently tested restoration is required.

- [ ] **Step 5: Apply Phase 2 migrations only after explicit deployment approval**

Use the repository migration chain in order. Never edit an already-applied migration to repair a failure; create a new forward fix.

---

### Task 9: Production smoke and release decision

**Files:**
- Update: `docs/production-checklist.md`
- No automatic merge/promotion step.

- [ ] **Step 1: Public smoke**

Verify canonical `https://nupsbox.vn` and key VI/EN routes, sitemap, robots, canonical/hreflang and public catalog/content rendering.

- [ ] **Step 2: Minimal lead smoke**

Submit exactly one clearly marked synthetic lead through the public production path only after env/domain are confirmed. Verify 201 and correct CRM attribution. Remove the synthetic record through an authorized database/admin cleanup procedure and confirm no test row remains.

Do not deliberately trigger production rate limiting; that behavior is already proven in local E2E.

- [ ] **Step 3: Auth/admin smoke**

With authorized production test accounts/roles verify admin/staff/viewer read/mutation boundaries, one reversible CMS update, one lead status/assignment/note flow, and admin-only export availability. Restore the reversible CMS value after verification.

- [ ] **Step 4: Analytics smoke without PII**

When analytics IDs are configured, use browser/provider debug tooling to verify canonical event names and non-PII payloads. If IDs are intentionally unset, record analytics as intentionally disabled rather than a failure.

- [ ] **Step 5: Review runtime errors/logs**

Check Vercel runtime errors/logs after smoke for new 5xx/auth/RLS failures.

- [ ] **Step 6: Make a release decision**

Phase 2 is releasable only when all prior tasks are green and production smoke has no unresolved blocker. Report the exact head and evidence. **Do not merge/promote automatically; wait for explicit go-live approval.**

**P2.5 exit criteria:** isolated authenticated E2E passes, DB behavior contracts pass, query/index decisions are evidence-based, exact-head CI/DB/E2E/Vercel are green, production migration history is aligned, smoke is clean, and a human-approved go-live decision remains the final gate.
