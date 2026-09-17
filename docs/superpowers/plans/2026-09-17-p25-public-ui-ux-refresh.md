# P2.5 Public UI/UX Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild NupsBox’s public website into a modern conversion-focused experience that guides visitors from discovery to storage recommendation to quote/viewing request without changing CRM semantics or inventing business facts.

**Architecture:** Keep the existing Next.js App Router and feature boundaries. Add a small public design-system layer, a typed contextual conversion layer, and focused interactive islands for finder/compare/forms; leave catalog, lead, booking, SEO, Supabase, and server-side data access authoritative. Public route components compose these units, while analytics records only non-sensitive funnel metadata.

**Tech Stack:** Next.js 16.3.3 App Router, React 19.3, TypeScript 5.9, Tailwind CSS 4.3, next-intl 4.14.4, lucide-react, Vitest 5 + Testing Library, Playwright 1.63, Supabase/Postgres.

**Spec:** `docs/superpowers/specs/2026-09-17-p25-public-ui-ux-refresh-design.md`

## Global Constraints

- Public site only; admin UI redesign is deferred.
- Primary funnel: **Find suitable storage → Request quote / Request viewing appointment**.
- Keep P2.3 lead/appointment lifecycle and P2.4 production safety contracts unchanged.
- No payment, deposits, inventory reservation, real-time stock locking, calendar sync, automated messaging, or guaranteed booking.
- Do not seed unapproved business data and do not fabricate inventory, availability, pricing, testimonials, ratings, customer counts, phone/Zalo values, urgency, or guarantees.
- Do not cut over `nupsbox.vn`, change canonical origin, or modify DNS in this plan.
- No production database DDL is expected.
- Compare at most **3** unit types.
- No new animation framework; preserve `prefers-reduced-motion`.
- Use server components for static composition and keep client islands small.
- Analytics must never contain name, phone, email, message body, or other personal form values.
- Phone/Zalo actions render only when an approved configured value exists.
- Booking copy must say the time is a request to be confirmed, never a reservation.
- Node remains `>=24.19.0 <25`; keep Next.js/React versions already pinned by the repository.

---

## File Structure

### New public UI primitives
- `components/ui/section.tsx` — standard/narrow section layout and tone variants.
- `components/ui/section-heading.tsx` — reusable eyebrow/title/description hierarchy.
- `components/marketing/conversion-cta.tsx` — reusable typed CTA link that tracks placement/context.
- `features/marketing/conversion.ts` — pure mapping from conversion intent/context to localized route/href metadata.
- `tests/unit/marketing-conversion.test.ts` — route/context contract tests.

### Finder and comparison
- `features/storage-finder/handoff.ts` — converts finder selection into lead/booking query context.
- `components/units/unit-compare.tsx` — client-side compare selection, maximum 3 units.
- `features/catalog/compare.ts` — pure compare-state helper.
- `tests/unit/catalog-compare.test.ts` — maximum-three and toggle semantics.

### Forms
- `components/forms/lead-form-fields.tsx` — reusable contact/message fields.
- `components/forms/conversion-summary.tsx` — selected unit/location/intent summary; no business inference.
- `components/forms/lead-form.tsx` — keeps submission/attribution/appointment state and composes the two new components.

### Existing files modified by the refresh
- `app/globals.css`
- `components/ui/button.tsx`
- `components/marketing/site-header.tsx`
- `components/marketing/site-footer.tsx`
- `components/marketing/mobile-action-bar.tsx`
- `components/marketing/hero.tsx`
- `components/marketing/featured-units.tsx`
- `components/marketing/use-cases.tsx`
- `components/marketing/cost-comparison.tsx`
- `components/marketing/gallery.tsx`
- `components/marketing/security-benefits.tsx`
- `components/marketing/how-it-works.tsx`
- `components/marketing/social-proof.tsx`
- `components/marketing/home-faq.tsx`
- `components/marketing/final-cta.tsx`
- `components/storage-finder/storage-finder.tsx`
- `components/storage-finder/storage-result.tsx`
- `components/units/unit-card.tsx`
- `components/locations/location-card.tsx`
- `features/analytics/events.ts`
- `app/[locale]/layout.tsx`
- `app/[locale]/page.tsx`
- `app/[locale]/kho-mini/page.tsx`
- `app/[locale]/bang-gia/page.tsx`
- `app/[locale]/dia-diem/page.tsx`
- `app/[locale]/dia-diem/[slug]/page.tsx`
- `app/[locale]/lien-he/page.tsx`
- `app/[locale]/dat-kho/page.tsx`
- existing solution/about/how-to/FAQ public pages listed in `tests/e2e/public-pages.spec.ts`
- `tests/e2e/mobile-shell.spec.ts`
- `tests/e2e/storage-finder.spec.ts`
- `tests/e2e/public-pages.spec.ts`

