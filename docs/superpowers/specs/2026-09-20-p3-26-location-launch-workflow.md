# P3.26 — Location Launch Workflow

## Goal
Make each facility easy to assess and move through the launch path without turning optional quality fields into hard publish blockers.

## Changes
- per-location quality/readiness: public media, direct contact, coordinates, opening hours, pricing
- bilingual saved-location preview inside Admin
- active location quick actions: Media, Pricing, Public preview
- publish & continue directly to location-scoped Media CMS
- Media CMS supports location-focused view and preselects that location on upload
- location overview reports active facilities, facilities with public media and facilities with pricing mappings

## Guardrails
- coordinates, opening hours, media and direct contact improve quality but do not block publication
- no invented operating hours, phone, Zalo, coordinates or pricing
- no schema/RLS/auth changes
