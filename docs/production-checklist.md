# NupsBox Production Checklist

Last reviewed: 2026-09-14

## Current preflight status

- Code branch: `codex/phase-1-foundation`
- PR: #1 (draft)
- Canonical domain expected by application: `https://nupsbox.vn`
- Dedicated Supabase project: `nupsbox` (`veglohnmofzkgovedxkb`), region `ap-southeast-1`.
- Supabase Phase 1 database preflight: **PASS**. Production migration history is aligned through `20260914000500_harden_role_helper_execute`.
- Production-generated TypeScript database types have been synchronized into `types/database.ts` while preserving the application enum aliases.
- Production seed/content has **not** been inserted. `auth.users` and active admin profiles are still empty.
- Vercel preflight remains **BLOCKED** because the connected Vercel context currently returns zero teams/projects. Do not deploy by guessing a project or team ID.
- Production merge/deployment remains blocked until Auth, approved seed/content, Vercel project/environment, Preview deployment, and smoke tests are complete.

## 1. Required environment variables

Set these in the production hosting environment before enabling lead submission:

- `NEXT_PUBLIC_SUPABASE_URL` — NupsBox Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — active publishable key for the NupsBox project.
- `SUPABASE_SERVICE_ROLE_KEY` — server-only; never expose it through `NEXT_PUBLIC_*` or client bundles.
- `LEAD_RATE_LIMIT_SALT` — long random production-only secret used before hashing lead rate-limit fingerprints. Missing this value makes `/api/leads` fail closed with a server error.
- `NEXT_PUBLIC_SITE_URL=https://nupsbox.vn`.
- `NEXT_PUBLIC_GA4_ID` — optional until analytics scripts are intentionally enabled.
- `NEXT_PUBLIC_META_PIXEL_ID` — optional until analytics scripts are intentionally enabled.

Never commit production secrets to GitHub.

## 2. Supabase database preflight

Completed on the dedicated NupsBox production project:

1. Confirmed project name/ref and database reachability.
2. Confirmed the initial remote migration history was empty and no Phase 1 object-name collisions existed.
3. Applied and aligned production migration history in this order:
   - `20260914000100_phase1_core_schema.sql`
   - `20260914000200_phase1_indexes_and_triggers.sql`
   - `20260914000300_rls_and_roles.sql`
   - `20260914000400_lead_rate_limit_rpc.sql`
   - `20260914000500_harden_role_helper_execute.sql`
4. Verified 15 application tables, 7 enums, expected functions/triggers/indexes, and 28 RLS policies.
5. Confirmed all 15 application tables have RLS enabled.
6. Confirmed `consume_lead_rate_limit` is executable by `service_role` and not by `anon`/`authenticated`.
7. Confirmed `current_app_role()` and `is_admin()` are not executable by `anon`; authenticated execution is intentional because the RLS policies use these caller-scoped helpers.
8. Ran a transactional production RLS smoke test: `anon` could read an active catalog fixture but could not read a CRM lead fixture; all fixtures were rolled back.
9. Generated fresh production TypeScript types and synchronized `types/database.ts`.
10. Reviewed security/performance advisors after DDL.

### RLS invariants verified remotely

- Anonymous users can read active/public catalog/content rows only through the intended public policies.
- Anonymous users cannot read CRM/admin data or invoke the privileged lead rate-limit RPC.
- `consume_lead_rate_limit` is service-role only.
- `lead_rate_limits` intentionally has RLS enabled with no client policy because it is server-only state.

### Advisor status

Security:

- Anonymous `SECURITY DEFINER` helper exposure: **resolved**.
- `lead_rate_limits` RLS-with-no-policy notice is intentional server-only behavior.
- Authenticated `SECURITY DEFINER` notices remain for `current_app_role()` and `is_admin()`; these helpers return only caller-scoped authorization state and are intentionally used by RLS.

Performance notices are currently non-blocking for Phase 1:

- foreign keys without covering indexes,
- one `auth.uid()` init-plan recommendation,
- multiple permissive SELECT policies,
- expected unused-index notices on a new empty production database.

Revisit these after real traffic/query plans are available or before Phase 1 scale-up.

## 3. Supabase Auth setup

Still required before launch:

- Production Site URL: `https://nupsbox.vn`.
- Add the exact production callback URL: `https://nupsbox.vn/auth/callback`.
- Add preview/local callback URLs only when needed for testing.
- Create or verify staff users in Supabase Auth.
- Ensure every staff user has a corresponding active row in `public.profiles`; authentication alone does not grant admin workspace access.
- Bootstrap the first `admin` profile through an authorized server/database operation, then manage later role changes through the admin contract.

Current production state: `auth.users = 0`, `public.profiles = 0`, active admins = 0.

## 4. Seed/content validation

The repository development seed has **not** been applied to production.

Before public launch:

- Confirm the Tân Phú address and contact channels are current.
- Confirm unit sizes, price fields and availability labels are accurate.
- Keep price fields null if no verified public price is available; the UI will show a contact-for-pricing state.
- Do not use `available_count` as a real-time stock guarantee unless the operational process is explicitly upgraded to maintain real-time inventory.
- Fill VI and EN alt text for public media where possible.
- Review FAQ answers in both languages.
- Confirm no fabricated ratings, reviews or customer logos are present.

The current development seed intentionally leaves phone, Zalo, public prices, and availability counts unset until approved production values are supplied.

## 5. Vercel/project preflight

**BLOCKED:** the current Vercel connector returns zero teams, so the intended NupsBox project cannot yet be verified or configured safely.

Before deployment:

1. Confirm the connected Vercel project is the project intended for NupsBox.
2. Confirm Git integration points to `giang0110/nupsbox`.
3. Configure the environment variables listed above for Production and appropriate Preview values.
4. Confirm the framework is detected as Next.js and Node 24 is supported by the project settings.
5. Deploy a Preview from the Phase 1 branch first.
6. Smoke-test VI and EN routes, `/sitemap.xml`, `/robots.txt`, lead submission, admin login and mobile navigation on Preview.
7. Only then promote/merge for Production.

## 6. Domain and HTTPS

- Add `nupsbox.vn` to the verified Vercel project.
- Configure DNS only after the target project has been confirmed.
- Ensure `https://nupsbox.vn` is the primary canonical domain.
- Redirect any `www` variant consistently to the chosen primary domain.
- Verify HTTPS certificate issuance before announcing launch.
- Re-check canonical/hreflang output on the live domain after DNS cutover.

## 7. Code quality gate

The exact commit being deployed must pass:

```text
npm ci
npm run lint
npm run typecheck
npm run test:run
npm run build
```

The database workflow must also apply the complete migration chain locally and pass the pgTAP schema/RLS contracts. Do not treat an older green run as evidence for a newer commit.

## 8. Production smoke tests

After deployment verify at minimum:

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

- Keep the previous Vercel production deployment available for instant rollback until smoke tests pass.
- Before future database migrations, record current migration history and confirm the database recovery path.
- Database rollback should be performed with an explicit forward/fix migration where possible; never edit already-applied migration files in production history.
- If lead submission fails after launch, keep public content online but remove/disable the lead CTA only through a reviewed deployment; never expose service credentials as a workaround.

## Go-live decision

Production may proceed only when all are true:

1. Exact-head CI and Database Tests are green.
2. The dedicated NupsBox Supabase project continues to pass migration/RLS verification.
3. Production Auth Site URL/callbacks and the first authorized admin are configured.
4. Approved production seed/content is loaded and reviewed.
5. The intended Vercel project and `nupsbox.vn` domain are verified.
6. Preview smoke tests pass.
