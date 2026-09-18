# P2.5 Public UI/UX Refresh — Design Specification

Date: 2026-09-17
Status: Proposed for implementation after user review
Branch: `codex/p25-public-ui-ux-refresh`
Base: `main`

## 1. Purpose

P2.5 redesigns the public NupsBox website into a modern, conversion-focused customer experience while preserving the working P2.3/P2.4 CRM, booking, security, SEO, and deployment foundations.

This is not a cosmetic-only refresh. The redesign must improve the path from discovery to qualification to conversion:

**Discover → Find suitable storage → Compare/understand → Request quote or viewing appointment.**

The public site is the only surface in scope for this phase. Admin UI redesign is intentionally deferred to a later phase.

## 2. Product decisions already approved

The user approved the following direction:

- Visual/product direction: **Modern conversion-focused**.
- Delivery order: **Public site first; admin later**.
- Primary funnel: **Find suitable storage → Request quote / Request viewing appointment**.
- Additional optimizations: choose the strongest low-risk improvements based on user impact and implementation safety.
- Preferred implementation approach: **conversion-first redesign with targeted product enhancements**, not a light reskin and not a motion-heavy brand rework.

## 3. Goals

### 3.1 Primary goals

1. Make NupsBox feel credible, contemporary, and operationally mature within the first viewport.
2. Give every major public page one clear primary action and at most one meaningful secondary action.
3. Reduce friction between browsing and submitting a qualified lead.
4. Help users who do not know storage sizes understand what they need without requiring storage-industry knowledge.
5. Make mobile conversion as deliberate as desktop conversion.
6. Preserve factual integrity: business facts must come from approved/static-known sources or production data; the redesign must not invent inventory, customer counts, testimonials, prices, availability, phone numbers, Zalo contacts, or service guarantees.

### 3.2 Secondary goals

- Improve design consistency across all public routes.
- Strengthen accessibility, focus states, tap targets, and reduced-motion behavior.
- Preserve or improve Core Web Vitals and avoid unnecessary client-side JavaScript.
- Improve analytics around funnel progression without collecting sensitive form payloads.

## 4. Non-goals

P2.5 will not:

- redesign the admin workspace;
- introduce payment, deposits, inventory reservation, real-time stock locking, or guaranteed booking;
- change the lead/appointment lifecycle introduced in P2.3;
- add calendar synchronization or automated messaging;
- seed unapproved business content into production;
- perform production database DDL unless a schema defect is discovered and separately approved;
- cut over `nupsbox.vn` DNS or canonical origin;
- replace the existing Supabase + Vercel architecture;
- create fabricated social proof, ratings, occupancy, client logos, or urgency signals.

## 5. Current-state observations

The current codebase is structurally suitable for a large visual refresh without a rewrite:

- marketing sections are already split into reusable components such as hero, featured units, use cases, comparison, gallery, security, how-it-works, FAQ, final CTA, header/footer, and mobile actions;
- homepage composition is already modular;
- `StorageFinder` already provides a two-step recommendation flow based on need and approximate volume;
- localization, SEO helpers, public catalog access, lead capture, Light Booking, and analytics utilities already exist;
- global visual variables already define the NupsBox blue/navy/yellow palette.

The redesign should evolve these boundaries instead of replacing them with one large page component.

## 6. Experience principles

### 6.1 Conversion without pressure

The website should guide rather than push. Avoid fake countdowns, false scarcity, intrusive modal traps, forced phone capture, auto-opening chat, or unsupported claims.

### 6.2 One decision at a time

The user should not encounter three equally prominent CTA buttons in one section. Each section should answer one question and expose one next best action.

### 6.3 Contextual CTAs

CTA labels should reflect where the user is in the journey:

- early discovery: **Find suitable storage**;
- product/size context: **See recommended storage** or **Request quote**;
- location context: **Request viewing at this location**;
- booking context: **Send viewing request**.

### 6.4 Progressive disclosure

Do not show every storage detail, policy, and form field at once. Reveal detail as the user demonstrates intent.

### 6.5 Honest recommendation language

Storage Finder may recommend a best-fit unit from the available catalog, but must frame the result as a recommendation rather than guaranteed availability or reservation.

## 7. Visual design system

### 7.1 Brand direction

Retain NupsBox navy, blue, and yellow, but use them with more hierarchy:

- Navy: premium structural color for hero, footer, high-emphasis content, and dark panels.
- Blue: primary interactive/semantic brand color.
- Yellow: sparing conversion accent, not a general background color.
- Off-white and cool-neutral surfaces: primary content canvas.

The site should feel closer to a polished modern logistics/space service than a generic SaaS dashboard.

### 7.2 Typography

Keep a modern grotesk/sans stack compatible with the current project. The design should define reusable text roles rather than per-page arbitrary classes:

