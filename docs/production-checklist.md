# NupsBox Production Checklist

Last reviewed: 2026-09-14

## Current preflight status

- Code branch: `codex/phase-1-foundation`
- PR: #1 (draft)
- Canonical production domain: `https://nupsbox.vn`
- Current Vercel production alias: `https://nupsbox.vercel.app`.
- Current PR Preview alias: `https://nupsbox-git-codex-phase-1-foundation-ntg2299.vercel.app`.
- Dedicated Supabase project: `nupsbox` (`veglohnmofzkgovedxkb`), region `ap-southeast-1`.
- Supabase API URL is verified as `https://veglohnmofzkgovedxkb.supabase.co`; an active modern publishable key exists. Secret key values are intentionally not recorded here.
- Supabase Phase 1 database preflight: **PASS**. Production migration history is aligned through `20260914000500_harden_role_helper_execute`.
- Production-generated TypeScript database types are synchronized into `types/database.ts`.
- Vercel project identity is verified as team `ntg2299` / `team_PMOgG7NuBqEalFpTAxXzeBtf`, project `nupsbox` / `prj_LPKSnGmLYdAGdNyoIUtiZ6CHCDsG`.
- Vercel Preview build issue: **RESOLVED**. The repo contains `vercel.json` with `framework: "nextjs"`, overriding the stale/incorrect project Framework Preset. Preview deployments succeed for deployable heads.
- The CI Preview smoke gate distinguishes deployable heads from commits that change only `docs/**` and/or `.github/**`. Deployable heads require exact-head Vercel success; non-deployable heads skip the absent Vercel status but still run the public route/admin smoke suite against the stable branch Preview alias.
- Exact-head public Preview smoke passes 18/18 routes. Anonymous `/admin` is blocked. Application-level lead/admin E2E on Preview is still blocked by Vercel Deployment Protection unless an authorized access path is available.
- Diagnostic builds proved `npm ci` + `next build` succeed on Node 24.11.0 and 24.21.0 with all application env variables unset. The previous Vercel failures were therefore not caused by source compilation, Node minor version, lockfile installation, or missing build-time application env.
- Production seed/content has **not** been inserted. `auth.users`, `public.profiles`, active admins and production leads are still empty.
- Go-live remains blocked by Vercel environment/domain verification, production Auth/admin bootstrap, approved business content, and application-level lead/admin smoke tests.

## 1. Required environment variables

Configure these in Vercel before enabling production lead submission:

- `NEXT_PUBLIC_SUPABASE_URL=https://veglohnmofzkgovedxkb.supabase.co` — source value verified from Supabase; Vercel presence still requires dashboard/API verification.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — an active modern publishable key is verified at the Supabase source; Vercel presence still requires dashboard/API verification.
- `SUPABASE_SERVICE_ROLE_KEY` — server-only; never expose through `NEXT_PUBLIC_*`.
- `LEAD_RATE_LIMIT_SALT` — long random production secret used before hashing lead rate-limit fingerprints.
- `NEXT_PUBLIC_SITE_URL=https://nupsbox.vn`.
- `NEXT_PUBLIC_GA4_ID` — optional until analytics is intentionally enabled.
- `NEXT_PUBLIC_META_PIXEL_ID` — optional until analytics is intentionally enabled.

Never commit production secrets to GitHub.

## 2. Supabase database preflight

Completed on the dedicated NupsBox production project:

1. Confirmed project identity and database reachability.
2. Confirmed no Phase 1 object-name collisions existed before migration.
3. Applied and aligned production migration history:
   - `20260914000100_phase1_core_schema.sql`
   - `20260914000200_phase1_indexes_and_triggers.sql`
   - `20260914000300_rls_and_roles.sql`
   - `20260914000400_lead_rate_limit_rpc.sql`
   - `20260914000500_harden_role_helper_execute.sql`
