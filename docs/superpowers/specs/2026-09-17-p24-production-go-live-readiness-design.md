# NupsBox P2.4 Production Go-live Readiness Design

**Approved direction:** 2026-09-17

## Goal

Move the current production deployment from "technically deployed" to "go-live ready" without adding unrelated product scope. P2.4 focuses on production verification, truthful business content, operational readiness, and the final domain/canonical cutover path.

## Current baseline

P2.3 Light Booking CRM is already merged to `main` and deployed to Vercel production. The production Supabase database includes the light-booking migration and has RLS enabled for the appointment tables. Production currently has one Auth user, one active admin profile, and no business content rows in locations, unit types, FAQs, blog posts, site settings, leads, or appointments.

The current public production alias is `https://nupsbox.vercel.app`. The intended canonical domain remains `https://nupsbox.vn`, but domain/DNS cutover is intentionally deferred until the readiness gates below pass.

## Scope

P2.4 includes five tightly related workstreams:

1. Refresh production documentation so it reflects the actual post-P2.3 state.
2. Add a safe production smoke workflow for the live lead and optional viewing-request path.
3. Verify production authorization, RLS, audit/history, and runtime health after the smoke workflow.
4. Prepare production business data using only values that are explicitly approved or already authoritative.
5. Prepare the final `nupsbox.vn` domain/canonical cutover checklist, but do not perform the DNS/domain cutover until the preceding gates pass.

## Non-goals

P2.4 will not add inventory reservation, payments, calendar synchronization, automated messaging, new CRM lifecycle states, or new product modules. It will not fabricate prices, stock counts, ratings, reviews, customer logos, phone numbers, Zalo accounts, addresses, or marketing claims.

It will not intentionally trigger production rate limiting. Rate-limit behavior remains proven in non-production/local contract tests unless a future safe isolated production mechanism is introduced.

## Workstream 1: production checklist refresh

Update `docs/production-checklist.md` from the stale Phase 1 snapshot to the real post-P2.3 state. The checklist must distinguish:

- verified production facts;
- completed gates;
- still-pending business decisions;
- tooling limitations where a setting cannot be inspected directly;
- the final domain cutover sequence.

The refreshed checklist must record the current production code head, Supabase migration state through P2.3, existence of the active admin bootstrap, current Vercel production alias, and the fact that business content tables are still empty.

## Workstream 2: safe production lead and booking smoke

Create an explicit smoke path that proves the deployed production application can execute the real server-side submission flow against the real production database.

The smoke sequence must cover:

1. A valid public lead without an appointment returns success and creates exactly one lead row.
2. A valid public lead with a future HCMC viewing request returns success and creates exactly one lead plus one pending appointment.
3. The appointment has a corresponding immutable history `created` event.
4. Invalid public input returns a client error and creates no lead or appointment.
5. The lead/appointment transaction is atomic: an invalid appointment payload must not leave a lead orphan.

Synthetic test records must use a deterministic marker so they can be found reliably. Cleanup must delete only records created by that exact smoke run and must verify the expected IDs/marker before deletion. Cleanup failure must be reported as a failed gate rather than hidden.

The smoke must not expose the Supabase service-role key to the browser or client logs.

## Workstream 3: authorization, RLS, and runtime verification

After the production smoke, verify:

- `lead_appointments` and `lead_appointment_history` still have RLS enabled;
- public/anonymous clients cannot directly read CRM lead/appointment data;
- the public submission RPC remains executable only by the service role;
- unauthenticated `/admin` remains protected;
- viewer remains read-only;
- staff can perform only the permitted operational CRM actions;
- admin retains full intended CRM capabilities;
- appointment history is preserved after relevant appointment changes;
- Vercel production reports no new runtime-error cluster caused by P2.4.

Where authenticated role verification requires a browser/session that the connector cannot create, the checklist must clearly mark that sub-gate as requiring the authorized admin account rather than pretending it was verified.

## Workstream 4: production business-data preparation

The production database is the source of truth for public catalog/content, but no business values will be inferred.

Data preparation is split into two categories:

### Safe structural/default data

May be prepared when it is already defined by approved product structure and does not make a factual business claim, for example content structure, localization scaffolding, or records whose public fields intentionally remain null until approved.

### Business factual data

Must require explicit approved values before insertion or publication, including:

- physical address details;
- phone and Zalo contact details;
- unit sizes and naming;
- prices and pricing units;
- availability labels/counts;
- business hours;
- real photos/media metadata;
- FAQ statements presented as company policy;
- blog/content presented as NupsBox factual claims.

If a price, count, contact channel, or similar field is not approved, it stays null and the existing UI fallback must continue to avoid presenting invented information.

Production seeding must be repeatable/idempotent or otherwise guarded against duplicate rows. Any database write that changes production business content requires a pre-write snapshot/count and a post-write verification.

## Workstream 5: domain and canonical cutover preparation

`nupsbox.vn` remains the intended canonical domain. P2.4 prepares, but does not execute, the cutover until all prior readiness gates are green.

The cutover checklist must include:

1. Verify the target Vercel project is the current `nupsbox` production project.
2. Verify required production environment variables are present without exposing secret values.
3. Add/verify `nupsbox.vn` and define the preferred `www` redirect behavior.
4. Apply only DNS records explicitly provided by the verified Vercel domain configuration; never guess DNS targets.
5. Wait for HTTPS certificate issuance.
6. Change `NEXT_PUBLIC_SITE_URL` or equivalent canonical origin configuration only when the domain is verified.
7. Re-run public-route smoke, canonical, hreflang, sitemap, robots, JSON-LD, lead submission, and admin-protection checks on the custom domain.
8. Keep the previous Vercel production deployment available as the rollback point until the post-cutover smoke passes.

## Ordering and safety gates

Implementation order is mandatory:

1. Documentation/status refresh.
2. Automated/local tests for any smoke helper or cleanup logic.
3. Preview/non-production verification where applicable.
4. Production lead/booking smoke with deterministic cleanup.
5. Production RLS/runtime verification.
6. Business-data preparation using approved values only.
7. Domain/canonical cutover preparation.
8. Separate explicit approval before performing the actual domain/DNS cutover.

No production DDL migration is expected for P2.4 unless implementation uncovers a real defect. If a schema change becomes necessary, that is a scope escalation: stop, document the issue, use TDD/DB contract tests, and require a separate explicit production migration approval.

## Testing and acceptance

Code changes must pass the existing exact-head quality gates:

```text
npm ci
npm run lint
npm run typecheck
npm run test:run
npm run build
```

Database contract tests must continue to pass the full migration chain and pgTAP RLS/schema tests.

P2.4 is accepted when:

- the production checklist reflects the post-P2.3 truth;
- production lead-only and lead+appointment smoke paths pass and synthetic rows are cleaned up;
- invalid/atomic failure behavior is verified;
- RLS/RPC/admin protection checks remain green;
- no new production runtime errors attributable to the change are present;
- any seeded business data is sourced from explicit approved values, with no fabricated public facts;
- the custom-domain cutover steps are ready and unambiguous;
- the actual `nupsbox.vn` cutover remains behind a separate explicit approval gate.

## Rollback principles

P2.4 favors observation and reversible content writes over schema changes. Keep the previous working Vercel production deployment available until all smoke checks pass. Synthetic smoke data must be deleted by exact identifier/marker. Production business-data writes should be small, reviewable, and recoverable from the pre-write snapshot.
