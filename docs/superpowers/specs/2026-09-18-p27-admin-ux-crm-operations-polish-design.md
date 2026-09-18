# P2.7 Admin UX & CRM Operations Polish — Design Specification

Date: 2026-09-18  
Repository: `giang0110/nupsbox`  
Base: `main@12da1598667cd826576cd3708c62b69a743fd1bb`  
Phase: P2.7  
Status: Approved design, awaiting implementation planning

## 1. Purpose

P2.7 upgrades the authenticated NupsBox admin area into a practical operations workspace for both management and CRM staff while preserving the current database schema, security model, CRM lifecycle, and Light Booking semantics.

The phase has two equal goals:

1. give managers a concise operational view of CRM workload and content/catalog health; and
2. give CRM staff a faster daily workflow for finding, reviewing, assigning, progressing, and scheduling leads.

P2.7 is intentionally a UX, presentation, and read-model phase. It does not introduce a new CRM lifecycle or a new operational subsystem.

## 2. Decisions already approved

The following design decisions are fixed for P2.7:

- Scope model: **Core + Consistency**.
- Primary users: **management and CRM staff equally**.
- Lead workspace: **hybrid table + pipeline/Kanban**.
- Dashboard model: **Executive + Operations**.
- Lead detail: **adaptive workspace** — split desktop, stacked tablet/mobile.
- Admin navigation: **adaptive sidebar** — desktop sidebar, tablet/mobile drawer.
- Pipeline status mutation: **hybrid** — desktop drag-and-drop plus explicit status selector/menu; mobile and keyboard flows never depend on drag-and-drop.
- Database: **no migrations in P2.7**.

## 3. Current-state anchors

The implementation must build on existing project behavior rather than replace it.

Current relevant areas include:

- `app/admin/layout.tsx`
- `app/admin/page.tsx`
- `app/admin/leads/page.tsx`
- `app/admin/leads/[leadId]/page.tsx`
- `components/admin/admin-nav.tsx`
- `components/admin/appointment-workspace.tsx`
- `components/admin/lead-status-form.tsx`
- `components/admin/catalog-tables.tsx`
- `features/admin/dashboard.ts`
- `features/admin/leads.ts`
- `features/admin/lead-detail.ts`
- `features/admin/lead-timeline.ts`
- `features/admin/appointment-workspace.ts`
- existing catalog/content feature modules under `features/admin/**`

The current CRM status model remains authoritative:

- `new`
- `contacted`
- `qualified`
- `viewing`
- `negotiating`
- `won`
- `lost`

Existing role/permission checks remain authoritative, including the current lead read/update/assign/note behavior and appointment mutation access. Existing RLS and server-side guards must not be bypassed.

## 4. Scope

### 4.1 In scope

P2.7 includes:

- admin shell redesign;
- adaptive sidebar and mobile drawer;
- shared admin visual primitives;
- dashboard operational summary;
- dashboard CRM workload panels;
- lead table redesign;
- server-side lead search/filter/read-model extension using existing columns;
- table/pipeline view switching;
- pipeline/Kanban presentation;
- desktop drag-and-drop status movement with a non-drag fallback;
- adaptive lead detail workspace;
- improved status/assignee/contact action placement;
- appointment workspace restructuring;
- unified lead timeline presentation;
- business-context versus acquisition-context grouping;
- mobile/tablet lead cards instead of mandatory wide-table scrolling;
- visual consistency pass across Catalog and Content pages;
- responsive, accessibility, and regression coverage;
- exact-head Preview verification.

### 4.2 Out of scope

P2.7 does not include:

- database migrations;
- new database columns;
- new database tables;
- changes to lead status values or lifecycle semantics;
- production business-data seed;
- custom-domain or `nupsbox.vn` cutover;
- payment;
- inventory reservation or inventory locking;
- guaranteed availability;
- calendar synchronization;
- automated email/SMS/Zalo messaging;
- customer portal;
- advanced attribution warehouse;
- external analytics warehouse;
- realtime multi-user presence;
- notification center;
- bulk lead editing;
- Excel import;
- saved CRM views requiring persistence;
- auto-assignment rules;
- duplicate lead merging;
- CMS version history;
- DAM/media-library subsystem.

## 5. Design principles

