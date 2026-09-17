# NupsBox Production Checklist

Last reviewed: 2026-09-17

## Current production baseline

- Production code baseline: `main` at `f0f323818d73be30ce65ef994634c042e62596bb`.
- P2.3 PR: `#13` merged.
- Canonical target domain: `https://nupsbox.vn`.
- Current Vercel production alias: `https://nupsbox.vercel.app`.
- Supabase project: `nupsbox` (`veglohnmofzkgovedxkb`).
- Latest applied feature migration: `20260915000400_phase2_light_booking_crm`.
- P2.3 Light Booking CRM is deployed to production.
- Production Auth users: `1`.
- Production profiles: `1`.
- Active admins: `1`.
- Locations: `0`.
- Unit types: `0`.
- FAQs: `0`.
- Blog posts: `0`.
- Site settings: `0`.
- Leads before P2.4 smoke: `0`.
- Appointments before P2.4 smoke: `0`.
- Business content has not yet been loaded into production.
- `nupsbox.vn` has not yet been cut over as the production domain.

Do not treat this document as proof of a setting that cannot be inspected directly. Vercel environment-variable presence, Supabase Auth Site URL/callback settings, DNS state, and authenticated role runtime behavior remain pending until verified by an authorized path.

## 1. Required production environment variables

Required names:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `LEAD_RATE_LIMIT_SALT`
- `NEXT_PUBLIC_SITE_URL`

Optional analytics variables remain optional until analytics is intentionally enabled:

- `NEXT_PUBLIC_GA4_ID`
- `NEXT_PUBLIC_META_PIXEL_ID`

Never print, commit, or expose server secrets. `SUPABASE_SERVICE_ROLE_KEY` must never appear in `NEXT_PUBLIC_*` or browser code.

## 2. Supabase database status

Verified production schema includes the Phase 1 foundation, Phase 2 CMS/CRM work, and P2.3 Light Booking CRM through migration `20260915000400_phase2_light_booking_crm`.

P2.3 production verification already established:

- `lead_appointments` has RLS enabled.
- `lead_appointment_history` has RLS enabled.
- `submit_public_lead_request(jsonb,jsonb)` is executable by `service_role`.
- The same RPC is not executable by `anon` or `authenticated`.
- Public booking requests are handled server-side; the browser does not receive the service-role key.

P2.4 must re-check these contracts after the production smoke rather than relying only on prior evidence.

No production DDL migration is planned for P2.4. If implementation reveals a real schema defect, stop and require a separate migration design, TDD/pgTAP proof, and explicit production migration approval.

## 3. Supabase Auth and admin bootstrap

Current production state:

- `auth.users = 1`
- `public.profiles = 1`
- active admins = `1`

Therefore the original Phase 1 blocker "create the first admin" is no longer current.

Still to verify before final go-live:

- Production Auth Site URL for the custom domain.
- Redirect/callback configuration if redirect/PKCE flows are used.
- Authenticated viewer/staff/admin runtime behavior where corresponding authorized test accounts or sessions exist.

Do not claim viewer/staff/admin runtime E2E as verified solely because local permission/RLS tests pass.

## 4. Production business data

Current production business-content counts are all zero:

- locations: `0`
- unit types: `0`
- FAQs: `0`
- blog posts: `0`
- site settings: `0`

Do not infer or invent factual business values. Explicit approval is required before inserting or publishing:

- physical address details;
- phone and Zalo contact details;
- business hours;
- unit type names, dimensions, or area;
- prices and pricing units;
- availability labels/counts;
- real media metadata;
- FAQ statements presented as NupsBox policy;
- blog/company factual claims.

If a price, stock/count, phone, Zalo, business-hours, or similar field has not been approved, leave the database value null and preserve the existing truthful fallback behavior.

## 5. Current Vercel state

Verified production project identity:

- Team slug: `ntg2299`
- Team ID: `team_PMOgG7NuBqEalFpTAxXzeBtf`
- Project slug: `nupsbox`
- Project ID: `prj_LPKSnGmLYdAGdNyoIUtiZ6CHCDsG`
- Production alias: `https://nupsbox.vercel.app`

P2.3 deployment on `main` has already reached Vercel production and prior production smoke verified public routing and anonymous admin protection.

Still pending for P2.4/go-live:

