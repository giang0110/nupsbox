# P3.1 Accessibility & Security Hardening — Implementation Plan

## Task 1 — Security response headers

Files:
- Create `features/security/headers.ts`
- Modify `next.config.ts`
- Add `tests/unit/security-headers.test.ts`

Add a small exported header policy and apply it globally through Next.js `headers()`.

## Task 2 — Public keyboard bypass and focus visibility

Files:
- Modify `app/[locale]/layout.tsx`
- Modify `components/marketing/locale-switcher.tsx`
- Modify `components/marketing/site-header.tsx`
- Modify `components/marketing/site-footer.tsx`
- Modify `components/marketing/mobile-action-bar.tsx`
- Add `tests/unit/public-shell-accessibility.test.ts`

Add a visible-on-focus skip link before repeated public navigation and improve focus-visible styles on controls that currently rely on browser defaults.

## Task 3 — Admin keyboard bypass

Files:
- Modify `components/admin/admin-shell.tsx`
- Modify `tests/unit/admin-shell-accessibility.test.tsx`

Add a skip link that targets a focusable admin content container.

## Task 4 — Verification

Run exact-head quality, E2E and Database gates. Merge only after code gates are green.
