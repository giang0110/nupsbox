# NupsBox Phase 2 — Conversion & Operations Design Specification

**Approved direction:** 2026-09-14  
**Status:** Awaiting written-spec review  
**Project:** NupsBox (`nupsbox.vn`)  
**Prerequisite:** Phase 1 must be production-ready and merged before Phase 2 implementation starts.

## 1. Purpose

Phase 2 turns the Phase 1 NupsBox website and read-oriented admin workspace into a practical operating system for content, catalog and lead handling without introducing online booking, payment or real-time inventory claims.

The target outcome is a small, reliable internal CMS + CRM that improves conversion and day-to-day operations while preserving the existing security model:

- Next.js App Router remains the application framework.
- Supabase remains the source of truth.
- Postgres RLS remains the final authorization layer.
- Admin mutations run server-side only.
- Vercel remains the deployment platform.
- Vietnamese remains the default locale; English stays under `/en`.

Phase 2 must not weaken any Phase 1 public, security, SEO or deployment guarantees.

## 2. Preconditions and branch strategy

Phase 2 implementation must not be stacked onto PR #1.

Before implementation begins:

1. Close the remaining Phase 1 production blockers.
2. Merge the approved Phase 1 branch into `main`.
3. Confirm `main` is green after merge.
4. Create the Phase 2 implementation branch from that updated `main`.

This design document may exist on a documentation-only branch before the Phase 1 merge. Implementation code and Phase 2 database migrations must not start from that documentation branch.

The intended implementation sequence is:

```text
Phase 1 production gates
→ merge Phase 1 to main
→ create Phase 2 branch from updated main
→ P2.1 Data model & permissions
→ P2.2 Catalog & Content CMS
→ P2.3 CRM enhancement
→ P2.4 Attribution & Analytics
→ P2.5 Hardening & release
```

Each subphase must pass its own quality gate before the next subphase begins.

## 3. Phase 2 goals

Phase 2 includes four product capabilities:

### 3.1 Operational CMS

Convert the existing admin catalog/content read surfaces into controlled create/edit/publish workflows for:

- locations,
- unit types,
- location-specific pricing and public availability labels,
- FAQs,
- blog posts,
- media metadata,
- public site settings.

### 3.2 Internal CRM

Extend lead handling with:

- lead detail pages,
- a defined status pipeline,
- staff assignment,
- internal notes,
- immutable status history,
- search and filters,
- permission-controlled CSV export.

### 3.3 Attribution and analytics

Add privacy-conscious conversion telemetry and source attribution through:

- GA4 when configured,
- Meta Pixel when configured,
- server-captured UTM/referrer/landing-page data already stored with leads,
- admin summaries by source/campaign/status.

### 3.4 Operational hardening

Add the tests, RLS contracts, auditability, indexes and release gates needed to operate these features safely.

## 4. Explicit non-goals

Phase 2 does **not** include:

- real-time inventory,
- guaranteed availability counts,
- online reservation,
- deposits or payment,
- automated email/SMS/Zalo sequences,
- external CRM synchronization,
- customer portal,
- staff user lifecycle administration beyond what is required to assign existing active profiles,
- fabricated reviews, ratings, customer logos or operational claims.

These belong to a later phase only after the operating data and business process support them.

## 5. Architecture

The existing architecture is preserved.

### 5.1 Public request flow

```text
Browser
→ public Next.js route / server endpoint
→ input validation
→ server-side Supabase access where required
→ Postgres RLS / service-only RPC where appropriate
→ database
```

The browser must never receive or use the Supabase service-role credential.

### 5.2 Admin mutation flow

```text
Authenticated admin page
→ Server Action
→ input validation
→ requireAdminUser()
→ can(session.role, permission)
→ authenticated Supabase server client
→ Postgres RLS
→ domain mutation
→ audit/history write in the same logical operation
→ revalidation / redirect
```

Application permission checks provide fast denial and clear UX. RLS remains authoritative if application code is bypassed.

### 5.3 Read model strategy

Admin pages remain server-rendered and use focused server-side read adapters. React Query or an additional client-state framework is not introduced in Phase 2.

Large lists must use deterministic server-side ordering and pagination. Reads should select explicit fields rather than broad `select('*')` once the final Phase 2 schema is known.

## 6. Roles and permissions

The existing roles remain:

- `admin`
- `staff`
- `viewer`

No fourth role is introduced in Phase 2.

### 6.1 Permission vocabulary

Phase 2 standardizes these capability names:

