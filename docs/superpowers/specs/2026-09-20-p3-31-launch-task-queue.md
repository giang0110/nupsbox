# P3.31 — Launch Task Queue

## Goal
Turn existing catalog readiness signals into a single prioritized action queue so Admin users can move the real catalog toward launch without manually interpreting multiple status panels.

## Changes
- add a prioritized Launch Task Queue to Catalog Admin
- order tasks by launch dependency: Location → Unit Type → Pricing → Media
- link each task directly to the relevant Admin screen
- derive all tasks from current database-backed readiness summaries
- show public preview shortcuts when no core launch tasks remain

## Guardrails
- no schema, RLS or auth changes
- no automatic publishing
- no generated business facts, prices, capacity or availability
- no synthetic catalog records

## QA
- lint
- typecheck
- unit/integration tests
- build
- Playwright
- database/pgTAP
