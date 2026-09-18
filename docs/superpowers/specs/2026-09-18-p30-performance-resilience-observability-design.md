# P3.0 Performance, Resilience & Observability — Design Specification

Date: 2026-09-18  
Repository: `giang0110/nupsbox`  
Base: `main@c053d6ad502394e9b41e86a6ffe3346f31c8809a`  
Phase: P3.0  
Status: Approved for implementation by continuation instruction

## 1. Purpose

P3.0 improves the public site's runtime quality after the P2.9 compact UX work. The goal is not more visual decoration; it is faster initial interaction, measurable field performance, and clearer recovery/loading states.

The current Core Web Vitals targets used for this phase are:

- LCP <= 2.5 s
- INP <= 200 ms
- CLS <= 0.1

The operational target is the 75th percentile, measured separately for mobile and desktop.

## 2. Fixed decisions

- No database migration.
- No production business-data write.
- No auth/RBAC/RLS changes.
- No new third-party analytics SDK or cookie.
- No PII, query strings, lead values, phone numbers, email addresses, or user identifiers in performance telemetry.
- Preserve P2.8 production fact safety.
- Preserve P2.9 six-block homepage composition.
- Preserve public routes and existing conversion intents.
- Performance telemetry is sampled and same-origin only.
- Telemetry failures must never block navigation or conversion.
- Admin/public error UIs must not expose raw exception messages.

## 3. Findings

### 3.1 Homepage hydration cost

`HomeChoiceHub` is a Client Component and currently imports Storage Finder, all unit-card code and all use-case code into the same client boundary even though only the Finder tab is initially visible.

P3.0 will split inactive tab content into lazy chunks and mount it only when selected.

### 3.2 No field performance telemetry

The application already has a small `dataLayer` event utility but does not persist Core Web Vitals. P3.0 will use Next.js `useReportWebVitals` in an isolated client component and send a small sampled payload to a same-origin API route. The server logs normalized metrics to Vercel runtime logs.

### 3.3 No App Router loading/error boundaries

There are no `loading.tsx` or `error.tsx` files. P3.0 will add public and admin boundaries so slow transitions and recoverable failures provide intentional UI instead of appearing frozen or dropping into generic framework output.

## 4. In scope

- Lazy-load inactive Choice Hub panels.
- Keep ARIA tab relationships and keyboard navigation.
- Add neutral loading placeholders for lazy panel activation.
- Add sampled public Web Vitals reporter.
- Add same-origin telemetry route with strict payload normalization.
- Add public route loading and error states.
- Add admin route loading and error states.
- Add unit tests for telemetry validation, tab lazy mounting and safe error UI source contracts.
- Document the new performance-observability baseline.

## 5. Out of scope

- Vercel Speed Insights package installation.
- Google Analytics / GTM installation.
- Session replay.
- User profiling.
- Storing telemetry in Supabase.
- CDN/domain changes.
- Font-family replacement.
- Database indexes or schema changes.
- Public business-content changes.

## 6. Telemetry contract

Client payload fields:

- `name`: one of CLS, FCP, INP, LCP, TTFB
- `id`: browser metric identifier, length-limited
- `value`: finite non-negative number
- `rating`: good / needs-improvement / poor
- `path`: pathname only, query/hash removed and length-limited

The client samples once per page runtime. Default sample rate: 25%.

Server behavior:

- POST only.
- Require same-origin `Origin` header.
- Reject oversized requests.
- Normalize/validate all fields.
- Log only the normalized payload.
- Return 204 on success.
- Never write to application data.

## 7. Choice Hub code-splitting contract

- Finder remains initial/default panel.
- Unit Types panel loads only after the Units tab becomes active.
- Use Cases panel loads only after the Use Cases tab becomes active.
- Inactive panel containers remain represented by their tabpanel IDs for ARIA relationships.
- Switching tabs remains keyboard accessible with ArrowLeft/ArrowRight/Home/End.
- A compact loading state is shown while a lazy panel chunk loads.

## 8. Resilience UI contract

Public loading state:
- neutral skeleton
- no business facts
- no fake prices/status

Public error state:
- bilingual based on active locale when available
- retry action
- safe link back to homepage/contact
- no raw error content

Admin loading state:
- shell-compatible cards/skeletons

Admin error state:
- concise failure message
- retry action
- safe link back to admin dashboard
- no raw exception content

## 9. Acceptance gates

Exact branch head must pass:

- `npm run lint`
- `npm run typecheck`
- `npm run test:run`
- `npm run build`
- P2.5 Playwright E2E
- Database Tests / pgTAP / RLS
- Preview smoke when Vercel quota permits

No merge if code build fails.