```text
catalog:read
catalog:create
catalog:update
catalog:publish
content:read
content:create
content:update
content:publish
media:read
media:update
settings:read
settings:update
leads:read
leads:update
leads:assign
leads:note
leads:export
```

Existing Phase 1 permission names should be reused where equivalent. The implementation plan must first inspect the current `can()` contract and extend it rather than creating a parallel authorization system.

### 6.2 Approved role matrix

`admin` receives all Phase 2 permissions.

`staff` receives:

```text
catalog:read
catalog:create
catalog:update
catalog:publish
content:read
content:create
content:update
content:publish
media:read
media:update
settings:read
leads:read
leads:update
leads:assign
leads:note
```

`staff` does **not** receive:

```text
settings:update
leads:export
```

`viewer` receives read-only access:

```text
catalog:read
content:read
media:read
settings:read
leads:read
```

`viewer` receives no mutation, assignment, note or export permission.

The matrix must be encoded once in the shared authorization module and covered by unit tests plus RLS tests. Any later expansion of staff permissions requires a separately approved behavior change.

## 7. CMS design

### 7.1 Locations

Admin and staff with the approved catalog permissions must be able to create and edit location records using the fields supported by the live schema, including where present:

- VI/EN display names,
- slug,
- address,
- VI/EN description,
- active/inactive state,
- display order,
- basic SEO fields.

Rules:

- Slugs must be unique within the entity type.
- Locations referenced by historical data should be deactivated rather than hard-deleted.
- No location may publish fabricated operating details.
- A slug may be changed before first publication; once a public location has been published, Phase 2 treats that slug as immutable. Redirect-aware slug changes are deferred to a separately designed feature.

### 7.2 Unit types

Manage:

- VI/EN name,
- slug,
- area,
- dimensions when supported,
- VI/EN description,
- featured state,
- display order,
- active/public state.

Rules:

- Numeric dimensions and prices cannot be negative.
- Existing public URLs must remain stable when editing non-slug fields.
- A slug may be changed before first publication; once a public unit type has been published, Phase 2 treats that slug as immutable. Redirect-aware slug changes are deferred.

### 7.3 Location-specific pricing and availability labels

Manage the existing location-unit relationship rather than duplicating price data into unit types.

Admin and authorized staff may edit supported fields such as:

- public price amount,
- price unit/period,
- public availability label,
- public visibility/status,
- display order or featured state where supported.

Phase 2 must not expose a field as real-time stock unless the business establishes a reliable inventory process. If no verified price exists, the public UI keeps its contact-for-pricing fallback.

### 7.4 FAQ

Manage bilingual FAQ content and active state.

Publication rules:

- a public FAQ must have the required question/answer content for its configured locale behavior,
- inactive FAQs must not render publicly,
- ordering must be deterministic.

### 7.5 Blog

Blog workflow:

```text
draft → published → archived
```

Required properties for publication:

- title,
- slug,
- content/body,
- locale or bilingual content according to the existing schema,
- publication status.

Optional fields may include excerpt, featured media and SEO metadata if supported by the live schema.

A blog slug may be changed while the post has never been published. Once published, the slug is immutable in Phase 2. Published posts should normally be archived rather than hard-deleted to preserve URL/history behavior.

### 7.6 Media metadata

Phase 2 manages metadata for existing media records. It does not require building a new binary storage platform if Phase 1 already has a media/storage approach.

Admin and authorized staff should be able to manage supported metadata such as:

- title/label,
- VI alt text,
- EN alt text,
- public usage state,
- entity association where the schema supports it.

The content QA surface should continue to flag missing alt text.

### 7.7 Site settings

Only settings explicitly classified as public business/site settings are editable through the CMS.

- `admin` may read and update public site settings.
- `staff` and `viewer` may read permitted public site settings but cannot update them.

Secrets, API keys, service-role credentials, analytics secrets and rate-limit salts must never be stored in a public-editable site settings table.

Sensitive runtime configuration remains in deployment environment variables.

## 8. CMS UX

Admin routes are intentionally separated rather than combined into one large CRUD screen:

```text
/admin/catalog/locations
/admin/catalog/unit-types
/admin/catalog/pricing
/admin/content/faq
/admin/content/blog
/admin/content/media
/admin/content/settings
```

Each workspace should provide, where applicable:

- paginated/list view,
- basic search/filter,
- create flow,
- edit flow,
- clear current status,
- validation feedback,
- mutation success/error feedback.

Important mutations should not use optimistic UI. The UI should reflect the confirmed server result.

