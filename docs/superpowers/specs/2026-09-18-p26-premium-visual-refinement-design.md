# P2.6 Premium Visual Refinement & Layout Hardening Design

**Date:** 2026-09-18  
**Branch:** `codex/p26-premium-visual-refinement`  
**Base:** `main@efdb3892d80536ee11b5d534d8688b761e68f489`

## 1. Purpose

P2.6 is a public-site visual refinement phase for NupsBox. It keeps the P2.5 conversion funnel and business semantics intact while improving first-screen composition, visual hierarchy, density, polish, and consistency across public routes.

The trigger is the production desktop screenshot showing that the sticky header plus oversized hero consumes nearly the full visible viewport. The headline and facility image dominate the screen, while description, CTA, trust cues, and the next section require scrolling before the user can understand the complete proposition.

P2.6 must make the site feel more premium, intentional, balanced, and editorial without becoming decorative, slow, or less conversion-focused.

## 2. Scope

In scope:
- public header and navigation proportions;
- homepage hero composition;
- global public typography and spacing rhythm;
- Section and SectionHeading presentation;
- homepage marketing sections;
- Storage Finder visual shell;
- unit/pricing/location cards and section composition;
- quote/contact/viewing page visual hierarchy;
- public solution/about/how-to/FAQ page consistency;
- mobile action bar and responsive layout polish;
- footer polish;
- responsive and visual-regression E2E coverage;
- exact-head Vercel Preview visual verification.

Out of scope:
- Admin redesign;
- CRM workflow or payload changes;
- database schema/migrations;
- production seed/business-data changes;
- payments, reservations, inventory locking, calendar sync, or messaging automation;
- `nupsbox.vn` DNS/canonical cutover;
- fabricated pricing, availability, testimonials, customer counts, operating hours, contact details, or addresses.

## 3. Current-state diagnosis

The current P2.5 homepage uses:
- header `min-h-18`;
- hero container `min-h-[650px]`;
- desktop H1 `lg:text-[4.65rem]`;
- hero image `lg:min-h-[570px]`;
- generous `py-14 / lg:py-20`.

These values are individually reasonable but compound into an oversized first viewport on common laptops.

The visible problem is not merely “too much height.” It is a hierarchy problem:
1. the headline occupies too many lines and too much visual mass;
2. the image is nearly equal in visual dominance to the headline;
3. description, CTA, and trust cues are pushed below the strongest visual area;
4. the first screen does not complete the value-proposition story;
5. large dark blocks create visual heaviness instead of premium restraint.

## 4. Design direction

The approved direction remains **modern conversion-focused**, upgraded with a **premium editorial layer**.

The visual character should be:
- confident but not loud;
- spacious but not vertically wasteful;
- high-contrast but not heavy;
- refined, with disciplined type scale and spacing;
- photography-led where real facility images exist;
- conversion-aware, with one obvious primary action;
- credible, avoiding decorative claims or fake proof.

The design should look closer to a polished premium service brand than a generic SaaS landing page.

## 5. First-viewport success criteria

Desktop layout must be tuned for at minimum:
- 1366 × 768;
- 1440 × 900;
- 1536 × 864.

At those sizes, the first viewport must show the complete primary narrative:
- header;
- location/eyebrow;
- full H1;
- supporting paragraph;
- primary CTA;
- secondary CTA where applicable;
- trust cues.

The user must not need to scroll merely to discover the primary CTA or finish reading the headline.

The next section may begin below the fold; the requirement is **complete hero comprehension**, not forcing two sections into one screen.

## 6. Header design

Desktop header target:
- visually compact, approximately 62–66 px rather than the current 72 px-class footprint;
- logo remains prominent but slightly tighter;
- navigation spacing reduced and optically centered;
- finder CTA remains primary but proportionally smaller;
- sticky behavior remains;
- background retains navy/glass character with less visual bulk.

Mobile:
- 56–64 px practical height;
- menu control keeps minimum 44 px touch target;
- no overlap with mobile action bar;
- locale switch remains clear.

No new navigation destinations are introduced.

## 7. Hero redesign

### 7.1 Layout

Use a more balanced desktop grid, approximately 52/48 or 54/46, with text and image optically aligned.