- display hero;
- section headline;
- card title;
- body large;
- body standard;
- eyebrow/meta;
- numeric/value emphasis.

Headlines may remain bold but should use less extreme tracking when it harms Vietnamese readability.

### 7.3 Layout rhythm

Introduce reusable section primitives:

- standard content width;
- narrow reading width;
- standard section spacing;
- compact section spacing;
- two-column media/content layout;
- card grid layout;
- dark feature band;
- CTA band.

Desktop should have stronger whitespace and alignment. Mobile should reduce unnecessary vertical padding while preserving clear grouping.

### 7.4 Surfaces and cards

Reduce the “every section is a rounded card” effect. Use cards when content is independently actionable or comparable. Use open layouts, dividers, media bands, and alternating surfaces for narrative content.

Card treatments should have a small number of approved variants:

- default;
- interactive/selectable;
- featured/recommended;
- dark;
- subdued/info.

### 7.5 Motion

Use motion only to improve comprehension:

- subtle hover/focus elevation;
- simple accordion transitions;
- progress change in guided finder;
- lightweight reveal only if it does not delay content.

No heavy scroll-jacking, parallax dependency, or animation that blocks interaction. Existing `prefers-reduced-motion` support remains authoritative.

## 8. Information architecture and global navigation

### 8.1 Header

Redesign the header for clearer conversion hierarchy:

- NupsBox brand left;
- core navigation center/left depending on viewport;
- language switcher accessible but visually secondary;
- primary CTA: **Find storage** / Vietnamese equivalent;
- compact sticky behavior after scrolling;
- mobile menu with direct access to core routes and a persistent primary CTA.

The primary header CTA should lead into the finder experience, not directly force a contact form.

### 8.2 Footer

Footer should become a trust and navigation closure layer:

- brand + value proposition;
- navigation groups;
- factual contact details only when approved data exists;
- legal/privacy links if present;
- locale-consistent labels;
- no duplicate CTA clutter.

### 8.3 Mobile action bar

Retain the useful persistent mobile action concept, but make it context-aware and less visually dominant.

Default priority:

1. Find storage
2. Request quote / Contact
3. Viewing request when relevant

Phone/Zalo actions may be shown only when approved values exist. Null configuration must not render misleading call/chat actions.

## 9. Homepage redesign

The homepage becomes a deliberate funnel rather than a sequence of independent marketing sections.

### 9.1 Hero

Hero must communicate within the first screen:

- what NupsBox is;
- who it is for;
- where it operates at a high level;
- the primary next action.

Recommended structure:

- concise eyebrow;
- outcome-driven H1;
- short supporting paragraph;
- primary CTA: **Find suitable storage**;
- secondary CTA: **View pricing**;
- factual trust row;
- real facility imagery.

The hero may use asymmetric composition and layered information over the real facility image, but must remain readable and fast.

### 9.2 Guided Storage Finder

Promote Storage Finder to the core interaction of the homepage.

Evolve it from two groups of pills into a guided flow with visible progress:

**Step 1 — Storage purpose**
- Online shop
- Business
- Inventory
- Personal

**Step 2 — Approximate amount**
- existing volume categories remain valid unless product logic changes separately.

**Result**
- recommended unit/size from actual catalog;
- brief reason why it fits;
- clearly labeled as recommendation;
- actions: **Request quote** and **Request viewing**;
- link to compare available unit types.

The flow should preserve keyboard accessibility and work without animation.

Do not add mandatory contact fields before the recommendation is visible.

### 9.3 Unit preview / comparison

Replace passive “featured unit” presentation with decision-support cards.

Each card should expose only useful factual fields available in the data model, for example:

- name;
- area;
- suitable-for hints that are derived from approved logic/content;
- pricing only when present and approved;
- availability label only when source data supports it.

Provide a lightweight compare affordance for **up to 3 units at a time**. Comparison is an in-page decision aid only; P2.5 must not create saved comparisons, comparison accounts, or a standalone comparison subsystem.

### 9.4 Use-case segmentation

Present use cases as “Which situation sounds like you?” rather than generic feature cards. Each path should lead to the corresponding solution page or finder state.

### 9.5 Cost comparison

Keep comparison content only where supported by factual assumptions. Avoid exact savings claims unless source data and assumptions are visible. The component should explain cost categories rather than promise a percentage saving.

### 9.6 Trust and facility proof

Combine gallery, security, and operational reassurance more coherently:

- real facility imagery;
- factual access/security attributes;
- concise operational explanations;
- no fabricated customer testimonials.

### 9.7 Location

Promote the location section into a conversion checkpoint:

- facility image;
- factual location name/address only if approved;
- concise logistics/context information when available;
- CTA to view location detail;
- CTA to request viewing.

