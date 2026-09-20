# P3.22 — Public Readiness & Conversion Foundation

## Goal
Turn the current production site from a polished shell into a more operationally ready conversion system without adding unnecessary schema.

## Scope
- Admin Public Readiness Center with weighted readiness score
- Unit Type publication checklist + public preview
- server-side publication guard for incomplete Unit Types
- Finder empty-state conversion path when no public units exist
- cumulative CRM conversion funnel derived from existing lead statuses
- preserve existing event taxonomy for pre-lead Finder/quote/viewing events

## Guardrails
- no automatic publication of business data
- no invented prices, capacity or availability
- no new database schema in this phase
- publish guard only checks core public fields; capacity note remains optional

## QA
- unit tests for readiness scoring, unit publish readiness and cumulative funnel
- source contract tests for Admin/Finder wiring
- lint, typecheck, build, Playwright and pgTAP