## 9. Data integrity and publishing rules

Phase 2 server-side validation must enforce at least:

- UUID inputs are valid before database calls,
- slugs match the project slug convention,
- unique constraints are handled as domain errors,
- prices and physical dimensions are non-negative,
- required publication fields are present before publishing,
- VI and EN values map to the correct locale fields,
- viewer mutations are rejected,
- published public slugs are immutable in Phase 2,
- deactivation is preferred to destructive deletion for referenced business entities.

Database constraints should enforce invariants that remain true regardless of caller. UI/server validation should provide human-readable errors before those constraints are reached.

## 10. Audit design

Every important Phase 2 mutation must produce an audit/history record, using the existing generic audit model if suitable or a domain-specific history table when that better preserves meaning.

Audit records should capture:

- actor profile/user identifier,
- entity type,
- entity identifier,
- action,
- timestamp,
- minimal non-secret change metadata.

Audit metadata must never contain:

- passwords,
- auth tokens,
- Supabase service-role credentials,
- deployment secrets,
- full secret environment values.

Audit writes should be coupled with the domain mutation strongly enough that a successful mutation cannot silently omit its required history record. The implementation plan must choose transaction/RPC or another atomic pattern after inspecting the live schema and current Supabase access pattern.

Sensitive non-mutation operations such as CSV lead export must also create an audit event recording actor, filter scope and timestamp without copying the exported PII into the audit metadata.

## 11. CRM design

### 11.1 Lead status pipeline

Phase 2 target pipeline:

```text
new
→ contacted
→ qualified
→ viewing
→ negotiating
→ won
```

`lost` is a terminal outcome reachable from any non-terminal status.

Transition rules:

- `staff` may move a lead forward through the pipeline or mark a non-terminal lead `lost`.
- `admin` has the same forward transitions and may also correct a status backward when operationally necessary.
- moving `won` or `lost` back to a non-terminal status is an admin-only reopen action and must be captured in status history.
- every transition, including correction/reopen, is recorded rather than rewriting history.

Before implementation, the plan must inspect the existing `lead_status` enum. If Phase 1 values differ, Phase 2 uses a forward migration to extend/normalize safely; it must not rewrite already-applied Phase 1 migrations.

Every status transition must:

- validate the target value and transition rule,
- update the current lead status,
- record a status-history row,
- record the acting user,
- record a timestamp.

Historical status rows are not deleted when the current state changes again.

### 11.2 Lead detail route

Add:

```text
/admin/leads/[id]
```

The detail view should expose the operationally useful lead fields already captured by Phase 1, including:

- name,
- phone,
- email,
- need type,
- estimated volume,
- requested unit/location where available,
- message,
- source,
- UTM fields,
- landing page,
- referrer,
- creation time,
- current status,
- assignee,
- notes,
- status history.

Only users with `leads:read` may load the page.

### 11.3 Assignment

Phase 2 adds or formalizes a lead assignee reference.

Rules:

- assignee must reference an active profile,
- assignee role must be `admin` or `staff`,
- `viewer` profiles cannot be assigned leads,
- `leads:assign` is required to change assignment,
- assignment changes are auditable.

### 11.4 Internal notes

Internal notes use a separate append-oriented model such as `lead_notes`, not one mutable notes text column on `leads`.

Required logical fields:

- note id,
- lead id,
- author profile/user id,
- content,
- created timestamp.

Phase 2 notes are append-only. Corrections are made by adding a new note; editing or deleting an existing note is out of scope.

### 11.5 Lead list, search and filters

Admin lead list should support server-side filtering for the fields that can be indexed and queried safely, including:

- status,
- assignee,
- source,
- date range,
- location,
- name/phone/email search,
- newest/oldest ordering.

The default page size is **50 rows**. Pagination is server-side; the browser must not load the full lead table to paginate locally.

### 11.6 CSV export

CSV export is permission-controlled server-side.

Requirements:

- only `admin` has `leads:export` in Phase 2,
- export respects active filters,
- no browser-side fetch of the entire unrestricted CRM table,
- exported fields are deliberately allow-listed,
- internal secrets/system metadata are excluded,
- every export creates an audit event without duplicating the exported PII into audit metadata.

## 12. Attribution and analytics

### 12.1 Lead attribution

Continue using the Phase 1 lead attribution fields:

- `source`,
- `utm_source`,
- `utm_medium`,
- `utm_campaign`,
- `utm_content`,
- `landing_page`,
- `referrer`.