---

### Task 1: Establish public design-system primitives

**Files:**
- Create: `components/ui/section.tsx`
- Create: `components/ui/section-heading.tsx`
- Modify: `components/ui/button.tsx`
- Modify: `app/globals.css`
- Test: `tests/unit/public-ui-primitives.test.tsx`

**Interfaces:**
- Produces:
  - `Section({tone?, size?, className?, children})`
  - `SectionHeading({eyebrow?, title, description?, align?})`
  - `buttonClassName({variant, size, className})` with variants `primary | secondary | ghost | dark` and sizes `md | lg`.

- [ ] **Step 1: Write the failing primitive contract test**

Create `tests/unit/public-ui-primitives.test.tsx`:

```tsx
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
import {buttonClassName} from '@/components/ui/button';

describe('public UI primitives', () => {
  it('renders a semantic section heading with optional description', () => {
    render(
      <Section>
        <SectionHeading eyebrow="MINI STORAGE" title="Find your fit" description="Two quick questions." />
      </Section>
    );
    expect(screen.getByRole('heading', {level: 2, name: 'Find your fit'})).toBeInTheDocument();
    expect(screen.getByText('Two quick questions.')).toBeInTheDocument();
  });

  it('exposes a dark button variant with a practical touch target', () => {
    const classes = buttonClassName({variant: 'dark', size: 'lg'});
    expect(classes).toContain('min-h-12');
    expect(classes).toContain('bg-[var(--nupsbox-navy)]');
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
npm run test:run -- tests/unit/public-ui-primitives.test.tsx
```

Expected: FAIL because `section.tsx`, `section-heading.tsx`, and the `dark` button variant do not exist.

- [ ] **Step 3: Implement the primitives and token layer**

Create `components/ui/section.tsx`:

```tsx
import type {ReactNode} from 'react';
import clsx from 'clsx';
import {Container} from './container';

export function Section({
  tone = 'white',
  size = 'default',
  className,
  children
}: {
  tone?: 'white' | 'soft' | 'navy';
  size?: 'compact' | 'default';
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={clsx(
        size === 'compact' ? 'py-14 sm:py-16' : 'py-18 sm:py-24',
        tone === 'white' && 'bg-white text-[var(--nupsbox-ink)]',
        tone === 'soft' && 'bg-[var(--nupsbox-surface)] text-[var(--nupsbox-ink)]',
        tone === 'navy' && 'bg-[var(--nupsbox-navy)] text-white',
        className
      )}
    >
      <Container>{children}</Container>
    </section>
  );
}
```

Create `components/ui/section-heading.tsx` with one `h2`, optional eyebrow/description, and `left | center` alignment. Extend `button.tsx` with `dark`. In `globals.css`, retain existing brand colors and add only reusable tokens needed by the spec, such as `--nupsbox-surface-raised`, `--nupsbox-muted`, `--nupsbox-shadow-sm`, `--nupsbox-shadow-lg`; do not introduce page-specific colors.

- [ ] **Step 4: Run focused test plus typecheck**

```bash
npm run test:run -- tests/unit/public-ui-primitives.test.tsx
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css components/ui tests/unit/public-ui-primitives.test.tsx
git commit -m "feat: establish public design system primitives"
```

---

### Task 2: Add typed conversion intents and safe analytics events

**Files:**
- Create: `features/marketing/conversion.ts`
- Create: `components/marketing/conversion-cta.tsx`
- Modify: `features/analytics/events.ts`
- Test: `tests/unit/marketing-conversion.test.ts`
- Test: `tests/unit/analytics-events.test.ts`

**Interfaces:**
- Produces:
  - `type ConversionIntent = 'finder' | 'quote' | 'viewing'`
  - `type ConversionContext = {unitSlug?: string; unitId?: string; locationSlug?: string; locationId?: string; need?: string; volume?: string}`
  - `buildConversionHref(locale, intent, context): string`
  - `ConversionCta({locale, intent, context?, placement, children, variant?, size?})`
- `ConversionCta` tracks only `intent`, `placement`, route-safe IDs/slugs, and locale.

- [ ] **Step 1: Write failing routing/analytics tests**

