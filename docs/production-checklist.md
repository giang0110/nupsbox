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
- Appointment-history rows before P2.4 smoke: `0`.
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

Verified production schema includes the Phase 1 foundation, Phase 2 CMS/CRM work, and P2.3 Light Booking CRM through migration named `20260915000400_phase2_light_booking_crm` (recorded by the current Supabase connector under migration version `20260917033310`).

Fresh P2.4 post-smoke verification established:

- `leads` has RLS enabled and only authenticated CRM policies.
- `lead_appointments` has RLS enabled and only authenticated policies.
- `lead_appointment_history` has RLS enabled and only authenticated read policy.
- `submit_public_lead_request(jsonb,jsonb)` is executable by `service_role`.
- The same RPC is not executable by `anon` or `authenticated`.
- Public booking requests remain server-side; no service-role credential was sent to the browser or committed to GitHub.

No production DDL migration was applied by P2.4. If a future implementation reveals a schema defect, require a separate migration design, TDD/pgTAP proof, and explicit production migration approval.

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

### Existing static factual content requiring confirmation

The live production HTML/JSON-LD currently contains the static address `1/1 Nguyễn Hữu Tiến, Tây Thạnh, Tân Phú, TP.HCM` even though production `locations = 0`. This predates P2.4 and is not treated as approved business data. Confirm it explicitly or remove/replace that static claim before final go-live/domain cutover.

The live booking page currently receives null phone/Zalo fallbacks from production settings, consistent with `site_settings = 0`.

## 5. Current Vercel state

Verified production project identity:

- Team slug: `ntg2299`
- Team ID: `team_PMOgG7NuBqEalFpTAxXzeBtf`
- Project slug: `nupsbox`
- Project ID: `prj_LPKSnGmLYdAGdNyoIUtiZ6CHCDsG`
- Production alias: `https://nupsbox.vercel.app`

P2.4 exact functional tooling head `22965e40ce08ee7318fe6d7159156c6d49875c42` passed the full application quality gate, full local Supabase pgTAP workflow, exact-head Vercel deployment status, Preview route smoke, and anonymous-admin Preview protection before the production smoke was executed.

Fresh production health after the P2.4 smoke:

- `/vi/dat-kho`: HTTP `200`, Light Booking form present.
- `/admin` anonymous request resolves to the admin login surface (`/auth/login`) and does not expose authenticated workspace content.
- Vercel runtime error clusters for the checked 30-minute window: none found.

Still pending for final go-live:

1. Verify required Production environment-variable names/presence without exposing values.
2. Confirm the Auth custom-domain Site URL/callback settings where applicable.
3. Perform the separately approved `nupsbox.vn` domain cutover only after business-content decisions are resolved.
4. Confirm HTTPS after domain verification.

## 6. P2.4 safe production application smoke

Production smoke run `20260917T-P24-001` was executed once against `https://nupsbox.vercel.app` while the production application baseline remained `main` at `f0f323818d73be30ce65ef994634c042e62596bb`.

Verified results:

- Invalid public input returned HTTP `400` and created no marked row.
- Valid lead-only request returned HTTP `201` and created exact lead `d39e3885-72ca-49bc-914e-7fa6c757bbfd` with marker `p24-smoke:20260917T-P24-001`.
- Valid lead + future viewing request returned HTTP `201`, creating lead `20b68e30-fdd3-40c9-82ed-ce64bfb60e9a` and pending customer appointment `bc76214d-235d-4240-bd5d-778d20808f44` with marker `p24-smoke:20260917T-P24-001:booking`.
- Appointment history contained exactly one matching `created` event before cleanup (`736f5628-e133-451d-9232-39a968f211d7`).
- A direct production RPC call with a past appointment time failed with SQLSTATE `23514` / `active appointment scheduled_at must be in the future`.
- Follow-up query after the failed RPC showed `atomic_leads = 0` and `atomic_appointments = 0`, proving transaction rollback.
- Cleanup first re-verified exact IDs, markers, source and history ownership, then deleted history -> appointment -> leads.
- Fresh post-cleanup query showed marked leads/appointments/history all `0` and total production leads/appointments/history restored to `0/0/0`.

The HTTP smoke intentionally sent only two valid production submissions and was not retried. Production HTTP `429` was not intentionally triggered.

## 7. Post-smoke authorization and runtime checks

Fresh post-smoke checks:

