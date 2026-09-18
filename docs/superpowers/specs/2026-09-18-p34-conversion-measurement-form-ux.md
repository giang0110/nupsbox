# P3.4 Conversion Measurement & Form UX

Date: 2026-09-18  
Base: `main@f45bfaab7c533b1264bd7a4ff3fc3afc748bde9b`

## Goal

Measure real public conversion outcomes and reduce mobile/form friction without changing the lead API payload or CRM behavior.

## Scope

- Emit the existing `lead_submit` analytics event for success, server error, rate limit, viewing validation error and network error.
- Analytics payload contains only non-sensitive funnel context: outcome, locale, mode, whether a unit/location was selected, need type, estimated volume and whether a viewing was requested.
- Never send name, phone, email, message, referrer value, appointment note or other PII to analytics.
- Preserve the exact public API request payload.
- Keep a stable form element reference across the async request before resetting.
- Move keyboard focus to success/error feedback after submit.
- Add tracked Phone/Zalo links for mobile action bar and footer.
- Reduce mobile action bar from two rows to one row when a contact action exists.
- Localize mobile/footer navigation accessibility labels.

## Guardrails

- No database migration or production write outside normal existing lead submission.
- No API schema or CRM payload change.
- No auth/RBAC/RLS change.
- No additional required form fields.
- No advertising identifier or PII in analytics.

## Acceptance

- Successful lead submission emits `lead_submit` with `outcome: success`.
- Failed outcomes emit the same event with a non-sensitive outcome value.
- Success/error feedback receives focus after state transition.
- Phone/Zalo clicks emit their existing analytics events with placement only.
- Mobile quick-action bar stays one row at mobile width when contact is available.
- Exact-head lint, typecheck, unit/integration tests, build, E2E and Database Tests pass.