Hero height becomes content-driven rather than dominated by a large fixed minimum. Avoid a desktop `min-height` that causes content clipping or forces unnecessary scrolling.

Target desktop facility image height should be approximately 430–520 px depending on viewport, not a fixed 570+ px block.

### 7.2 Typography

The H1 must remain bold but use a fluid type scale with a lower upper bound. Recommended range:
- mobile: ~2.5–3.25rem;
- desktop: fluid ~3.5–4.25rem;
- tighter line-height around 0.98–1.04;
- controlled max width to produce intentional line breaks.

Do not hard-code a visually awkward manual `<br>` unless both VI and EN compositions are tested. Prefer width/type tuning first.

### 7.3 Content hierarchy

Order remains:
1. location/eyebrow;
2. H1;
3. concise supporting copy;
4. primary Finder CTA;
5. secondary pricing CTA;
6. compact trust row.

Spacing between these elements should be tighter and more rhythmic than P2.5.

### 7.4 Image treatment

Keep real NupsBox facility photography.

Refine image presentation using:
- slightly smaller radius than current oversized card when visually appropriate;
- restrained shadow/border;
- subtle gradient;
- compact facility caption;
- no fake badges or statistics.

The image should support the message, not compete with it.

## 8. Global typography system

Introduce a consistent public display hierarchy rather than page-local one-off sizes.

Recommended semantic scale:
- display/H1;
- page H1;
- section H2;
- card H3;
- eyebrow;
- body-large;
- body;
- meta/caption.

Use fluid CSS/Tailwind `clamp()` where it meaningfully improves desktop adaptation.

Avoid using `font-black` everywhere. Reserve the heaviest weight for key display and major section titles; secondary content should use semibold/bold to create hierarchy through contrast.

## 9. Spacing and density system

P2.6 introduces a visual density budget:

- compact public sections: roughly 48–64 px vertical padding;
- standard sections: roughly 64–88 px desktop, 48–64 px mobile;
- hero: compact enough for complete first-screen narrative;
- card internal padding: visually consistent, generally 20–28 px;
- section heading → content gap: usually 28–40 px rather than arbitrary large gaps.

The objective is not to shrink everything. The objective is to use whitespace where it improves grouping and remove whitespace that only increases scroll depth.

## 10. Section and background rhythm

Avoid long sequences of equally weighted blocks.

Homepage should alternate visual rhythm through:
- white;
- soft neutral surface;
- navy emphasis sections used sparingly;
- photography;
- compact divider or feature rows.

Dark navy sections should be reserved for important moments rather than dominating the page.

Section transitions should make the page scannable even before reading copy.

## 11. Cards and surfaces

Cards should feel premium through restraint:
- cleaner border contrast;
- softer shadows;
- consistent radii;
- fewer nested bordered boxes;
- stronger title/body spacing;
- no excessive badges;
- hover movement limited to subtle 1–2 px transforms where useful;
- reduced-motion respected.

Unit, pricing, location, Finder, and conversion cards should share the same surface vocabulary.

## 12. Storage Finder refinement

Behavior remains unchanged.

Visual changes:
- reduce dark-panel dominance;
- improve step hierarchy;
- make choices easier to scan;
- keep 44 px+ touch targets;
- make recommendation state visually distinct without resembling a confirmed booking;
- keep Finder prominent but not oversized;
- handoff CTAs remain Quote / View Storage.

No contact details are required before recommendation.

## 13. Homepage content hierarchy

Homepage should communicate in this sequence:

1. what NupsBox solves;
2. help visitor find a suitable size;
3. show concrete storage options;
4. show use cases;
5. demonstrate real facility/security context;
6. explain pricing/value without fabricated numbers;
7. show location and viewing path;
8. explain process;
9. answer objections/FAQ;
10. close with a focused CTA.

Existing P2.5 components remain the base. P2.6 should evolve rather than rewrite all sections.

## 14. Public route consistency

The following routes must share the same premium visual system:
- home;
- mini storage;
- pricing;
- location list/detail;
- solutions index/detail;
- how to rent;
- about;
- FAQ;
- contact/quote;
- booking/viewing;
- English equivalents.

Each page should:
- have exactly one H1;
- use a compact page hero/header where appropriate;
- expose a clear next action;
- avoid oversized first sections;
- remain truthful when data is missing.