```ts
import {describe, expect, it} from 'vitest';
import {buildConversionHref} from '@/features/marketing/conversion';

describe('buildConversionHref', () => {
  it('routes finder intent to the homepage finder anchor', () => {
    expect(buildConversionHref('vi', 'finder', {})).toBe('/#storage-finder');
    expect(buildConversionHref('en', 'finder', {})).toBe('/en#storage-finder');
  });

  it('passes explicit unit/location context to quote and viewing routes', () => {
    expect(buildConversionHref('vi', 'quote', {unitSlug: 's'})).toBe('/lien-he?unit=s');
    expect(buildConversionHref('en', 'viewing', {locationSlug: 'tan-phu'}))
      .toBe('/en/book-storage?location=tan-phu');
  });

  it('does not accept personal form values in ConversionContext', () => {
    const context = {unitId: 'verified-s'};
    expect(Object.keys(context)).toEqual(['unitId']);
  });
});
```

Extend the analytics event union test to require `public_primary_cta_click`, `storage_recommendation_cta_click`, `unit_compare_open`, `quote_flow_start`, `viewing_flow_start`.

- [ ] **Step 2: Run focused tests and verify RED**

```bash
npm run test:run -- tests/unit/marketing-conversion.test.ts tests/unit/analytics-events.test.ts
```

Expected: FAIL because conversion helper and new event names are missing.

- [ ] **Step 3: Implement pure href builder and client CTA**

`buildConversionHref` must use `URLSearchParams` and add only defined context keys. `ConversionCta` is a small `'use client'` wrapper around an anchor/locale-safe href and calls:

```ts
trackEvent(
  intent === 'finder' ? 'public_primary_cta_click' :
  intent === 'quote' ? 'quote_flow_start' : 'viewing_flow_start',
  {placement, locale, unitId: context?.unitId, locationId: context?.locationId}
);
```

Never pass the entire query object or form state to analytics.

- [ ] **Step 4: Run tests and typecheck**

```bash
npm run test:run -- tests/unit/marketing-conversion.test.ts tests/unit/analytics-events.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add features/marketing features/analytics components/marketing/conversion-cta.tsx tests/unit
git commit -m "feat: add contextual public conversion layer"
```

---

### Task 3: Redesign the global public shell

**Files:**
- Modify: `components/marketing/site-header.tsx`
- Modify: `components/marketing/site-footer.tsx`
- Modify: `components/marketing/mobile-action-bar.tsx`
- Modify: `app/[locale]/layout.tsx`
- Modify: `messages/vi.json`
- Modify: `messages/en.json`
- Test: `tests/e2e/mobile-shell.spec.ts`
- Test: `tests/e2e/public-pages.spec.ts`

**Interfaces:**
- Header primary CTA uses `ConversionCta(intent="finder", placement="header")`.
- `MobileActionBar` receives optional `phoneUrl?: string | null`, `zaloUrl?: string | null`, and a public `mode?: 'default' | 'viewing'`.
- Missing phone/Zalo values remove those actions rather than redirecting them to contact.

- [ ] **Step 1: Update E2E expectations first**

Replace the current mobile test that always expects Zalo with:

```ts
test('mobile visitor gets an honest persistent conversion bar', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/');
  const actions = page.getByRole('navigation', {name: /quick actions/i});
  await expect(actions).toBeVisible();
  await expect(actions.getByRole('link', {name: /tìm kho/i})).toBeVisible();
  await expect(actions.getByRole('link', {name: /zalo/i})).toHaveCount(0);
});
```

Add a public-pages assertion that the header exposes one primary “Tìm kho phù hợp”/“Find storage” action.

- [ ] **Step 2: Run E2E and verify RED**

```bash
npm run test:e2e -- tests/e2e/mobile-shell.spec.ts tests/e2e/public-pages.spec.ts
```

Expected: FAIL because current mobile shell substitutes `/lien-he` for missing phone/Zalo and header still leads to quote.

- [ ] **Step 3: Implement global shell redesign**

- Header: stronger compact sticky shell, finder CTA, desktop navigation hierarchy, accessible mobile navigation trigger if needed.
- Footer: navigation + brand closure; render configured contact information only when present.
- Mobile action bar: finder always present; quote/contact always present; phone/Zalo only when actual values exist. Do not show more than three visible actions.
- `layout.tsx`: pass `null` for absent phone/Zalo instead of fabricating fallback action URLs.
- Keep current JSON-LD/canonical behavior unchanged in this task.

- [ ] **Step 4: Run E2E, lint, and typecheck**

```bash
npm run test:e2e -- tests/e2e/mobile-shell.spec.ts tests/e2e/public-pages.spec.ts
npm run lint
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/[locale]/layout.tsx components/marketing/site-header.tsx components/marketing/site-footer.tsx components/marketing/mobile-action-bar.tsx messages tests/e2e
git commit -m "feat: redesign public navigation and mobile conversion shell"
```

---

### Task 4: Rebuild the homepage hero and funnel composition

