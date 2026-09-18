# P3.1 Accessibility & Security Hardening — Design Specification

Date: 2026-09-18
Repository: `giang0110/nupsbox`
Base: `main@291da246f115da32f2b8f9de14687732ae2fa40e`
Phase: P3.1
Status: Approved for implementation by continuation instruction

## Purpose

P3.1 hardens navigation accessibility and baseline HTTP response security without changing application business logic.

The accessibility work follows WCAG 2.4.1 guidance by providing a direct way for keyboard users to bypass repeated navigation and move focus to the main content.

## Fixed decisions

- No database migration.
- No production data mutation.
- No auth/RBAC/RLS changes.
- No Content-Security-Policy in this phase because Next.js runtime/inline script requirements need a dedicated nonce-based design.
- No HSTS change in source; TLS/HSTS remains deployment-platform responsibility.
- No business-content changes.
- Preserve all existing public/admin routes.
- Skip links must be the first useful interactive control in their shell.
- Security headers must apply consistently to public, auth and admin routes.

## In scope

- Public skip-to-content link and focusable content target.
- Admin skip-to-content link and focusable content target.
- Stronger focus-visible treatment for locale/mobile/footer navigation controls.
- Baseline response headers:
  - X-Content-Type-Options: nosniff
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  - X-Frame-Options: SAMEORIGIN
- Unit/source tests for accessibility and headers.

## Out of scope

- CSP/nonces.
- OAuth popup changes.
- PWA installation.
- New tracking.
- Domain cutover.
- Visual redesign.

## Acceptance gates

Exact branch head must pass lint, typecheck, unit/integration tests, build, P2.5 E2E and Database Tests. Preview smoke is desirable when Vercel quota permits.
