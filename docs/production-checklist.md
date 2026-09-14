# NupsBox Production Checklist

Last reviewed: 2026-09-14

## Current preflight status

- Code branch: `codex/phase-1-foundation`
- PR: #1 (draft)
- Canonical production domain: `https://nupsbox.vn`
- Dedicated Supabase project: `nupsbox` (`veglohnmofzkgovedxkb`), region `ap-southeast-1`.
- Supabase Phase 1 database preflight: **PASS**. Production migration history is aligned through `20260914000500_harden_role_helper_execute`.
- Production-generated TypeScript database types are synchronized into `types/database.ts`.
- Vercel project identity is verified as team `ntg2299` / `team_PMOgG7NuBqEalFpTAxXzeBtf`, project `nupsbox` / `prj_LPKSnGmLYdAGdNyoIUtiZ6CHCDsG`.
- Vercel Preview build issue: **RESOLVED**. The repo now contains `vercel.json` with `framework: "nextjs"`, overriding the stale/incorrect project Framework Preset. Preview deployments now succeed.
- Diagnostic builds proved `npm ci` + `next build` succeed on Node 24.11.0 and 24.21.0 with all application env variables unset. The previous Vercel failures were therefore not caused by source compilation, Node minor version, lockfile installation, or missing build-time application env.
- Production seed/content has **not** been inserted. `auth.users` and active admin profiles are still empty.
- Go-live remains blocked by production Auth/admin bootstrap, approved business content, Vercel environment/domain configuration, and end-to-end Preview smoke tests.

## 1. Required environment variables

Configure these in Vercel before enabling production lead submission:

- `NEXT_PUBLIC_SUPABASE_URL` — NupsBox Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — active publishable key.
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

### Security status

- Anonymous `SECURITY DEFINER` helper exposure: **resolved**.
- `lead_rate_limits` intentionally has RLS with no client policy because it is server/service-role state.
- Authenticated `SECURITY DEFINER` notices for `current_app_role()` and `is_admin()` are intentional caller-scoped authorization helpers.

Performance notices are non-blocking for Phase 1 and should be revisited after real traffic/query plans are available.

## 3. Supabase Auth setup

Still required before launch:

- Production Site URL: `https://nupsbox.vn`.
- Redirect callback for redirect/PKCE flows: `https://nupsbox.vn/auth/callback`.
- Password login already uses `signInWithPassword`; the callback route is not required for that direct password path.
- Create the first authorized Supabase Auth staff user.
- Create the corresponding active `public.profiles` row with the intended admin role through an authorized operation.
- Verify viewer/staff/admin permission boundaries after bootstrap.

Current production state: `auth.users = 0`, `public.profiles = 0`, active admins = 0.

## 4. Seed/content validation

The development seed has **not** been applied to production.

Before public launch:

- Confirm the Tân Phú address and contact channels.
- Confirm unit sizes, pricing fields and availability labels.
- Keep prices null when no verified public price is available; the UI intentionally falls back to contact-for-pricing.
- Do not present `available_count` as real-time inventory unless operations maintain it as such.
- Review VI/EN FAQ and media alt text.
- Confirm there are no fabricated ratings, reviews or customer logos.

Current development seed intentionally leaves phone, Zalo, public prices and availability counts unset pending approved business values.

## 5. Vercel preflight

Verified project:

- Team slug: `ntg2299`
- Team ID: `team_PMOgG7NuBqEalFpTAxXzeBtf`
- Project slug: `nupsbox`
- Project ID: `prj_LPKSnGmLYdAGdNyoIUtiZ6CHCDsG`
- Git integration: active on PR #1.

### Resolved build failure

The same source tree repeatedly passed GitHub production builds while Vercel returned `Error`. A parity diagnostic then confirmed clean builds on Node 24.11.0 and 24.21.0 with all application env variables absent. Adding only this repo-level configuration changed Vercel from Error to Success:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs"
}
```

The original Node engine range `>=24.21.0 <25` was restored afterward and Vercel continued to succeed, confirming Node was not the root cause.

### Still required in Vercel

1. Verify Production and Preview environment variables listed above.
2. Add and verify `nupsbox.vn` as the primary production domain.
3. Configure DNS and HTTPS only against this verified project.
4. Run full Preview smoke tests before merge/promotion.

## 6. Domain and HTTPS

- Add `nupsbox.vn` to the verified Vercel project.
- Use `https://nupsbox.vn` as the canonical domain.
- Redirect `www` consistently to the chosen primary domain.
- Verify HTTPS certificate issuance before launch.
- Re-check canonical/hreflang output after DNS cutover.

## 7. Exact-head quality gate

The exact commit being promoted must pass:

```text
npm ci
npm run lint
npm run typecheck
npm run test:run
npm run build
```

The database workflow must also apply the full migration chain locally and pass pgTAP schema/RLS contracts. Vercel Preview for the same exact head must be successful.

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
- excessive lead submissions return HTTP 429
- unauthenticated `/admin` redirects to login
- viewer/staff/admin permission boundaries behave as expected

## 9. Rollback points

- Keep the previous Vercel production deployment available until smoke tests pass.
- Before future database migrations, record current migration history and confirm the recovery path.
- Prefer explicit forward/fix migrations over editing already-applied production migrations.
- Never expose service credentials as a workaround for a failed lead path.

## Go-live decision

Production may proceed only when all are true:

1. Exact-head CI, Database Tests and Vercel Preview are green.
2. Supabase migration/RLS verification remains clean.
3. Production Auth Site URL/callbacks and the first authorized admin are configured.
4. Approved production seed/content is loaded and reviewed.
5. `nupsbox.vn` is configured on the verified Vercel project with valid HTTPS.
6. Preview smoke tests pass.
