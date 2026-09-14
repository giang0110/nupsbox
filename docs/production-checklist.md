# NupsBox Production Checklist

Last reviewed: 2026-09-14

## Current preflight status

- Code branch: `codex/phase-1-foundation`
- PR: #1 (draft)
- Canonical domain expected by application: `https://nupsbox.vn`
- Production deployment: **BLOCKED** until the correct NupsBox Supabase and Vercel connections are available.
- Supabase connector currently exposes only projects named `Bepnha` and `nuoidaycon`; do not apply NupsBox migrations to either project.
- Vercel connector currently exposes no team/project context; do not deploy by guessing a project ID.

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

Before any migration push:

1. Confirm the connected project name/ref is the dedicated NupsBox project.
2. Confirm the database is reachable and record the current migration history.
3. Confirm none of the four local migration versions already exist remotely under a different definition.
4. Apply migrations only in this order:
   - `20260914000100_phase1_core_schema.sql`
   - `20260914000200_phase1_indexes_and_triggers.sql`
   - `20260914000300_rls_and_roles.sql`
   - `20260914000400_lead_rate_limit_rpc.sql`
5. Run schema/RLS verification after migration and review Supabase security advisors.
6. Generate fresh TypeScript database types from the linked project and compare them with `types/database.ts` before replacing the bootstrap mirror.

### RLS invariants to verify remotely

- Anonymous users can read only active/public catalog and content rows.
- Anonymous users cannot read or mutate `leads`, `lead_notes`, `lead_status_history`, `profiles`, `audit_log`, or `lead_rate_limits`.
- `viewer` cannot access CRM leads.
- `staff` can read/update leads and catalog/content according to the permission contract.
- Only `admin` can mutate site settings or staff role assignments.
- `consume_lead_rate_limit` is executable by `service_role` only.

## 3. Supabase Auth setup

- Production Site URL: `https://nupsbox.vn`.
- Add the exact production callback URL: `https://nupsbox.vn/auth/callback`.
- Add preview/local callback URLs only when needed for testing.
- Create or verify staff users in Supabase Auth.
- Ensure every staff user has a corresponding active row in `public.profiles`; authentication alone does not grant admin workspace access.
- Bootstrap the first `admin` profile through an authorized server/database operation, then manage later role changes through the admin contract.

## 4. Seed/content validation

Before public launch:

- Confirm the Tân Phú address and contact channels are current.
- Confirm unit sizes, price fields and availability labels are accurate.
- Keep price fields null if no verified public price is available; the UI will show a contact-for-pricing state.
- Do not use `available_count` as a real-time stock guarantee unless the operational process is explicitly upgraded to maintain real-time inventory.
- Fill VI and EN alt text for public media where possible.
- Review FAQ answers in both languages.
- Confirm no fabricated ratings, reviews or customer logos are present.

## 5. Vercel/project preflight

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

Do not treat an older green CI run as evidence for a newer commit.

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
- Before database migration, capture the current migration history and ensure a database backup/recovery path is available.
- Database rollback should be performed with an explicit forward/fix migration where possible; never edit already-applied migration files in production history.
- If lead submission fails after launch, keep public content online but remove/disable the lead CTA only through a reviewed deployment; never expose service credentials as a workaround.

## Go-live decision

Production may proceed only when all three are true:

1. Exact-head CI is green.
2. The dedicated NupsBox Supabase project passes migration/RLS preflight.
3. The intended Vercel project and `nupsbox.vn` domain are verified.
