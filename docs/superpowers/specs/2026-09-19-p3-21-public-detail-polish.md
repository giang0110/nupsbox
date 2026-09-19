# P3.21 — Public Detail & Content Polish

## Goal
Complete the visual and SEO system on public detail/content routes that were less refined than the homepage and primary landing pages.

## Changes
- redesign mini-storage detail with shared PageIntro/Section system
- add real location-scoped CMS gallery to location detail
- add explicit public empty state when a location has no active unit types
- add closing conversion CTA to location detail and blog detail
- align Blog index with shared public visual system
- add Blog index metadata
- add breadcrumb structured data to Blog detail
- add route-specific metadata to all four solution detail pages
- refine solution journey presentation without inventing facts

## Data guardrails
- do not attach location images to a specific unit type unless media is explicitly unit-linked
- do not activate unpublished catalog records
- do not invent prices, availability, capacity, opening hours or security claims
- no schema/RLS/auth changes

## QA
- lint
- typecheck
- unit/integration
- build
- Playwright
- database/pgTAP