4. Verified 15 application tables, 7 enums, expected functions/triggers/indexes, and 28 RLS policies.
5. Confirmed all 15 application tables have RLS enabled.
6. Confirmed `consume_lead_rate_limit` is executable by `service_role` and not by `anon`/`authenticated`.
7. Confirmed `current_app_role()` and `is_admin()` are not executable by `anon`; authenticated execution is intentional for caller-scoped RLS checks.
8. Ran a transactional production RLS smoke test: anonymous access could read an active catalog fixture but could not read a CRM lead fixture; fixtures were rolled back.
9. Generated fresh production TypeScript types and synchronized `types/database.ts`.
10. Reviewed security and performance advisors after DDL.
11. Re-checked production migration history on 2026-09-14: exactly the same five Phase 1 migrations remain applied; no drift was found.
12. Re-checked production business/auth counts: `auth.users=0`, `profiles=0`, active admins=0, locations=0, unit types=0, FAQs=0, site settings=0, leads=0.

### Security status

- Anonymous `SECURITY DEFINER` helper exposure: **resolved**.
- `lead_rate_limits` intentionally has RLS with no client policy because it is server/service-role state.
- Authenticated `SECURITY DEFINER` notices for `current_app_role()` and `is_admin()` are intentional caller-scoped authorization helpers.
- Remaining performance advisor findings are non-blocking for Phase 1 and will be revisited with real traffic/query-plan evidence.

## 3. Supabase Auth setup

Still required before launch:

- Production Site URL: `https://nupsbox.vn`.
- Redirect callback for redirect/PKCE flows: `https://nupsbox.vn/auth/callback`.
- Password login already uses `signInWithPassword`; the callback route is not required for that direct password path.
- Create the first authorized Supabase Auth user.
- Create the corresponding active `public.profiles` row with role `admin` through an authorized operation.
- Verify viewer/staff/admin permission boundaries after bootstrap.

Current production state: `auth.users = 0`, `public.profiles = 0`, active admins = 0.

The currently available Supabase connector can verify database state but does not expose an Auth-management action for Site URL/redirect configuration or creating Auth users. These two steps therefore require an authorized Supabase Dashboard/API path before this gate can be marked PASS.

## 4. Seed/content validation

The development seed has **not** been applied to production.

Before public launch:

- Confirm the Tân Phú address and contact channels.
- Confirm unit sizes, pricing fields and availability labels.
- Keep prices null when no verified public price is available; the UI intentionally falls back to contact-for-pricing.
- Do not present `available_count` as real-time inventory unless operations maintain it as such.
- Review VI/EN FAQ and media alt text.
- Confirm there are no fabricated ratings, reviews or customer logos.

Current development seed intentionally leaves phone, Zalo, public prices and availability counts unset pending approved business values. Public web search did not yield authoritative NupsBox business values during this preflight, so no values are inferred or inserted.

## 5. Vercel preflight

Verified project:

- Team slug: `ntg2299`
- Team ID: `team_PMOgG7NuBqEalFpTAxXzeBtf`
- Project slug: `nupsbox`
- Project ID: `prj_LPKSnGmLYdAGdNyoIUtiZ6CHCDsG`
- Production alias: `https://nupsbox.vercel.app`
- PR Preview alias: `https://nupsbox-git-codex-phase-1-foundation-ntg2299.vercel.app`
- Git integration: active on PR #1.

The production alias and Preview alias serve different purposes: CI/PR smoke uses the branch Preview alias; `nupsbox.vercel.app` is the current production alias until `nupsbox.vn` is attached and verified.

### Resolved build failure