### 5.1 Operations before decoration

Admin screens must prioritize actionable information over visual spectacle. KPI cards, pipeline views, and status indicators exist to shorten operational decisions, not to decorate the interface.

### 5.2 Server-first

Server Components remain the default. Client Components are introduced only where interaction requires local state or browser events.

Expected client-side needs include:

- sidebar open/collapse state;
- mobile drawer state;
- table/pipeline view interaction where needed;
- drag-and-drop;
- local disclosure or dialog state;
- form controls that already require client behavior.

### 5.3 One mutation path per business action

A visual shortcut must not create a new business path.

Changing a lead status from:

- table row;
- pipeline card selector;
- pipeline drag-and-drop;
- lead detail;

must ultimately use the same validated server-side mutation/guard path or an equivalent shared mutation abstraction built on the same validation and permissions.

### 5.4 URL is workspace state

Shareable and refresh-safe list state belongs in the URL.

The leads workspace may use parameters such as:

- `view=table|pipeline`
- `status=<lead-status>`
- `assignee=<uuid>`
- `source=<value>`
- `q=<search>`

The default table view should not require `view=table` in the URL.

### 5.5 No fabricated business intelligence

Dashboard calculations must be derived from actual rows and documented status rules. Do not introduce synthetic SLA claims, fake conversion rates, fake occupancy, or inferred business metrics unsupported by current data.

## 6. Admin shell

### 6.1 Desktop

For desktop-width admin pages:

- a persistent left sidebar is the primary navigation;
- the sidebar may support collapsed and expanded states;
- content occupies the remaining width;
- page content has a dedicated page-header area;
- user identity and role remain visible without dominating the screen.

Navigation groups:

1. **Tổng quan**
   - Dashboard
2. **CRM**
   - Leads
3. **Catalog**
   - Locations
   - Unit Types
   - Pricing
4. **Content**
   - FAQ
   - Blog
   - Media
   - Settings

Only routes and actions permitted by the existing role model should be exposed as actionable UI.

### 6.2 Tablet and mobile

The desktop sidebar becomes a drawer/menu sheet.

Requirements:

- no permanent left rail consuming narrow width;
- drawer trigger has an accessible name;
- drawer traps/focuses correctly while open;
- Escape closes the drawer where appropriate;
- background content is not accidentally operable through the open drawer;
- navigation remains keyboard accessible.

### 6.3 Page header

Admin pages should use a shared page-header pattern containing, as appropriate:

- breadcrumb;
- eyebrow/context label;
- title;
- description;
- primary page action;
- secondary actions.

The top-level shell and page-level header must not duplicate the same title in a visually wasteful way.

## 7. Admin design system

P2.7 should introduce small, purpose-built Admin primitives rather than keep duplicating long utility-class blocks.

Candidate primitives:

- `AdminPageHeader`
- `AdminSection`
- `AdminPanel`
- `AdminStatCard`
- `AdminStatusBadge`
- `AdminFilterBar`
- `AdminTableShell`
- `AdminEmptyState`
- `AdminFieldGroup`
- `AdminActionBar`

The exact file split may change during planning, but each primitive must have one clear responsibility.

Shared admin styling should standardize:

- border radius;
- border contrast;
- surface hierarchy;
- spacing;
- heading hierarchy;
- muted copy;
- primary/secondary/destructive action hierarchy;
- badge treatment;
- empty states;
- field grouping;
- focus-visible states.

Public marketing primitives should not be imported merely to make Admin look consistent. Shared brand tokens are acceptable; workflow components should stay admin-specific.

## 8. Dashboard design

Route: `/admin`

### 8.1 Top-level KPI row

The first meaningful dashboard content should summarize current CRM workload using existing lead and appointment data.

Target KPI concepts:

- new leads;
- in-progress leads;
- upcoming actionable appointments;
- won leads;
- lost leads.

“In-progress” means the current non-terminal working statuses:

- `contacted`
- `qualified`
- `viewing`
- `negotiating`

The exact count window is all currently visible rows unless an existing product rule already limits it. Do not label a KPI as “today”, “this week”, or similar without adding an explicit time predicate.

### 8.2 Attention/work queue

A management/staff attention area should surface actionable records such as:

- newest `new` leads;
- unassigned leads;
- next actionable appointments;
- overdue appointments according to the existing appointment logic.

This is not a notification subsystem. It is a server-rendered operational read model.

### 8.3 Pipeline snapshot

Show lead counts across the seven existing CRM statuses.

Each status summary should link to the corresponding filtered leads workspace.

No chart library is required. Compact bars/cards are sufficient.

### 8.4 Operational health

Below CRM workload, show current catalog/content health from existing data:

- active locations;
- active unit types;
- active FAQ entries;
- published blog posts.

Where useful, cards link to their relevant admin sections.

P2.7 does not invent “health scores”.

## 9. Leads workspace

Route: `/admin/leads`

### 9.1 Shared filter model

Table and Pipeline views must read the same filter/search model.

Supported P2.7 controls:

- search;
- status;
- assignee;
- source;
- view toggle.

Search must support the current useful identity fields:

- full name;
- phone;
- email.

Search stays server-side using the current database. P2.7 must not add a search index or external search service.

### 9.2 Result limit and ordering

The existing operational ceiling of at most 100 lead rows can remain for P2.7 unless the implementation plan identifies an already-supported pagination mechanism.

Default ordering remains newest first.

The UI should make the current result limit understandable if it materially affects what the operator sees.

### 9.3 Table view

Table is the default view.

Desktop columns should be organized around decisions rather than raw schema fields:

- Lead
- Nhu cầu
- Nguồn
- Trạng thái
- Phụ trách
- Cập nhật / action

The Lead cell can combine:

- name;
- phone;
- email;
- created time.

Long customer messages should be summarized or previewed rather than fully expanded in every row.

A row must remain understandable without relying on color alone.

### 9.4 Mobile/tablet lead cards

At narrow layouts, the CRM must not require a `min-width: 1050px` table with horizontal scrolling as the primary experience.

Lead cards should expose:

- name;
- phone;
- status;
- assignee;
- need type;
- source;
- time;
- link/action to open the CRM record.

Controls must remain at least practical touch size.

## 10. Pipeline/Kanban

### 10.1 Columns

Pipeline uses exactly the existing seven statuses:

1. Mới
2. Đã liên hệ
3. Đã xác nhận nhu cầu
4. Đang xem kho
5. Đang thương lượng
6. Đã thuê
7. Không chuyển đổi

`won` and `lost` are terminal presentation columns, but the existing server-side status validation remains the authority for mutations.

### 10.2 Card content

Pipeline cards should stay compact.

Display:

- customer name;
- phone;
- need type;
- assignee;
- created time;
- concise source;
- nearest relevant appointment summary where this can be obtained efficiently from current schema/read models.

Do not place full message, detailed UTM fields, notes, or the full timeline on the pipeline card.

### 10.3 Drag-and-drop

Desktop may support drag-and-drop between status columns.

Requirements:

- a status change is not committed merely by visual movement;
- the drop must invoke the same validated server-side status mutation path;
- an error must restore or refresh the authoritative state;
- permission checks remain server authoritative;
- read-only roles do not receive a functional drag mutation path.

Avoid adding a large drag-and-drop dependency if the requirement can be met reliably with a small implementation.

### 10.4 Non-drag fallback

Every mutable pipeline card must provide an explicit status action such as a menu or select.

The non-drag path is mandatory for:

- keyboard users;
- mobile users;
- environments where drag-and-drop is inconvenient;
- users who prefer explicit actions.

The Kanban experience is therefore never drag-only.

## 11. Lead detail adaptive workspace

Route: `/admin/leads/[leadId]`

### 11.1 Desktop structure

Desktop uses a split workspace:

- main workspace: roughly 65–70%;
- operational rail: roughly 30–35%.

Main workspace contains:

- customer/business context;
- appointment workspace;
- notes;
- unified timeline.

Operational rail contains:

- current status;
- assignee;
- contact actions;
- concise appointment summary/action.

The operational rail may be sticky only if it remains fully usable in realistic viewport heights and does not create clipped controls.

### 11.2 Tablet/mobile structure

Narrow layouts use a stacked workflow in this order:

1. customer identity/contact;
2. status and assignee;
3. business need context;
4. appointment workspace;
5. internal note entry;
6. unified timeline;
7. acquisition/technical context.