Phase 2 adds admin summaries rather than introducing a second attribution store.

Initial summaries:

- leads by source,
- leads by campaign,
- leads over time,
- conversion/status distribution,
- top lead-generating landing pages.

### 12.2 Client analytics configuration

GA4 loads only if `NEXT_PUBLIC_GA4_ID` is configured.

Meta Pixel loads only if `NEXT_PUBLIC_META_PIXEL_ID` is configured.

Absence of either variable must not break rendering, tests or lead submission.

### 12.3 Event vocabulary

Phase 2 standardizes these public events:

```text
storage_finder_used
unit_viewed
location_viewed
contact_clicked
phone_clicked
zalo_clicked
lead_started
lead_submitted
lead_submit_failed
```

Event payloads may contain non-sensitive context such as:

- locale,
- unit slug/id where appropriate,
- location slug/id where appropriate,
- source/campaign category,
- page path.

Event payloads must not contain PII such as:

- full name,
- phone number,
- email address,
- free-form lead message.

Analytics integrations must be isolated behind a small adapter so GA4/Meta-specific code does not leak into domain components.

## 13. Database migration strategy

Phase 2 uses forward-only migrations. Already-applied Phase 1 migration files are immutable.

Likely schema work includes:

- lead assignment field or relation,
- lead notes table,
- any required lead status enum extension,
- permission/RLS policy extensions,
- audit support required by new mutations and sensitive exports,
- indexes for verified Phase 2 query patterns.

The exact migration filenames and SQL are implementation-plan details and must be based on an inspection of the then-current `main` plus production migration history.

Before every production migration batch:

1. confirm project identity,
2. compare local and remote migration history,
3. run a clean local migration application,
4. run pgTAP schema/RLS tests,
5. inspect generated/expected schema behavior,
6. review security advisors,
7. review relevant query/index needs,
8. apply production migration only when history is aligned.

No Phase 2 migration may seed unapproved phone, Zalo, price, inventory or marketing claims.

## 14. Testing strategy

### 14.1 TDD requirement

Every new behavior starts with a failing automated check or an already-failing reproducible gate.

Expected sequence:

```text
RED targeted test
→ minimum implementation
→ targeted PASS
→ lint
→ typecheck
→ full Vitest
→ Next production build
→ DB tests when schema/RLS changed
```

### 14.2 Permission tests

For every mutation class, cover at least:

- invalid input,
- unauthenticated denial,
- viewer denial,
- allowed staff/admin behavior according to the approved matrix,
- RLS enforcement through DB-level tests.

### 14.3 Domain mutation tests

Cover:

- invalid UUID/entity,
- invalid enum/status,
- invalid status transition,
- admin reopen/correction behavior,
- publication requirements,
- duplicate slug handling,
- immutable published slug handling,
- audit/history creation,
- assignment constraints,
- note creation,
- CSV allow-list and export-audit behavior.

### 14.4 Analytics tests

Cover:

- no analytics script when env ID is absent,
- correct adapter call when configured,
- event payload excludes PII,
- lead flow remains functional if analytics fails.

### 14.5 Public regression tests

Phase 1 public routes, SEO output and Storage Finder behavior remain regression gates. Phase 2 must not make admin features a dependency for normal public rendering.

## 15. Preview and E2E strategy

Current Phase 1 Preview uses Vercel Deployment Protection. Unauthenticated CI requests to protected application endpoints can receive Vercel `401`/SSO before reaching NupsBox.

Phase 2 must not disable protection merely to simplify testing.

Application-level E2E may run through:

- an authorized Vercel access/bypass mechanism supported by the project,
- or the production domain after its env/domain/Auth setup is valid and a safe pre-launch test window exists.

Lead E2E must verify at minimum:

- valid submission succeeds,
- malformed input is rejected,
- honeypot is rejected,
- rate limiting returns 429 at the intended threshold,
- lead row carries expected attribution,
- CRM can read the resulting lead under authorized admin access,
- service-role credentials never appear client-side.

Admin E2E must verify:

- unauthenticated access is denied/redirected,
- admin can perform allowed operations,
- staff permissions match the approved matrix,
- viewer cannot mutate,
- RLS remains authoritative.

## 16. Performance and indexing

Phase 2 avoids speculative indexing.

The implementation plan should add indexes only for demonstrated query shapes such as:

- lead status + created time,
- assignee + created time,
- source/campaign fields if attribution dashboards require them,
- slug uniqueness/lookup where not already covered.