**Files:**
- Modify: `components/marketing/hero.tsx`
- Modify: `app/[locale]/page.tsx`
- Test: `tests/e2e/public-pages.spec.ts`
- Create: `tests/e2e/home-funnel.spec.ts`

**Interfaces:**
- Hero primary CTA: finder anchor.
- Hero secondary CTA: pricing.
- Homepage order becomes `Hero → Finder → Unit decision support → Use cases → trust/facility proof → location → how it works → FAQ → final CTA`.

- [ ] **Step 1: Write the failing homepage funnel test**

```ts
import {expect, test} from '@playwright/test';

test('homepage exposes a clear discovery-to-finder funnel', async ({page}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', {level: 1})).toContainText(/kho|space/i);
  const primary = page.getByRole('link', {name: /tìm kho phù hợp/i}).first();
  await expect(primary).toHaveAttribute('href', /#storage-finder$/);
  await primary.click();
  await expect(page.locator('#storage-finder')).toBeInViewport();
  await expect(page.getByRole('heading', {name: /kho nào phù hợp/i})).toBeVisible();
});
```

- [ ] **Step 2: Run and verify RED**

```bash
npm run test:e2e -- tests/e2e/home-funnel.spec.ts
```

Expected: FAIL because the hero copy/action hierarchy and final composition have not yet been refreshed.

- [ ] **Step 3: Implement the hero/composition**

Keep real facility imagery with `next/image`. Reduce copy length, preserve factual claims only, and ensure the first viewport presents what NupsBox is, who it serves, HCMC high-level operating area, finder CTA, pricing secondary CTA, and a factual trust row.

Use the new `Section`/`SectionHeading` primitives in homepage composition instead of repeating page-specific spacing classes.

- [ ] **Step 4: Run focused E2E and build**

```bash
npm run test:e2e -- tests/e2e/home-funnel.spec.ts tests/e2e/public-pages.spec.ts
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/marketing/hero.tsx app/[locale]/page.tsx tests/e2e
git commit -m "feat: rebuild homepage conversion funnel"
```

---

### Task 5: Upgrade Storage Finder into a guided conversion flow

**Files:**
- Create: `features/storage-finder/handoff.ts`
- Modify: `components/storage-finder/storage-finder.tsx`
- Modify: `components/storage-finder/storage-result.tsx`
- Modify: `features/analytics/events.ts`
- Modify: `tests/unit/storage-finder.test.ts`
- Modify: `tests/e2e/storage-finder.spec.ts`

**Interfaces:**
- Produces `buildFinderConversionContext(input, recommendation)` returning only `need`, `volume`, `unitSlug`, `unitId`.
- Finder states: `need → volume → recommendation`.
- Result actions: Quote + Viewing; unit detail remains a tertiary text link.
- Recommendation remains advisory and never claims availability.

- [ ] **Step 1: Extend the unit test first**

```ts
import {buildFinderConversionContext} from '@/features/storage-finder/handoff';

it('builds a non-sensitive handoff from finder selection', () => {
  const recommendation = recommendStorage({need: 'shop_online', volume: 'under_20'}, catalog);
  expect(buildFinderConversionContext(
    {need: 'shop_online', volume: 'under_20'},
    recommendation
  )).toEqual({
    need: 'shop_online',
    volume: 'under_20',
    unitSlug: 's',
    unitId: 's'
  });
});
```

Update Playwright expectations:

```ts
await expect(page.getByText(/bước 1/i)).toBeVisible();
await page.getByRole('button', {name: 'Shop online'}).click();
await expect(page.getByText(/bước 2/i)).toBeVisible();
await page.getByRole('button', {name: '≤ 20 thùng'}).click();
await expect(page.getByRole('heading', {name: 'Kho S'})).toBeVisible();
await expect(page.getByRole('link', {name: /nhận báo giá/i})).toHaveAttribute('href', /unit=s/);
await expect(page.getByRole('link', {name: /đặt lịch xem kho/i})).toHaveAttribute('href', /unit=s/);
```

- [ ] **Step 2: Run unit + E2E and verify RED**

```bash
npm run test:run -- tests/unit/storage-finder.test.ts
npm run test:e2e -- tests/e2e/storage-finder.spec.ts
```

Expected: FAIL because handoff/progress/dual conversion actions are missing.

- [ ] **Step 3: Implement guided finder**

Use fieldset/legend semantics. Add a visual step/progress indicator but keep both selections keyboard reachable. When the need changes after a completed recommendation, reset `volume` to `null` so the recommendation cannot become stale.

`StorageResult` uses `ConversionCta` for quote/viewing and tracks `storage_recommendation_cta_click` with action/placement, never form values.

- [ ] **Step 4: Run focused tests and typecheck**