No desktop sticky rail is retained on mobile.

### 11.3 Header actions

The record header should make the following immediately discoverable:

- lead name;
- status;
- created time;
- preferred language;
- phone;
- email if present;
- call action;
- email action if present;
- back to lead list.

Raw technical IDs should not dominate the primary screen.

## 12. Lead business and acquisition context

### 12.1 Business context

Primary context should include readable values for:

- need type;
- estimated volume;
- location;
- unit type;
- customer message.

Where current schema stores IDs, the read model should resolve display names from existing tables when practical, without adding schema.

### 12.2 Acquisition context

Secondary acquisition context includes:

- source;
- UTM source;
- UTM medium;
- UTM campaign;
- UTM content;
- landing page;
- referrer.

This information should be visually subordinate and may live in an expandable/details panel.

It must remain accessible without requiring developer tools or raw database access.

## 13. Status and assignee operations

Status and assignee controls should be visually prominent but operationally unchanged.

Status:

- current status shown as text plus visual badge;
- mutation remains permission-gated;
- status options remain the current status model.

Assignee:

- show readable staff/admin names;
- allow assignment only where current permissions allow;
- avoid showing UUID as the primary label.

P2.7 does not add:

- auto-assignment;
- round-robin assignment;
- workload balancing;
- assignment notifications.

## 14. Appointment workspace

### 14.1 Semantics

Appointments remain **Light Booking**.

An appointment is not:

- an inventory reservation;
- a guaranteed unit hold;
- a payment;
- a calendar synchronization event.

P2.7 must preserve this language and behavior.

### 14.2 Next appointment / attention summary

Where current appointment data permits, the lead workspace should show the next actionable appointment first.

Show:

- scheduled time in `Asia/Ho_Chi_Minh`;
- status;
- duration;
- location;
- unit type;
- assignee;
- overdue/attention state based on existing logic.

### 14.3 Create appointment

The create form should no longer dominate the whole workspace by default.

It may be placed behind a clear “Tạo lịch xem kho” action or compact disclosure.

The form continues to use existing fields and validation:

- scheduled time;
- duration;
- location;
- unit type;
- assignee;
- customer note;
- internal note.

### 14.4 Existing appointments

Appointment cards should show:

- status;
- scheduled time;
- duration;
- location;
- unit type;
- assignee;
- source;
- customer note if present;
- internal note if present;
- edit action if permitted.

Do not expose additional unsupported business state.

## 15. Internal notes and unified timeline

### 15.1 Note entry

Internal note entry remains a dedicated action for authorized staff.

Requirements:

- preserve existing maximum length and validation;
- clear label that the note is internal;
- clear mutation feedback;
- no implication that the customer will receive the note.

### 15.2 Unified timeline

Use the existing timeline concept to combine, chronologically:

- internal notes;
- lead status history;
- appointment history.

Each event should expose:

- event type;
- readable title;
- readable detail;
- actor name if available;
- timestamp in `Asia/Ho_Chi_Minh`.

The timeline should read like CRM history, not raw audit JSON.

Examples:

- “Trạng thái lead · Mới → Đã liên hệ”
- “Lịch hẹn · Đã xác nhận”
- “Ghi chú nội bộ · Khách muốn xem kho chiều thứ Sáu”

Event type may use icons and subtle visual treatment, but meaning must not depend on color.

## 16. Catalog consistency

P2.7 applies the admin shell and design primitives to:

- Locations;
- Unit Types;
- Pricing.

### 16.1 List pattern

Catalog list pages should share:

- page header;
- primary action placement;
- consistent list container;
- readable status treatment;
- edit action;
- responsive behavior.

Desktop can use tables where appropriate.

Mobile should use cards or a compact responsive list rather than force a wide data table.

### 16.2 Form pattern

Forms should group related fields using shared `AdminFieldGroup` or equivalent.

P2.7 must preserve current validation and mutation behavior.

No new bulk/import features are added.

## 17. Content consistency

Apply the same shell and form/list language to:

- FAQ;
- Blog;
- Media;
- Settings.

### 17.1 FAQ

Priorities:

- scan question and active state quickly;
- edit action is obvious;
- form hierarchy is consistent with other admin forms.

