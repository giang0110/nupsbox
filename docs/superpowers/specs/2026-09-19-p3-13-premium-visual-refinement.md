# P3.13 Premium Visual & Conversion Refinement

Date: 2026-09-19

## Goal

Raise the public site from a card-heavy product UI toward a more premium warehouse-service experience while preserving the existing conversion funnel, CMS contracts, permissions and database schema.

## Scope

- Move the warehouse gallery directly after the Hero when public media exists.
- Make the Hero secondary CTA context-aware: real-space gallery when available, pricing otherwise.
- Upgrade the public warehouse gallery with a cinematic presentation, thumbnails and accessible full-screen lightbox.
- Reduce the mobile persistent conversion bar to two primary actions: Finder and Contact.
- Put quote/viewing plus Phone/Zalo/Facebook inside a compact contact sheet instead of three equally weighted buttons.
- Surface P3.12 Action Center in the Admin sidebar.
- Refine Admin shell branding/density without changing authorization or navigation behavior.
- Use https://nupsbox.vn as the canonical origin fallback when NEXT_PUBLIC_SITE_URL is not configured.

## Guardrails

- No migration.
- No auth/RBAC/RLS changes.
- No change to lead submission payload.
- No new analytics PII.
- No invented warehouse facts or images.
- Gallery remains hidden if no approved public media exists.
- Existing Vercel/Supabase production behavior stays intact.

## Acceptance

- Homepage first-scroll order is Hero → real warehouse gallery (when available) → Finder/choice hub.
- Hero still falls back to Pricing when no gallery exists.
- Gallery supports Escape and arrow-key navigation in full-screen mode.
- Mobile conversion chrome remains one row and exactly two primary columns.
- Direct contact channels are hidden inside the Contact sheet until opened.
- Admin Action Center is accessible from the sidebar for roles with dashboard:read.
- Canonical fallback is nupsbox.vn.
- Lint, typecheck, tests, build, E2E, Database Tests and Preview smoke pass before merge.
