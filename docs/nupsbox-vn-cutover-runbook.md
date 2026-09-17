# NupsBox.vn Cutover Runbook

Status: **PREPARED — NOT AUTHORIZED FOR CUTOVER**

This runbook prepares the final custom-domain step. It must not be executed until the preceding P2.4 readiness gates are green and a separate explicit approval is given.

1. Confirm Vercel project team `ntg2299` / project `nupsbox`.
2. Confirm production environment variable names/presence without printing secret values.
3. Add/verify `nupsbox.vn` in Vercel.
4. Decide primary host and `www` redirect behavior.
5. Copy DNS records only from Vercel's verified domain instructions; do not guess A/CNAME targets.
6. Confirm HTTPS certificate is issued.
7. Update `NEXT_PUBLIC_SITE_URL` / canonical origin only after domain verification.
8. Deploy/redeploy the exact approved `main` head if the environment change requires it.
9. Smoke public VI/EN routes, sitemap, robots, canonical, hreflang, JSON-LD, `/dat-kho`, `/api/leads` invalid-input behavior, and anonymous `/admin` protection on the custom domain.
10. Keep the prior Vercel production deployment as rollback until post-cutover smoke passes.

## Required post-cutover checks

- `/` and `/en` return the expected production pages.
- Storage, pricing, location, FAQ, contact, and booking routes are reachable in both supported locales where applicable.
- Canonical URLs use the approved primary host.
- `hreflang` pairs use the approved host.
- `/sitemap.xml` and `/robots.txt` reference the intended production origin.
- JSON-LD contains no stale Vercel alias where the canonical custom domain is required.
- `/dat-kho` behavior remains consistent with the current indexing decision.
- Invalid `/api/leads` input is rejected without creating a lead.
- Anonymous `/admin` does not expose authenticated content.
- HTTPS is valid on the primary host and the `www` redirect behavior is consistent with the approved decision.

## Rollback

Keep the previously working Vercel production deployment available until every post-cutover check passes. If the custom domain or canonical-origin verification fails, restore the last verified configuration rather than guessing DNS or application values.

Actual domain/DNS cutover requires a separate explicit user approval.