### 17.2 Blog

Priorities:

- draft/published state is explicit;
- metadata and body/content inputs are visually grouped;
- publishing semantics remain unchanged.

### 17.3 Media

Priorities:

- readable metadata;
- consistent edit form;
- no new asset-management subsystem.

### 17.4 Settings

Priorities:

- group existing settings by purpose;
- make save actions unambiguous;
- do not create new configuration keys merely for the redesign.

## 18. Responsive contracts

The following viewport classes must be covered by automated layout checks where authentication fixtures make this practical.

### 18.1 Mobile — 390×844

Requirements:

- admin drawer works;
- no horizontal document overflow;
- lead list uses cards or equivalent responsive layout;
- lead detail is stacked;
- primary actions remain reachable;
- fixed/sticky elements do not cover form controls;
- dialogs/drawers remain within viewport.

### 18.2 Tablet — 768×1024

Requirements:

- navigation remains practical;
- leads do not depend on a 1050px table;
- filter controls wrap cleanly;
- lead detail remains readable without squeezed desktop columns;
- forms retain comfortable widths.

### 18.3 Desktop — 1366×768

Requirements:

- sidebar and content fit without accidental horizontal overflow;
- first dashboard workload content is visible without excessive empty vertical space;
- lead detail split layout remains usable at laptop height;
- sticky operational rail does not clip actions.

### 18.4 Desktop — 1440×900

Use as the standard roomy desktop acceptance viewport.

### 18.5 Desktop — 1536×864

Use as an additional wide desktop acceptance viewport.

Admin implementation must consider low-height desktop behavior, not width alone.

## 19. Accessibility

P2.7 must preserve or improve:

- semantic heading order;
- explicit form labels;
- focus-visible treatment;
- keyboard-operable navigation;
- minimum practical control size around 44px;
- status text in addition to color;
- dialog/drawer focus behavior;
- reduced-motion preferences;
- table semantics where a real table is used;
- accessible names for icon-only controls.

Kanban requirements:

- drag-and-drop is optional enhancement;
- explicit status action remains keyboard operable;
- the current status is available to assistive technology;
- cards expose a clear link/action to open the lead.

## 20. Error, loading, and empty states

### 20.1 Mutation errors

Status, assignment, note, and appointment failures must not silently disappear.

At minimum:

- the user receives a visible error state/message;
- authoritative server state remains or is restored;
- optimistic UI is not retained after failure.

### 20.2 Empty states

Shared empty states should clearly distinguish cases such as:

- no leads exist;
- no leads match filters;
- no appointments exist;
- no notes/history exist;
- no catalog/content rows exist.

Empty states should offer a useful next action only when the user has permission for that action.

### 20.3 Loading

Do not introduce client loading spinners simply because a server component refetches. Prefer normal server navigation, pending form state, or focused local pending states.

## 21. Data/read-model changes allowed

P2.7 may extend existing server read models and Supabase selects using existing schema.

Examples of allowed changes:

- include `assigned_to` in list lead rows;
- resolve assignee display names;
- resolve location/unit names;
- aggregate status counts;
- aggregate dashboard workload counts;
- obtain nearest relevant appointment summaries;
- filter lead queries by current columns;
- search name/phone/email using current database capabilities.

These are application-level read changes, not schema changes.

Queries should avoid obvious N+1 behavior. If a page needs related display labels for many leads, prefer a bounded set query/join/read-model composition rather than one request per row.

## 22. Data/schema changes forbidden

P2.7 must not add or require:

- `lost_reason`;
- `next_follow_up_at`;
- persisted saved filters;
- persisted Kanban ordering;
- SLA timestamps;
- notification rows;
- new analytics tables.

If operational use later proves these are needed, they belong to a separately approved database phase.

## 23. Performance

Requirements:

- no new chart framework solely for dashboard counters/pipeline bars;
- avoid a heavy DnD framework unless a lightweight implementation cannot meet reliability/accessibility goals;
- no whole-admin client-side SPA conversion;
- keep server-rendered data fetching as the primary pattern;
- preserve current Next.js optimization patterns;
- avoid fetching detailed notes/history for every lead in a list view;
- pipeline card appointment enrichment must be bounded and efficient.

