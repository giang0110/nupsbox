# P3.37 — Final Production Readiness

## Findings addressed
- bilingual Blog create/update previously used multiple independent database statements and could leave partial state if the second write failed
- telemetry limited JavaScript string length rather than UTF-8 bytes and did not require JSON content type
- CMS text/JSON fields had several unbounded inputs
- failed media metadata inserts attempted Storage cleanup but did not surface cleanup failure, making orphan files hard to diagnose

## Changes
- transactional SECURITY INVOKER RPCs for bilingual Blog create/update; existing RLS remains authoritative
- strict CMS field/body size bounds
- telemetry JSON/content-length/UTF-8 byte guards
- explicit media upload rollback diagnostics

## Guardrails
- no catalog facts, prices, availability or public content changed
- no role or RLS expansion
- no service-role access added to Blog mutations
- all changes require CI, E2E and pgTAP success before merge
