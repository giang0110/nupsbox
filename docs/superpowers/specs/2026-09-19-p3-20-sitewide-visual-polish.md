# P3.20 — Sitewide Visual Polish & Real Imagery

## Goal
Make NupsBox feel like one premium, coherent storage brand across public pages and Admin without inventing facility facts, pricing or imagery.

## Public experience
- tighten shared section rhythm to reduce long scrolling
- refine PageIntro and SectionHeading typography/composition
- use real CMS warehouse media on Locations and About
- refine unit/location cards
- make Storage Finder navigation feel less like a SaaS dashboard
- reduce mobile action-bar visual weight
- add consistent conversion close to Pricing and Locations

## Admin
- replace placeholder first-letter navigation marks with meaningful functional icons
- preserve existing information architecture, permissions and routes

## Data guardrails
- use only public media already linked to the active location
- no new claims about security, opening hours, availability, capacity or pricing
- no schema/RLS/auth changes
- no generated or stock warehouse imagery

## QA
- lint
- typecheck
- unit/integration suite
- production build
- Playwright E2E
- database/pgTAP contract suite