## 24. Security and privacy

P2.7 must preserve:

- `PRIVATE_AREA_METADATA`;
- `noindex` behavior for Admin;
- authenticated Admin access;
- role-based page/action visibility;
- server-side permission validation;
- Supabase RLS as authoritative data protection.

UI hiding is not authorization.

Anonymous production/Preview smoke must continue to prove that protected Admin data is not exposed.

Lead contact details remain inside the authenticated admin area.

## 25. Test strategy

P2.7 implementation must use TDD for new behavioral units and regression tests for layout contracts.

### 25.1 Unit tests

Add or update unit tests for pure/read-model behavior such as:

- dashboard CRM count normalization;
- in-progress status aggregation;
- filter/search parameter normalization;
- table/pipeline view normalization;
- pipeline grouping by status;
- status labels/badge mapping if centralized;
- next appointment selection;
- unified timeline ordering/presentation helpers;
- readable related-label projection where introduced.

Existing admin appointment, lead, permissions, content, catalog, and dashboard tests must continue to pass.

### 25.2 Integration/server behavior

Where existing test infrastructure supports it, verify:

- filtered lead queries;
- status mutation validation remains unchanged;
- assignment/note/appointment guards remain unchanged;
- no unauthorized action path is introduced by pipeline interactions.

### 25.3 E2E

Protected Admin E2E may require an authenticated test fixture. If the current CI environment does not safely support authenticated admin credentials, do not embed production credentials or weaken auth for testing.

At minimum, verify:

- anonymous `/admin` remains protected;
- public production smoke remains unchanged;
- component/unit layout contracts cover responsive Admin primitives;
- authenticated Admin E2E is added only through an approved secure fixture.

### 25.4 Responsive regression

Automated checks should cover the approved viewport classes:

- 390×844;
- 768×1024;
- 1366×768;
- 1440×900;
- 1536×864.

Where full authenticated Playwright is unavailable, use component render tests and server-rendered structural tests rather than bypass authentication.

## 26. Verification gates

Before P2.7 can be considered ready to merge:

- lint passes;
- typecheck passes;
- unit/integration tests pass;
- production build passes;
- database/RLS test suite passes;
- public E2E suite passes;
- new P2.7 tests pass;
- Preview deployment is READY for the exact PR head;
- anonymous Admin protection is verified;
- Preview runtime `error/fatal` logs are clean for verification traffic;
- diff contains no migration;
- diff contains no production seed;
- diff contains no domain cutover;
- diff contains no focused `.only` tests.

## 27. Definition of Done

P2.7 is complete only when all of the following are true:

1. `/admin` provides useful CRM workload and operational-health context.
2. `/admin/leads` supports a practical Table view and Pipeline view from the same filter/read model.
3. CRM Table is usable without horizontal scrolling on mobile/tablet.
4. Pipeline status changes reuse the authoritative validated mutation path.
5. Drag-and-drop is an enhancement, never the only status interaction.
6. Lead Detail uses adaptive desktop/mobile workspace layouts.
7. Status, assignee, contact actions, and next appointment are easy to find.
8. Appointment behavior still represents Light Booking rather than reservation.
9. Internal notes and lead/appointment history form a readable unified timeline.
10. Catalog and Content pages share the new Admin shell/design language.
11. Existing RBAC and RLS behavior is preserved.
12. No database migration exists in the phase diff.
13. No production business-data seed exists in the phase diff.
14. No custom-domain cutover exists in the phase diff.
15. Responsive acceptance covers mobile, tablet, laptop-height desktop, and standard desktop.
16. CI, tests, Preview, smoke, and runtime-log gates pass.

## 28. Implementation boundaries

The implementation plan should favor incremental, testable steps:

1. shared Admin primitives and shell;
2. dashboard read model and UI;
3. lead query/filter model;
4. responsive Table workspace;
5. Pipeline view and non-drag mutation path;
6. drag-and-drop enhancement;
7. adaptive Lead Detail;
8. appointment workspace;
9. unified timeline;
10. Catalog/Content consistency pass;
11. responsive/accessibility hardening;
12. exact-head Preview verification.

A later planning document may refine task order to minimize merge conflicts and preserve red/green TDD steps, but it must not expand the approved P2.7 scope.