- RLS on `leads`: `PASS`.
- RLS on `lead_appointments`: `PASS`.
- RLS on `lead_appointment_history`: `PASS`.
- Public RPC service-role-only permissions: `PASS`.
- Anonymous direct CRM read exposure through table policies: no anonymous policy found on the checked CRM tables.
- `/admin` anonymous protection: `PASS` — login surface returned, authenticated admin workspace not exposed.
- `/vi/dat-kho` production health: `PASS` — HTTP `200`, Light Booking UI present.
- Appointment `created` history before cleanup: `PASS`.
- Synthetic cleanup: `PASS` — zero residual marked rows.
- Vercel runtime-error check: `PASS` — no runtime error cluster found in the selected 30-minute window.
- Authenticated viewer/staff/admin runtime E2E: `PENDING` — only the active admin bootstrap is currently known; no authorized viewer/staff sessions were available for a truthful runtime E2E claim.

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

Before the production smoke, exact functional tooling head `22965e40ce08ee7318fe6d7159156c6d49875c42` passed all of those gates plus exact-head Vercel/Preview smoke. After this evidence/documentation update, the final branch head must run CI and Database Tests again; documentation-only final commits must not cause another production write smoke.

## 9. Domain and HTTPS cutover gate

`nupsbox.vn` remains the intended canonical domain, but P2.4 does not perform the actual cutover without a separate explicit approval.

Required order after all preceding readiness gates are green:

1. Confirm the exact Vercel team/project.
2. Verify required Production environment-variable names/presence without exposing secrets.
3. Resolve approved business factual content, including the current static JSON-LD address decision.
4. Add/verify `nupsbox.vn` in Vercel.
5. Decide primary host and `www` redirect behavior.
6. Apply only DNS records explicitly provided by Vercel for this domain/project.
7. Confirm HTTPS certificate issuance.
8. Update `NEXT_PUBLIC_SITE_URL` / canonical origin only after domain verification.
9. Re-run public VI/EN route, canonical, hreflang, sitemap, robots, JSON-LD, lead-path and anonymous-admin smoke checks on the custom domain.
10. Keep the previous working Vercel deployment available as rollback until post-cutover verification passes.

Actual domain/DNS cutover requires a separate explicit user approval.

## 10. Remaining go-live blockers

1. Approve factual production business content, or explicitly decide which null/contact fallbacks are acceptable at launch; specifically confirm or remove the current static JSON-LD address.
2. Verify Vercel Production environment-variable names/presence without exposing secret values.
3. Verify Supabase Auth custom-domain Site URL/callback configuration where applicable.
4. Run authenticated viewer/staff/admin runtime role E2E when corresponding authorized accounts/sessions exist; until then this sub-gate remains `PENDING` rather than guessed.
5. Separately approve and execute `nupsbox.vn` DNS/HTTPS/canonical cutover, then run the custom-domain post-cutover smoke suite.

The safe production lead/booking smoke, atomic rollback, cleanup, RLS/RPC checks, anonymous admin protection, Light Booking page health and immediate runtime-error check are no longer blockers; they passed in P2.4.

## 11. P2.4 evidence record

```text
Production smoke run ID: 20260917T-P24-001
Production application SHA tested: f0f323818d73be30ce65ef994634c042e62596bb
P2.4 exact functional tooling head before smoke: 22965e40ce08ee7318fe6d7159156c6d49875c42
Invalid public input: PASS (HTTP 400, zero marked rows)
Lead-only: PASS (HTTP 201 + exact marked lead verified)
Lead + appointment + history: PASS (HTTP 201 + pending customer appointment + created history verified)
Atomic rollback: PASS (23514 validation failure + zero orphan lead/appointment)
Synthetic cleanup: PASS (marked rows zero; total production CRM rows restored to 0/0/0)
RLS/RPC verification: PASS
Anonymous admin protection: PASS (/admin resolves to login surface, no authenticated workspace exposed)
/dat-kho production health: PASS (HTTP 200, Light Booking present)
Runtime error check: PASS (no Vercel runtime error clusters in selected 30-minute window)
Viewer/staff authenticated runtime E2E: PENDING (no authorized corresponding sessions available)
Business-data seed: NOT PERFORMED / PENDING APPROVAL
nupsbox.vn cutover: NOT PERFORMED / REQUIRES SEPARATE EXPLICIT APPROVAL
```

## Rollback principles

- Keep the previous working Vercel production deployment available until all post-cutover smoke checks pass.
- Prefer observation and reversible content writes over schema changes.
- Never broaden a synthetic cleanup predicate if an exact ID/marker check fails.
- Snapshot/count production business rows before any approved content write and verify counts afterward.
- Never expose service credentials to bypass a failed application path.