```bash
npm run test:run -- tests/unit/storage-finder.test.ts
npm run test:e2e -- tests/e2e/storage-finder.spec.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add features/storage-finder components/storage-finder tests/unit/storage-finder.test.ts tests/e2e/storage-finder.spec.ts
git commit -m "feat: upgrade storage finder conversion flow"
```

---

### Task 6: Add decision-support unit cards and maximum-three comparison

**Files:**
- Create: `features/catalog/compare.ts`
- Create: `components/units/unit-compare.tsx`
- Modify: `components/units/unit-card.tsx`
- Modify: `components/marketing/featured-units.tsx`
- Modify: `app/[locale]/kho-mini/page.tsx`
- Test: `tests/unit/catalog-compare.test.ts`
- Create: `tests/e2e/unit-browsing.spec.ts`

**Interfaces:**
- Produces `toggleComparedUnit(selected: string[], unitId: string, max = 3): string[]` and `UnitCompare({units, locale})`.
- Compare displays factual fields only: name, `areaM2`, `recommendedFor`, verified price/fallback, and existing availability label if already available in the public model.

- [ ] **Step 1: Write failing compare tests**

```ts
import {describe, expect, it} from 'vitest';
import {toggleComparedUnit} from '@/features/catalog/compare';

describe('toggleComparedUnit', () => {
  it('adds and removes units', () => {
    expect(toggleComparedUnit([], 's')).toEqual(['s']);
    expect(toggleComparedUnit(['s'], 's')).toEqual([]);
  });

  it('caps comparison at three units without dropping prior choices', () => {
    expect(toggleComparedUnit(['s', 'm', 'l'], 'xl')).toEqual(['s', 'm', 'l']);
  });
});
```

- [ ] **Step 2: Run and verify RED**

```bash
npm run test:run -- tests/unit/catalog-compare.test.ts
```

Expected: FAIL because compare helper does not exist.

- [ ] **Step 3: Implement helper, cards, and compare UI**

`UnitCard` gains optional compare-control props rather than owning compare state. `UnitCompare` owns the client selection and renders a compact comparison region only when at least two units are selected. Disable unchecked compare controls after three units are selected and explain the maximum in visible text.

Do not fabricate `availableCount` or pricing. If price is null, continue showing “Liên hệ báo giá / Contact for pricing”.

- [ ] **Step 4: Add and run browser behavior test**

`tests/e2e/unit-browsing.spec.ts` selects two units, opens compare, asserts both names/areas are visible, then verifies a fourth selection is unavailable after three choices.

```bash
npm run test:run -- tests/unit/catalog-compare.test.ts
npm run test:e2e -- tests/e2e/unit-browsing.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add features/catalog/compare.ts components/units components/marketing/featured-units.tsx app/[locale]/kho-mini/page.tsx tests
git commit -m "feat: add unit decision support and comparison"
```

---

### Task 7: Recompose marketing proof and use-case sections

**Files:**
- Modify: `components/marketing/use-cases.tsx`
- Modify: `components/marketing/cost-comparison.tsx`
- Modify: `components/marketing/gallery.tsx`
- Modify: `components/marketing/security-benefits.tsx`
- Modify: `components/marketing/how-it-works.tsx`
- Modify: `components/marketing/social-proof.tsx`
- Modify: `components/marketing/home-faq.tsx`
- Modify: `components/marketing/final-cta.tsx`
- Modify: `app/[locale]/page.tsx`
- Test: `tests/e2e/home-funnel.spec.ts`

**Interfaces:**
- Use-case cards link to actual solution pages or finder states.
- `social-proof.tsx` becomes operational/facility proof unless verified customer proof exists; no fabricated testimonials.
- Final CTA uses one primary conversion action.

- [ ] **Step 1: Add failing semantic E2E assertions**

Extend `home-funnel.spec.ts`:

```ts
await expect(page.getByRole('heading', {name: /tình huống|situation/i})).toBeVisible();
await expect(page.getByText(/cctv/i)).toBeVisible();
await expect(page.getByRole('link', {name: /tìm kho phù hợp/i}).last()).toBeVisible();
await expect(page.getByText(/đánh giá 5 sao|5-star/i)).toHaveCount(0);
```

- [ ] **Step 2: Run and verify RED**

```bash
npm run test:e2e -- tests/e2e/home-funnel.spec.ts
```

Expected: FAIL until sections are recomposed/copy refreshed.

- [ ] **Step 3: Redesign the sections**

Use open layouts and alternating surfaces rather than wrapping every section in rounded cards. Keep exact cost-comparison claims qualitative unless backed by explicit data. Make `HowItWorks` exactly:
1. Find a suitable storage option.
2. Request quote or viewing.
3. NupsBox confirms the next step.

