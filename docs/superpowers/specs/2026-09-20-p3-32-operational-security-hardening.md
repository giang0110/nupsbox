# P3.32 — Operational Security & Production Hardening

## Scope
Full production-readiness pass across public API ingress, authentication callback behavior, admin input validation, database access boundaries, foreign-key performance, and CI/CD workflow permissions.

## Fixed
- add baseline response security headers (HSTS, clickjacking, MIME sniffing, referrer, permissions and CSP navigation/object boundaries)
- remove stale onboarding Supabase image origin
- require same-origin JSON requests for public lead submission
- reject oversized lead payloads and return Retry-After for rate limiting
- fail closed on missing/failed auth callback code exchange
- validate Location Zalo URL as HTTP/HTTPS only and bound important catalog text fields
- reject stale/past public viewing appointment requests on the server
- add covering indexes for all foreign keys reported by Supabase Advisor
- optimize profiles_self_read to evaluate auth.uid() once per statement
- revoke client table privileges from server-only lead_rate_limits
- use least-privilege GitHub Actions permissions
- align production lead smoke checks with same-origin API policy

## Reviewed and retained intentionally
- public.current_app_role() and public.is_admin() remain SECURITY DEFINER because RLS policies depend on them. They return only the caller's own role/admin boolean, anon EXECUTE is revoked, and no privilege escalation was found.
- public content policies that overlap authenticated/public reads are performance warnings, not data-exposure findings; changing them could alter public behavior for authenticated-but-inactive sessions, so they are not changed in this pass.
- leaked-password protection is a Supabase Auth project setting and must be enabled in the Supabase dashboard; no safe repository-only mutation exists in the available tooling.

## Guardrails
- no business facts, pricing, availability or catalog data changed
- no role expansion
- no service-role key moved client-side
- no destructive schema changes
