# P3.24 — Unit Type Launch Workflow

## Goal
Make Unit Type creation and publication clear enough to operate without remembering field dependencies.

## Changes
- Unit Type launch summary: total, draft, ready draft, active
- next-action CTA based on saved data
- bilingual saved-draft preview before publish
- publish-required helper text for recommendation fields
- publish action can continue directly to Pricing with the published unit preselected

## Guardrails
- no auto-generated business data
- no auto-publish
- no schema/RLS/auth changes
- capacity notes remain optional