### 9.8 How it works

Use a 3-step process aligned to the funnel:

1. Find a suitable storage option.
2. Request quote or viewing.
3. NupsBox confirms the next step.

Avoid language implying instant reservation.

### 9.9 FAQ and final CTA

FAQ remains searchable/scan-friendly through accordions and topic grouping if enough data exists.

Final CTA should be a low-friction closure with one primary action. It should not repeat a large form if the user can enter the existing quote/booking flow.

## 10. Storage / unit browsing experience

Public storage pages should answer:

- What sizes/types exist?
- What can each be used for?
- Which one may fit me?
- What is the next step?

Enhancements:

- clear filters using existing factual attributes;
- recommended/default sorting where logic is transparent;
- comparison limited to 3 units;
- sticky summary/action region on desktop where appropriate;
- bottom-sheet or sticky CTA on mobile where appropriate;
- direct handoff to quote/viewing with selected unit context.

Selected unit context should be passed through the existing lead/booking flow only if supported safely by current interfaces.

## 11. Pricing page

The pricing page should optimize understanding, not merely display cards.

Design:

- pricing explainer hero;
- compact “what affects price” section;
- factual unit/pricing table or cards from production data;
- comparison/recommendation helper;
- FAQ around terms where approved content exists;
- CTA: find suitable storage first, quote second.

If production pricing is absent, render an honest “contact/request quote” fallback rather than fabricated sample prices.

## 12. Locations experience

### 12.1 Locations listing

For one current physical location, avoid making the page look artificially sparse or pretending there are multiple branches.

Use:

- strong single-location feature layout;
- real image gallery;
- address only when approved;
- relevant public facts;
- unit options at that location when data exists;
- viewing request CTA.

Architecture remains multi-location capable.

### 12.2 Location detail

Detail page should combine:

- facility hero/media;
- essential location facts;
- storage options;
- access/security facts;
- FAQ if relevant;
- viewing CTA with location preselected.

## 13. Quote and Light Booking experience

### 13.1 Form UX

Redesign form presentation without changing CRM meaning:

- grouped fields;
- clear required vs optional labels;
- contextual summary of selected storage/location;
- inline validation;
- clear submission state;
- accessible error summary when necessary;
- success state explaining what happens next.

### 13.2 Quote vs viewing

Use a shared conversion shell but preserve distinct intent:

- Quote request = customer wants commercial follow-up.
- Viewing request = customer proposes a time; it remains a request, not a confirmed appointment.

No copy may imply immediate confirmation.

### 13.3 Form minimization

Do not add new required fields merely for marketing analytics. Existing validation/business requirements remain the baseline.

## 14. Contextual conversion layer

Introduce a reusable public CTA component that can adapt by page context.

Possible modes:

- finder;
- quote;
- viewing;
- location-specific viewing;
- unit-specific quote.

It must receive explicit context rather than infer business-critical values from DOM state.

This layer may power:

- desktop sticky CTA only after the page's primary above-the-fold action is no longer visible;
- mobile action bar;
- section-end CTA bands;
- unit/location card actions.

Avoid displaying the sticky layer on routes where it competes with an active form.

## 15. Analytics and funnel instrumentation

Reuse the existing analytics event abstraction. Add events only where they answer a product question.

Recommended events:

- `public_primary_cta_click`
- existing `storage_finder_start`
- existing `storage_finder_complete`
- `storage_recommendation_cta_click`
- `unit_compare_open`
- `quote_flow_start`
- `viewing_flow_start`
- existing successful lead/booking events where already implemented

Event metadata may include route, locale, unit/location IDs, and CTA placement when non-sensitive.

Never include name, phone, email, message body, or other personal form values in analytics.

## 16. Accessibility

Acceptance expectations:

- semantic headings in logical order;
- all interactive controls keyboard reachable;
- visible focus indicators;
- minimum practical touch target near 44px;
- sufficient contrast for normal and muted text;
- `aria-pressed`/fieldset semantics retained or improved for finder selections;
- dialogs/drawers, if introduced, must trap/restore focus correctly;
- content and actions usable with `prefers-reduced-motion`;
- form errors announced accessibly.

## 17. Responsive behavior

Design mobile-first for conversion-critical components.

### Mobile

- single clear CTA hierarchy;
- no oversized hero that hides the first actionable control far below the fold;
- guided finder uses full-width choices/cards;
- comparison can use stacked rows or a controlled horizontal pattern;
- sticky action bar must respect safe-area insets and not cover form controls.

### Tablet

- progressive two-column layouts where content density supports them;
- avoid desktop navigation crammed into tablet widths.

### Desktop

- stronger asymmetric layouts;
- persistent contextual summary/CTA only where useful;
- max content width controls reading length.