- [ ] **Step 4: Run E2E, lint, build**

```bash
npm run test:e2e -- tests/e2e/home-funnel.spec.ts
npm run lint
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/marketing app/[locale]/page.tsx tests/e2e/home-funnel.spec.ts
git commit -m "feat: strengthen public trust and decision sections"
```

---

### Task 8: Redesign pricing as an understanding-first page

**Files:**
- Modify: `app/[locale]/bang-gia/page.tsx`
- Reuse: `components/units/unit-card.tsx`
- Reuse: `components/units/unit-compare.tsx`
- Reuse: `components/marketing/conversion-cta.tsx`
- Create: `tests/e2e/pricing.spec.ts`

**Interfaces:**
- Null prices render an honest contact fallback.
- Primary pricing CTA goes to finder; quote is secondary.
- Compare supports at most three units.

- [ ] **Step 1: Write failing pricing tests**

```ts
import {expect, test} from '@playwright/test';

test('pricing page explains uncertainty and keeps finder primary', async ({page}) => {
  await page.goto('/bang-gia');
  await expect(page.getByRole('heading', {level: 1, name: /bảng giá kho mini/i})).toBeVisible();
  await expect(page.getByText(/liên hệ báo giá/i).first()).toBeVisible();
  await expect(page.getByRole('link', {name: /tìm kho phù hợp/i}).first()).toBeVisible();
});
```

- [ ] **Step 2: Run and verify RED**

```bash
npm run test:e2e -- tests/e2e/pricing.spec.ts
```

Expected: FAIL on new hierarchy/sections.

- [ ] **Step 3: Implement pricing hero, price drivers, units/compare, FAQ/CTA**

Use actual catalog values. Price-driver copy may mention factual categories such as unit size and current confirmed offer, but must not claim discount percentages or savings.

- [ ] **Step 4: Run pricing E2E + build**

```bash
npm run test:e2e -- tests/e2e/pricing.spec.ts
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/[locale]/bang-gia/page.tsx tests/e2e/pricing.spec.ts
git commit -m "feat: redesign pricing decision experience"
```

---

### Task 9: Upgrade location listing/detail into conversion checkpoints

**Files:**
- Modify: `components/locations/location-card.tsx`
- Modify: `app/[locale]/dia-diem/page.tsx`
- Modify: `app/[locale]/dia-diem/[slug]/page.tsx`
- Create: `tests/e2e/locations.spec.ts`

**Interfaces:**
- Location viewing CTA includes explicit `locationSlug`/`locationId`.
- Do not introduce the known fallback address into any new UI surface beyond locations/contact surfaces that already display location data.
- One physical location is presented as one strong feature, never a fake multi-location grid.

- [ ] **Step 1: Write failing location tests**

```ts
import {expect, test} from '@playwright/test';

test('single-location page does not pretend multiple branches exist', async ({page}) => {
  await page.goto('/dia-diem');
  await expect(page.getByRole('heading', {level: 1})).toBeVisible();
  await expect(page.getByRole('link', {name: /đặt lịch xem kho/i})).toHaveAttribute('href', /location=tan-phu/);
  await expect(page.getByText(/chi nhánh 2|branch 2/i)).toHaveCount(0);
});
```

- [ ] **Step 2: Run and verify RED**

```bash
npm run test:e2e -- tests/e2e/locations.spec.ts
```

Expected: FAIL because current card exposes detail only and no contextual viewing CTA.

- [ ] **Step 3: Implement location listing/detail refresh**

Use real facility media already approved in the codebase. Detail page shows factual location fields, its unit types, operational/security facts already represented by existing public content, and a contextual viewing CTA. Do not add map coordinates when null.

- [ ] **Step 4: Run E2E + typecheck**

```bash
npm run test:e2e -- tests/e2e/locations.spec.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/locations app/[locale]/dia-diem tests/e2e/locations.spec.ts
git commit -m "feat: upgrade public location journey"
```

---

### Task 10: Refactor and redesign quote/Light Booking conversion forms

**Files:**
- Create: `components/forms/lead-form-fields.tsx`
- Create: `components/forms/conversion-summary.tsx`
- Modify: `components/forms/lead-form.tsx`
- Modify: `app/[locale]/lien-he/page.tsx`
- Modify: `app/[locale]/dat-kho/page.tsx`
- Test: `tests/unit/public-booking.test.ts`
- Create: `tests/e2e/conversion-forms.spec.ts`

**Interfaces:**
- `LeadForm` remains the owner of UTM capture/persistence, `/api/leads` POST, rate-limit/error/success state, and optional appointment construction.
- New presentational components receive values/labels only; they never POST.
- Query context is parsed on the page/server boundary and passed explicitly as existing `locationId`, `unitTypeId`, `needType`, `estimatedVolume` props where a valid mapping exists.
- Appointment mode remains opt-in.

