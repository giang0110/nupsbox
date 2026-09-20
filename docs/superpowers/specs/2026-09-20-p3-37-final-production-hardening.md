# P3.37 — Final Production Hardening

## Findings addressed
- Production telemetry showed one 404 at `/en/about`; add a permanent redirect to the canonical `/en/about-nupsbox` route.
- Web-vitals telemetry accepted non-JSON content types and bounded JS characters rather than UTF-8 bytes; align it with the hardened lead API.
- Production smoke now covers the observed legacy route.

## Verified before change
- 30/30 current sitemap URLs return HTTP 200.
- Production runtime has no 5xx error clusters in the last 24 hours.
- Four observed 400 responses on `/api/leads` are expected negative production-smoke probes.
- Business-data integrity checks found no missing blog translations, broken media metadata references, invalid active catalog records, invalid pricing, or stale open appointments.
- Three Storage files without media metadata are legacy orphan files from 2026-09-19; current upload code already performs compensating cleanup if metadata creation fails. They are not referenced by `media_assets`.

## Guardrails
- no business facts or catalog data changed
- no auth/RLS expansion
- no destructive database changes