Admin read adapters must avoid N+1 patterns. Related display data should be fetched with appropriate joins/relations or bounded secondary queries.

Performance advisor warnings should be reviewed after each schema batch. Non-impacting warnings may be documented rather than blindly fixed.

## 17. Error handling

Admin mutations should return domain-safe errors rather than raw database errors to the UI.

Examples:

- duplicate slug → `Slug already exists`,
- permission denial → generic forbidden message,
- referenced record prevents deletion → explain that the entity should be deactivated,
- invalid publication state → list missing required fields.

Server logs may retain diagnostic context but must not log secrets or unnecessary PII.

## 18. Security acceptance

Phase 2 cannot merge if any of these are true:

- browser code imports/uses service-role credentials,
- a mutation relies only on hidden UI controls for authorization,
- a new client-accessible table lacks deliberate RLS,
- viewer can mutate operational data,
- staff can exceed the approved permission contract,
- unrestricted lead export is possible,
- secret values are written to audit records or client analytics,
- public routes expose internal CRM/content drafts.

## 19. Subphase rollout

### P2.1 — Data model & permissions

Deliverables:

- encode the approved Phase 2 permission matrix,
- forward migrations for CRM data model changes,
- RLS policies,
- pgTAP regression tests,
- generated type synchronization where required.

Gate: CI + DB tests green before P2.2.

### P2.2 — Catalog & Content CMS

Deliverables:

- locations CRUD/deactivation,
- unit type CRUD/deactivation,
- location pricing/public label editing,
- FAQ management,
- blog management,
- media metadata management,
- public site settings management,
- audit coverage for important mutations.

Gate: targeted mutation tests + full CI + public regression PASS.

### P2.3 — CRM enhancement

Deliverables:

- lead detail,
- pipeline/status history,
- assignment,
- append-only internal notes,
- filters/search/pagination,
- admin-only CSV export with audit event.

Gate: unit/permission tests + DB/RLS tests + authorized admin verification.

### P2.4 — Attribution & Analytics

Deliverables:

- analytics adapter,
- conditional GA4,
- conditional Meta Pixel,
- standardized events,
- attribution summaries in admin.

Gate: no-PII tests + full CI + lead flow regression PASS.

### P2.5 — Hardening & release

Deliverables:

- authorized lead/admin E2E,
- security review,
- query/index review,
- production migration preflight,
- production checklist update,
- exact-head Vercel verification,
- production smoke test plan.

Gate: all Phase 2 acceptance criteria below pass.

## 20. Phase 2 acceptance criteria

Phase 2 is complete only when all of the following are true:

1. Phase 1 is merged and production-ready before Phase 2 implementation branch creation.
2. Every Phase 2 database change is a forward migration with aligned local/remote history.
3. CI passes on the exact release head: install, lint, typecheck, unit tests and production build.
4. Database workflow passes complete migrations plus pgTAP/RLS contracts.
5. Admin CMS mutations work only for authorized roles and are protected by RLS.
6. Catalog/content changes render correctly on public pages without exposing drafts.
7. Lead detail, status history, assignment and internal notes work as designed.
8. Lead status transitions enforce staff forward-only/terminal-loss behavior and admin correction/reopen behavior.
9. CSV export is admin-only, permission-controlled, field allow-listed and audited.
10. Analytics is optional, fails safely and sends no lead PII.
11. Attribution summaries use the canonical lead attribution fields rather than a duplicate source of truth.
12. Public Phase 1 routes and SEO behavior show no regression.
13. Lead submission E2E succeeds through an authorized deployment path, including validation and rate-limit checks.
14. Admin E2E verifies admin/staff/viewer boundaries through an authorized deployment path.
15. Security review finds no browser service-role exposure or missing deliberate RLS on new client-accessible data.
16. Production migration history and exact-head Vercel deployment are verified before release.
17. Production smoke tests pass before Phase 2 is declared complete.

## 21. Deferred Phase 3 candidates

The following may be evaluated after Phase 2 operational data is stable:

- real-time inventory,
- reservation holds,
- deposits/payment,
- automated lead nurturing,
- Zalo/SMS/email workflow automation,
- external CRM integration,
- advanced BI/warehouse reporting,
- customer self-service portal.

None of these should be partially introduced during Phase 2 without a separate approved design.

## 22. Implementation handoff rule

After this written specification is reviewed and approved, the next artifact is a detailed implementation plan created with the project planning workflow.

No Phase 2 production code or schema migration should be written before that plan is approved and before the Phase 1 merge prerequisite is satisfied.