- [ ] **Step 1: Add failing form journey tests before refactor**

```ts
import {expect, test} from '@playwright/test';

test('quote flow shows selected context without adding required fields', async ({page}) => {
  await page.goto('/lien-he?unit=s');
  await expect(page.getByText(/Kho S/i)).toBeVisible();
  await expect(page.getByLabel(/tên/i)).toBeRequired();
  await expect(page.getByLabel(/số điện thoại/i)).toBeRequired();
  await expect(page.getByLabel(/^Email/)).not.toBeRequired();
});

test('viewing flow clearly says the requested time is not a reservation', async ({page}) => {
  await page.goto('/dat-kho?unit=s&location=tan-phu');
  await page.getByLabel(/đề xuất thời gian xem kho/i).check();
  await expect(page.getByText(/không phải giữ chỗ|not a reservation/i)).toBeVisible();
});
```

- [ ] **Step 2: Run and verify RED**

```bash
npm run test:e2e -- tests/e2e/conversion-forms.spec.ts
```

Expected: FAIL because query context summary is not rendered and form hierarchy is unchanged.

- [ ] **Step 3: Refactor with submission semantics unchanged**

Move only field markup into `LeadFormFields`; keep `submit()` behavior in `LeadForm`. Add `ConversionSummary` above form fields. Add inline field styles/focus/error affordances and a clearer success panel. Preserve the exact payload field names currently sent to `/api/leads`.

When a query slug cannot be resolved, ignore it rather than inventing an ID. Do not make email/message/viewing note required.

- [ ] **Step 4: Run booking/unit/E2E regressions**

```bash
npm run test:run -- tests/unit/public-booking.test.ts
npm run test:e2e -- tests/e2e/conversion-forms.spec.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/forms app/[locale]/lien-he app/[locale]/dat-kho tests
git commit -m "feat: refine quote and viewing conversion forms"
```

---

### Task 11: Apply the refreshed language to remaining public routes

**Files:**
- Modify: `components/marketing/solution-page.tsx`
- Modify: `app/[locale]/giai-phap/page.tsx`
- Modify: solution child pages under `app/[locale]/giai-phap/*/page.tsx`
- Modify: `app/[locale]/cach-thue/page.tsx`
- Modify: `app/[locale]/ve-nupsbox/page.tsx`
- Modify: `app/[locale]/cau-hoi-thuong-gap/page.tsx`
- Modify: public blog listing if it uses the old shell (`app/[locale]/blog/page.tsx`)
- Modify: `tests/e2e/public-pages.spec.ts`

**Interfaces:**
- All routes use shared `Section`, `SectionHeading`, and conversion CTA hierarchy.
- No route introduces new business data or fake proof.

- [ ] **Step 1: Add consistency assertions**

Extend `public-pages.spec.ts` so every listed public route returns OK, has exactly one visible `h1`, has no horizontal body overflow at `390px`, and exposes a route-appropriate primary CTA on solution/how-to/about pages.

Example:

```ts
test('solution page keeps one primary next action', async ({page}) => {
  await page.goto('/giai-phap/shop-online');
  await expect(page.getByRole('heading', {level: 1})).toHaveCount(1);
  await expect(page.getByRole('link', {name: /tìm kho phù hợp/i}).first()).toBeVisible();
});
```

- [ ] **Step 2: Run and verify RED**

```bash
npm run test:e2e -- tests/e2e/public-pages.spec.ts
```

Expected: at least the new CTA/overflow assertions fail before the consistency pass.

- [ ] **Step 3: Apply shared primitives and contextual CTA hierarchy**

Do not redesign each route as a one-off landing page. Reuse `solution-page.tsx` for solution routes and keep page files small. FAQ uses accessible disclosure markup already present or semantic `details/summary`; do not add a heavy accordion dependency.

- [ ] **Step 4: Run complete public-pages E2E**

```bash
npm run test:e2e -- tests/e2e/public-pages.spec.ts
npm run lint
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/marketing/solution-page.tsx app/[locale] tests/e2e/public-pages.spec.ts
git commit -m "feat: unify remaining public route experience"
```

---

### Task 12: Accessibility, responsive, analytics, SEO, and performance hardening

**Files:**
- Modify: `tests/e2e/mobile-shell.spec.ts`
- Modify: `tests/e2e/home-funnel.spec.ts`
- Modify: `tests/e2e/storage-finder.spec.ts`
- Modify: `tests/e2e/public-pages.spec.ts`
- Modify only implementation files exposed by failures.
- Do **not** modify production smoke data-write behavior.