## 15. Responsive requirements

Verify at:
- 390 × 844;
- 768 × 1024 or comparable tablet;
- 1366 × 768;
- 1440 × 900;
- 1536 × 864.

Requirements:
- no horizontal overflow;
- no clipped headings;
- no CTA hidden below an unnecessary fixed-height hero;
- no sticky header/action-bar overlap;
- cards stack cleanly;
- image crops preserve the facility subject;
- touch targets remain practical;
- text line lengths remain readable.

## 16. Accessibility and motion

Preserve or improve:
- semantic heading order;
- keyboard focus rings;
- fieldset/legend Finder semantics;
- `aria-pressed` selected states;
- 44 px minimum practical touch targets;
- reduced-motion behavior;
- color contrast;
- form labels and error states.

Premium polish must never come at the cost of accessibility.

## 17. Performance constraints

Do not add an animation framework or large visual dependency.

Prefer:
- CSS transitions;
- existing Next/Image;
- Server Components by default;
- client components only where behavior already requires them;
- no background video;
- no autoplay carousel;
- no decorative heavy JS.

Hero LCP image remains optimized and prioritized.

## 18. Content integrity

P2.6 may tighten marketing copy for hierarchy and readability but must not introduce new factual claims.

Specifically:
- no invented savings percentages;
- no invented customer counts;
- no invented availability;
- no invented opening hours;
- no invented contacts;
- no invented addresses;
- no “real-time” or “instant booking” wording.

Existing static factual content that has not yet passed authoritative production-data approval must not be expanded into additional claims.

## 19. Testing strategy

### Unit/component
Add or update tests only where new reusable visual primitives or semantic variants are introduced.

### E2E layout
Add visual-layout assertions for:
- hero primary CTA visible at 1366 × 768 without scrolling;
- hero full H1 visible and not clipped at desktop target sizes;
- header height/density contract via bounding boxes where stable;
- no horizontal overflow on public routes;
- no sticky overlap on mobile;
- Finder remains keyboard/interactively usable.

Avoid brittle pixel-perfect snapshots. Use layout invariants and bounding boxes with reasonable tolerances.

### Browser visual verification
For the final Preview:
- inspect homepage at 1366 × 768, 1440 × 900, 1536 × 864, 390 × 844;
- capture screenshots where tooling allows;
- verify CTA visibility, text wrapping, image crop, and section rhythm;
- check public critical routes for obvious visual regressions;
- check console/framework errors.

### Existing gates
Must still pass:
- lint;
- typecheck;
- unit/integration tests;
- Playwright E2E;
- build;
- Database Tests pgTAP/RLS;
- Vercel exact-head Preview smoke.

## 20. Implementation boundaries

Likely shared files:
- `app/globals.css`;
- `components/ui/section.tsx`;
- `components/ui/section-heading.tsx`;
- `components/ui/button.tsx` only if proportion variants need refinement;
- public marketing components under `components/marketing`;
- Finder/units/location/form public presentation components;
- public page files only where composition needs adjustment;
- E2E tests.

Do not modify:
- Supabase migrations;
- CRM lifecycle logic;
- admin feature components;
- auth contracts;
- production-data write paths.

## 21. Rollout

Implementation should proceed as reviewable vertical slices:
1. layout/typography tokens and reusable primitives;
2. header + hero first-viewport fix;
3. homepage section rhythm and cards;
4. Finder/unit/pricing/location refinement;
5. contact/viewing and secondary route consistency;
6. mobile/accessibility hardening;
7. visual/browser verification and exact-head CI/Preview gate.

## 22. Acceptance criteria

P2.6 is acceptable when:
- the full homepage value proposition and primary CTA are visible without scrolling at 1366 × 768 and larger target desktop viewports;
- the hero no longer feels vertically oversized;
- typography hierarchy is more refined and uses heavy weights selectively;
- public routes share consistent spacing, heading, card, and CTA systems;
- layout looks balanced on desktop, tablet, and mobile;
- Finder/quote/viewing behavior remains unchanged from P2.5;
- no business-data, CRM, admin, database, or domain scope leaks into the phase;
- no fabricated claims are introduced;
- accessibility and reduced-motion behavior remain intact;
- all automated quality gates and final Preview visual checks pass.
