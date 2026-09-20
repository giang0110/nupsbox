# P3.25 — Pricing Launch Workflow

## Goal
Make pricing configuration safe and previewable without inventing unverified prices.

## Changes
- Pricing launch readiness across active location × active unit pairs
- live public-style preview in Admin pricing form
- client duplicate-pair warning and disabled submit
- server duplicate-pair precheck before insert
- save/create-and-preview flow to public pricing page
- verified-price vs contact-only mapping visibility

## Guardrails
- monthly price may remain blank and render as contact-for-pricing
- no schema/RLS/auth changes
- no realtime inventory claims
- existing unique database constraint remains the final integrity backstop