1. Verify required Production environment-variable names/presence without exposing values.
2. Prepare the `nupsbox.vn` domain cutover instructions from the verified Vercel project.
3. Do not guess DNS A/CNAME targets; use only values supplied by Vercel for this exact project/domain.
4. Confirm HTTPS after domain verification.

## 6. P2.4 safe production application smoke

P2.4 must prove the live application path against the real production database using a deterministic synthetic marker and exact-ID cleanup.

Required cases:

- Invalid public input returns HTTP `400` and creates no marked rows.
- A valid lead-only request returns HTTP `201` and creates exactly one marked lead.
- A valid lead + future viewing request returns HTTP `201`, creating exactly one marked lead and one pending customer appointment.
- The appointment has a corresponding immutable `created` history event.
- A deliberately invalid direct atomic RPC appointment fails and leaves zero orphan lead rows.
- Synthetic rows are deleted only after exact ID + marker ownership is re-verified.
- Cleanup failure is a failed gate and must not be hidden.

Do not intentionally test production HTTP `429`; rate-limit behavior remains a non-production/local contract check.

## 7. Post-smoke authorization and runtime checks

After the single production smoke run, re-check:

- RLS remains enabled on `lead_appointments` and `lead_appointment_history`.
- `submit_public_lead_request(jsonb,jsonb)` remains service-role only.
- Anonymous clients cannot directly read CRM lead/appointment data.
- `/admin` does not expose authenticated content to anonymous users.
- `/dat-kho` remains reachable and shows Light Booking.
- No new Vercel production runtime-error cluster is attributable to P2.4.
- Appointment history remains present for the created synthetic appointment before cleanup.

Authenticated viewer/staff/admin runtime E2E must be marked `PASS` only when corresponding authorized sessions actually exist; otherwise record `PENDING`.

## 8. Exact-head quality gates

Every functional P2.4 branch head considered for production smoke or merge must pass:

```text
npm ci
npm run lint
npm run typecheck
npm run test:run
npm run build
```

Database workflow must also apply the full local migration chain and pass pgTAP contracts, including `light_booking_contract.sql`.

For deployable changes, the exact branch head must also receive successful Vercel Preview status before the production smoke is run.

## 9. Domain and HTTPS cutover gate

`nupsbox.vn` remains the intended canonical domain, but P2.4 does not perform the actual cutover without a separate explicit approval.

Required order after all preceding readiness gates are green:

1. Confirm the exact Vercel team/project.
2. Verify required Production environment-variable names/presence without exposing secrets.
3. Add/verify `nupsbox.vn` in Vercel.
4. Decide primary host and `www` redirect behavior.
5. Apply only DNS records explicitly provided by Vercel for this domain/project.
6. Confirm HTTPS certificate issuance.
7. Update `NEXT_PUBLIC_SITE_URL` / canonical origin only after domain verification.
8. Re-run public VI/EN route, canonical, hreflang, sitemap, robots, JSON-LD, lead-path and anonymous-admin smoke checks on the custom domain.
9. Keep the previous working Vercel deployment available as rollback until post-cutover verification passes.

Actual domain/DNS cutover requires a separate explicit user approval.

## 10. Remaining go-live blockers

1. Safe production application-level lead/booking smoke and cleanup evidence.
2. Runtime/RLS/RPC verification after that smoke.
3. Approved factual production business content, or an explicit decision to launch with intentional null/contact fallbacks.
4. Vercel environment/domain verification without exposing secret values.
5. Separate approved `nupsbox.vn` DNS/HTTPS/canonical cutover.
6. Authenticated viewer/staff/admin runtime role E2E where test accounts/sessions are available; otherwise keep this sub-gate explicitly pending and rely only on local permission/RLS contracts.

## 11. P2.4 evidence record

Fill this section only with fresh verified results from the actual run:

```text
Production smoke run ID: PENDING
Exact SHA tested: PENDING
Lead-only: PENDING
Lead + appointment + history: PENDING
Atomic rollback: PENDING
Synthetic cleanup: PENDING
RLS/RPC verification: PENDING
Anonymous admin protection: PENDING
Runtime error check: PENDING
Viewer/staff authenticated runtime E2E: PENDING
```

## Rollback principles

- Keep the previous working Vercel production deployment available until all smoke checks pass.
- Prefer observation and reversible content writes over schema changes.
- Never broaden a synthetic cleanup predicate if an exact ID/marker check fails.
- Snapshot/count production business rows before any approved content write and verify counts afterward.
- Never expose service credentials to bypass a failed application path.