The same source tree repeatedly passed GitHub production builds while Vercel returned `Error`. A parity diagnostic then confirmed clean builds on Node 24.11.0 and 24.21.0 with all application env variables absent. Adding only this repo-level configuration changed Vercel from Error to Success:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs"
}
```

The original Node engine range `>=24.21.0 <25` was restored afterward and Vercel continued to succeed, confirming Node was not the root cause.

### Preview smoke verified

Deployable head `788c9c200e7a1f403912ee30739437150bc6342c` proved:

- GitHub quality CI: PASS.
- Database Tests: PASS.
- exact-head Vercel commit status: success.
- 18 public Preview routes: HTTP 200.
- anonymous `/admin`: redirected to Vercel SSO and was not exposed.
- a synthetic `/api/leads` attempt was rejected by Vercel Deployment Protection before reaching the application; follow-up database verification found zero synthetic rows.

Non-deployable head `49a4a87c64ea2bf8f567bb7e7156c26acb9912b1` proved the CI synchronization fix:

- CI #104: PASS.
- Database Tests #27: PASS.
- log: `No deployable files changed on exact head; Vercel status is not required.`
- 18/18 public route probes: HTTP 200 against the stable branch Preview alias.
- anonymous `/admin`: HTTP 302 to Vercel SSO.

### Still required in Vercel

1. Verify Production and Preview presence of the required environment variables listed above. Source values for Supabase URL/publishable key are known, but secret env presence must not be guessed.
2. Add and verify `nupsbox.vn` as the primary production domain.
3. Configure DNS and HTTPS only against this verified project.
4. Obtain/use an authorized protected-deployment access path for application-level Preview smoke if available; do not disable Preview Protection merely to run the test.

The Vercel connector was unavailable during the latest management preflight, so env/domain dashboard state could not be re-read. This is an access/tooling blocker, not evidence that the settings are missing.

## 6. Domain and HTTPS

- Current Vercel production alias: `https://nupsbox.vercel.app`.
- Target canonical domain: `https://nupsbox.vn`.
- Add `nupsbox.vn` to the verified Vercel project.
- Redirect `www` consistently to the chosen primary domain.
- Verify HTTPS certificate issuance before launch.
- Re-check canonical/hreflang output after DNS cutover.

External search/indexing and the current execution runtime did not provide authoritative DNS resolution evidence for `nupsbox.vn`; therefore exact DNS records must come from the Vercel project domain screen/API rather than being guessed.

## 7. Exact-head quality gate

Every exact head being considered for merge must pass:

```text
npm ci
npm run lint
npm run typecheck
npm run test:run
npm run build
```

The database workflow must also apply the full migration chain locally and pass pgTAP schema/RLS contracts.

For an exact head with any deployable file change, Vercel must publish a `success` status for that same SHA before Preview smoke proceeds.

For an exact head whose changes are exclusively under `docs/**` and/or `.github/**`, Vercel may intentionally publish no deployment/status. In that case CI must explicitly classify the head as non-deployable, then the stable branch Preview alias must still pass the full public route and anonymous-admin smoke suite.

## 8. Production smoke tests

Before go-live verify at minimum:

- `/` and `/en`
- `/kho-mini` and `/en/mini-storage`
- one unit detail route in both locales
- `/bang-gia` and `/en/pricing`
- `/dia-diem/tan-phu` and `/en/locations/tan-phu`
- `/cau-hoi-thuong-gap` and `/en/faq`
- `/lien-he` and `/en/contact`
- `/dat-kho` remains `noindex`
- `/sitemap.xml`
- `/robots.txt`
- successful lead submission creates one CRM row
- excessive lead submissions return HTTP 429 (prove on a safe non-production path; do not intentionally rate-limit production)
- unauthenticated `/admin` redirects to login/protection
- viewer/staff/admin permission boundaries behave as expected

Public route smoke is proven on the PR Preview. Lead submission/rate-limit and authenticated role behavior remain pending because the protected Preview request path and production Auth bootstrap are not yet available.

## 9. Rollback points

- Keep the previous Vercel production deployment available until smoke tests pass.
- Before future database migrations, record current migration history and confirm the recovery path.
- Prefer explicit forward/fix migrations over editing already-applied production migrations.
- Never expose service credentials as a workaround for a failed lead path.

## Go-live decision

Production may proceed only when all are true:

1. Exact-head quality CI and Database Tests are green; any deployable exact head also has Vercel success, while an explicitly non-deployable docs/.github-only head has fresh Preview route/admin smoke success.
2. Supabase migration/RLS verification remains clean.
3. Production Vercel environment variables are verified without exposing secret values.
4. Production Auth Site URL/callbacks and the first authorized admin are configured.
5. Approved production seed/content is loaded and reviewed.
6. `nupsbox.vn` is configured on the verified Vercel project with valid HTTPS.
7. Application-level lead/admin smoke tests pass through an authorized deployment path.