## 18. Performance

The refresh must not trade conversion for excessive visual weight.

Requirements:

- prefer server components for static/content composition;
- keep interactive islands small;
- use `next/image` for facility/media imagery;
- do not add a large animation framework unless a concrete requirement cannot be met otherwise;
- avoid autoplay background video in this phase;
- lazy-load below-the-fold non-critical media;
- preserve fast initial interaction for finder and forms.

## 19. SEO and content integrity

- Existing locale metadata, hreflang, robots, sitemap, and structured data architecture remain authoritative.
- UI redesign must not change canonical domain to `nupsbox.vn` before the separate domain cutover gate.
- Static/structured business facts must be corrected or approved before custom-domain go-live.
- Current known concern remains: static JSON-LD contains the address `1/1 Nguyễn Hữu Tiến, Tây Thạnh, Tân Phú, TP.HCM` while production location data was previously empty; P2.5 must not elevate this into additional UI surfaces unless approved.
- Booking pages remain noindex where current product policy requires it.

## 20. Error, empty, loading, and fallback states

The redesign must explicitly handle:

- no unit catalog data;
- no pricing data;
- no location data;
- no phone/Zalo setting;
- finder cannot produce a recommendation;
- lead submission validation failure;
- lead API/network failure;
- viewing request invalid time;
- content image unavailable.

Fallbacks must remain useful and truthful. Missing business data should produce a contact/request-quote fallback, not invented values.

## 21. Component architecture

The implementation should favor reusable public primitives instead of page-local class duplication.

Expected categories:

### UI primitives

- section/container variants;
- heading/eyebrow pattern;
- button/CTA variants;
- card variants;
- badges/chips;
- empty/error states;
- optional drawer/sheet only if needed for mobile compare/navigation.

### Marketing composition

Evolve existing components rather than replacing all of them:

- `Hero`
- `FeaturedUnits`
- `UseCases`
- `CostComparison`
- `Gallery`
- `SecurityBenefits`
- `HowItWorks`
- `HomeFaq`
- `FinalCta`
- `SiteHeader`
- `SiteFooter`
- `MobileActionBar`

### Conversion components

- enhanced `StorageFinder` and result presentation;
- reusable contextual CTA layer;
- quote/viewing conversion shell;
- lightweight comparison component.

Components should accept typed explicit data/context and remain independently testable.

## 22. Testing strategy

Implementation will use TDD for behavior changes.

### Unit/component tests

Cover at minimum:

- finder step/progress behavior;
- recommendation result state;
- CTA context/URL generation;
- comparison selection limit of 3;
- missing-data fallbacks;
- quote/viewing distinction;
- locale rendering for critical conversion labels where logic exists.

### Existing quality gates

Must continue to pass:

- lint;
- typecheck;
- unit test suite;
- production build;
- database pgTAP/RLS contracts.

### Browser/E2E

Add or update browser tests for:

- primary homepage funnel;
- finder → recommendation → quote handoff;
- finder/result → viewing handoff;
- mobile navigation and action bar;
- public critical routes;
- anonymous admin remains protected;
- invalid lead API request still creates no lead.

Production-write smoke must not be repeated casually. Existing P2.4 production safety rules remain in force.

## 23. Rollout strategy

Implementation should be split into reviewable tasks/commits, roughly:

1. public design tokens/primitives;
2. header/footer/mobile navigation/action layer;
3. homepage hero + composition refresh;
4. Storage Finder guided experience;
5. unit browsing/comparison;
6. pricing page;
7. location list/detail;
8. quote + Light Booking form UX;
9. responsive/accessibility polish;
10. analytics, test coverage, final production-readiness verification.

The exact task plan will be produced only after this spec is approved.

## 24. Success criteria

P2.5 is complete when:

- all major public routes use the refreshed visual system consistently;
- the homepage primary path is clearly Find Storage → Recommendation → Quote/View Request;
- Storage Finder gives an accessible recommendation flow without requiring contact data first;
- unit/location context can carry into conversion flows where supported by existing interfaces;
- quote and viewing forms are visually improved without changing CRM semantics;
- mobile navigation and conversion controls are intentional and do not obstruct content;
- missing production business data renders truthful fallbacks;
- no fabricated marketing facts are introduced;
- no admin redesign or domain cutover is bundled into the phase;
- lint, typecheck, tests, build, database contracts, and agreed E2E checks pass on the final branch;
- production deployment is performed only after normal review/merge gates.

## 25. Deferred follow-up

After P2.5 stabilizes, the next independent design phase may cover **Admin UI/UX refresh**, including CRM information density, lead/appointment timeline ergonomics, dashboard summaries, mobile admin usage, and operational shortcuts. That phase must get its own design approval and implementation plan.