**Interfaces:**
- Touch target baseline: `min-h-11`/44px practical minimum for conversion controls.
- Focus-visible styles remain visible.
- Finder uses fieldset/legend + `aria-pressed`.
- Mobile action bar never covers the active form submit region.
- Existing metadata/hreflang/robots/JSON-LD architecture remains in place.

- [ ] **Step 1: Add hardening assertions**

Add tests for keyboard tab reaching hero primary CTA then finder controls, finder selected state exposing `aria-pressed=true`, mobile `390x844` routes having no horizontal overflow, `/dat-kho` remaining `noindex`, and no `tel:` or external Zalo anchor existing when settings are null.

For horizontal overflow use:

```ts
const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
expect(overflow).toBe(false);
```

- [ ] **Step 2: Run E2E and capture any RED failures**

```bash
npm run test:e2e
```

Expected: new hardening assertions may expose layout/focus issues; existing business-flow tests must remain green.

- [ ] **Step 3: Fix only observed failures**

Examples: add `focus-visible` ring classes to custom compare toggles; add safe-area bottom padding to mobile shell if needed; remove fixed widths causing overflow; preserve metadata/noindex behavior if layout changes accidentally altered it. No unrelated refactor in this task.

- [ ] **Step 4: Run full local verification**

```bash
npm run lint
npm run typecheck
npm run test:run
npm run test:e2e
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "test: harden public ui accessibility and responsiveness"
```

---

### Task 13: Exact-head CI/preview verification and implementation evidence

**Files:**
- Modify: `docs/production-checklist.md` only if a section for current application release evidence already exists and can be updated without claiming unverified settings.
- Do not add a production data-write smoke for this UI-only phase.

**Interfaces:**
- Verification is against the exact final branch head SHA.
- Required checks: lint, typecheck, unit/integration tests, build, existing database tests, Vercel preview readiness, public preview smoke.
- Domain/DNS, factual business-data approval, and authenticated role E2E remain separate gates.

- [ ] **Step 1: Push final branch head and record SHA**

```bash
git rev-parse HEAD
git push -u origin codex/p25-public-ui-ux-refresh
```

Record the exact SHA in the PR description/evidence.

- [ ] **Step 2: Verify GitHub Actions on that exact SHA**

Confirm CI quality succeeds, Database Tests succeeds, any configured exact-head preview smoke succeeds, and no focused/only tests were committed.

- [ ] **Step 3: Verify Vercel Preview**

Check exact-head Preview deployment is `READY`. Probe at minimum `/`, `/kho-mini`, `/bang-gia`, `/dia-diem`, `/lien-he`, `/dat-kho`, `/en`, and anonymous `/admin` protection.

Do not submit a valid production lead/appointment from Preview unless the environment is explicitly isolated from production data. Invalid-input read/safety probes are acceptable when already provided by CI.

- [ ] **Step 4: Review the final diff against the spec**

Verify no admin redesign, no migration/DDL, no DNS/domain change, no fabricated business content, compare max 3, missing phone/Zalo hidden, finder → quote/viewing handoff works, booking wording remains request/confirmation language, and no PII analytics payload.

- [ ] **Step 5: Commit evidence docs only if changed**

```bash
git add docs/production-checklist.md
git commit -m "docs: record p2.5 public ui verification"
```

Skip this commit if the checklist does not need a factual update.

---

## Final Acceptance Gate

Before opening or marking the P2.5 PR ready for review, run fresh verification on the final implementation head:

```bash
npm ci
npm run lint
npm run typecheck
npm run test:run
npm run test:e2e
npm run build
```

Then confirm GitHub Database Tests and Vercel exact-head Preview are green.

The implementation is acceptable only when all of the following are true:

1. Homepage primary journey is **Find suitable storage → recommendation → Quote/View request**.
2. All public routes have one clear `h1` and coherent CTA hierarchy.
3. Storage Finder recommendation remains advisory.
4. Unit comparison caps at 3.
5. Pricing does not invent numbers when values are null.
6. One-location presentation does not imply multiple active branches.
7. Quote/booking payload semantics remain compatible with existing `/api/leads`.
8. Viewing time copy never implies confirmation or reservation.
9. Missing phone/Zalo values do not create fake contact actions.
10. Mobile 390px flow has no horizontal overflow and persistent actions do not cover forms.
11. Keyboard/focus and reduced-motion behavior remain usable.
12. Analytics contain no PII.
13. SEO/canonical/domain behavior remains unchanged from the pre-P2.5 production gate.
14. No admin UI, database DDL, production seed, or `nupsbox.vn` cutover is bundled into this PR.
