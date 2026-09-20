# P3.23 — Catalog Launch Readiness

## Goal
Make the shortest safe Admin path from an existing facility to a usable public catalog.

## Workflow
1. Active location
2. Published Unit Type
3. Location × Unit Type pricing mapping
4. Public catalog preview

## UX changes
- Catalog launch progress and next-step CTA
- Pricing page prerequisite cards
- Pricing create form is hidden until active location + active unit exist
- Active Unit Type links directly into preselected pricing creation
- Query parameters can preselect active unit/location in the pricing form

## Guardrails
- no automatic catalog publication
- no fake prices; monthly price may remain blank/contact
- no schema/RLS/auth changes
- only active locations and active units can be used for new pricing mappings
