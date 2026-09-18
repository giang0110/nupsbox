# P2.6 Premium Visual Refinement & Layout Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the NupsBox public site into a premium, balanced, conversion-focused visual system where the complete homepage hero narrative and primary CTA fit within common laptop viewports without changing P2.5 business behavior.

**Architecture:** Preserve the P2.5 public funnel and data contracts. Tighten the shared visual layer first (`Section`, `SectionHeading`, new `PageIntro`, global tokens), then apply it in vertical slices: header/hero, homepage sections, Finder, catalog/location surfaces, conversion pages, and secondary routes. Visual correctness is verified through semantic Playwright layout invariants and exact-head Vercel browser checks rather than brittle pixel snapshots.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.9, Tailwind CSS v4 classes, next-intl, Next/Image, Vitest + Testing Library, Playwright, GitHub Actions, Vercel.

**Spec:** `docs/superpowers/specs/2026-09-18-p26-premium-visual-refinement-design.md`

## Global Constraints

- Public site only. Admin redesign is out of scope.
- Do not modify CRM lifecycle semantics, lead payload semantics, auth contracts, or database schema/migrations.
- Do not seed or mutate production business data.
- Do not cut over `nupsbox.vn` or alter canonical/domain configuration.
- Do not fabricate pricing, availability, testimonials, customer counts, opening hours, contact details, or addresses.
- Light Booking remains a request for confirmation, not a reservation, payment, or real-time inventory promise.
- Do not add an animation framework, background video, autoplay carousel, or large visual dependency.
- Prefer CSS transitions and existing Next/Image.
- Maintain practical 44 px+ touch targets, keyboard focus visibility, semantic headings, reduced-motion support, and color contrast.
- Verify 390×844, 768×1024, 1366×768, 1440×900, and 1536×864.
- At 1366×768 and larger target desktop viewports, the homepage first viewport must show the full H1, supporting paragraph, primary CTA, secondary CTA, and trust cues without scrolling.
- Existing quality gates remain mandatory: lint, typecheck, unit/integration tests, Playwright, build, Database Tests pgTAP/RLS, exact-head Vercel Preview smoke.

---

## File Structure

### Shared visual layer
- Modify: `app/globals.css` — premium surface/shadow/type-support tokens only.
- Modify: `components/ui/container.tsx` — public max-width/padding tuning if needed.
- Modify: `components/ui/section.tsx` — compact/default density contract.
- Modify: `components/ui/section-heading.tsx` — refined type hierarchy and weight.
- Create: `components/ui/page-intro.tsx` — reusable compact page hero for secondary public routes.
- Modify only if required: `components/ui/button.tsx` — proportional CTA sizing, no new behavior.

### Homepage shell
- Modify: `components/marketing/site-header.tsx`
- Modify: `components/marketing/hero.tsx`
- Modify: `components/marketing/featured-units.tsx`
- Modify: `components/marketing/use-cases.tsx`
- Modify: `components/marketing/gallery.tsx`
- Modify: `components/marketing/security-benefits.tsx`
- Modify: `components/marketing/cost-comparison.tsx`
- Modify: `components/marketing/how-it-works.tsx`
- Modify: `components/marketing/social-proof.tsx`
- Modify: `components/marketing/home-faq.tsx`
- Modify: `components/marketing/final-cta.tsx`
- Modify: `components/marketing/site-footer.tsx`
- Modify: `components/marketing/mobile-action-bar.tsx`
- Modify: `app/[locale]/page.tsx` only for composition/order wrappers, not business logic.

### Finder/catalog/conversion surfaces
- Modify: `components/storage-finder/storage-finder.tsx`
- Modify: `components/storage-finder/storage-result.tsx`
- Modify: `components/units/unit-card.tsx`
- Modify: `components/units/unit-compare.tsx`
- Modify: `components/locations/location-card.tsx`
- Modify: `components/forms/conversion-summary.tsx`
- Modify: `components/forms/lead-form.tsx`
- Modify: `components/forms/lead-form-fields.tsx`

### Secondary public routes
- Modify: `app/[locale]/bang-gia/page.tsx`
- Modify: `app/[locale]/kho-mini/page.tsx`
- Modify: `app/[locale]/dia-diem/page.tsx`
- Modify: `app/[locale]/dia-diem/[slug]/page.tsx`
- Modify: `app/[locale]/lien-he/page.tsx`
- Modify: `app/[locale]/dat-kho/page.tsx`
- Modify: `app/[locale]/giai-phap/page.tsx`
- Modify: `components/marketing/solution-page.tsx`
- Modify: `app/[locale]/cach-thue/page.tsx`
- Modify: `app/[locale]/ve-nupsbox/page.tsx`
- Modify: `app/[locale]/cau-hoi-thuong-gap/page.tsx`

### Verification
- Modify: `tests/unit/public-ui-primitives.test.tsx`
- Create: `tests/e2e/visual-layout.spec.ts`
- Modify only where semantic locators need alignment:
  - `tests/e2e/home-funnel.spec.ts`
  - `tests/e2e/public-pages.spec.ts`
  - `tests/e2e/mobile-shell.spec.ts`

---

### Task 1: Refine the shared public visual primitives

**Files:**
- Modify: `app/globals.css`
- Modify: `components/ui/container.tsx`
- Modify: `components/ui/section.tsx`
- Modify: `components/ui/section-heading.tsx`
- Create: `components/ui/page-intro.tsx`
- Test: `tests/unit/public-ui-primitives.test.tsx`

**Interfaces:**
- Consumes: existing `Container`, existing `Section` tone contract, existing `SectionHeading` tone contract.
- Produces:
  - `PageIntro({eyebrow, title, description, tone?, children?})`
  - `tone: 'light' | 'navy'`
  - children slot for CTA/action row
  - refined `Section` density classes without changing its public prop names.

- [ ] **Step 1: Extend the primitive tests with the desired density and page-intro semantics**

Add to `tests/unit/public-ui-primitives.test.tsx`:

```tsx
import {PageIntro} from '@/components/ui/page-intro';

it('uses the refined compact section density', () => {
  const {container} = render(<Section size="compact"><p>Compact</p></Section>);
  expect(container.firstElementChild).toHaveClass('py-12');
});

it('renders a reusable page intro with one semantic h1', () => {
  render(
    <PageIntro
      eyebrow="PRICING"
      title="Mini storage pricing"
      description="Clear choices before you enquire."
    >
      <a href="#next">Next</a>
    </PageIntro>
  );

  expect(screen.getByRole('heading', {level: 1, name: 'Mini storage pricing'})).toBeInTheDocument();
  expect(screen.getByText('Clear choices before you enquire.')).toBeInTheDocument();
  expect(screen.getByRole('link', {name: 'Next'})).toBeInTheDocument();
});

it('uses a lighter hierarchy for secondary section headings', () => {
  render(<SectionHeading eyebrow="LOCATION" title="See the space" description="Before you decide." />);
  expect(screen.getByRole('heading', {level: 2, name: 'See the space'})).toHaveClass('font-extrabold');
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npm run test:run -- tests/unit/public-ui-primitives.test.tsx
```

Expected: FAIL because `PageIntro` does not exist and current section/heading classes do not satisfy the refined density contract.

- [ ] **Step 3: Implement the shared visual primitives**

Create `components/ui/page-intro.tsx`:

```tsx
import type {ReactNode} from 'react';
import clsx from 'clsx';
import {Section} from './section';

export function PageIntro({
  eyebrow,
  title,
  description,
  tone = 'light',
  children
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  tone?: 'light' | 'navy';
  children?: ReactNode;
}) {
  const dark = tone === 'navy';

  return (
    <Section tone={dark ? 'navy' : 'soft'} size="compact">
      <div className="max-w-3xl py-1 sm:py-2">
        {eyebrow ? (
          <p className={clsx(
            'text-xs font-extrabold uppercase tracking-[0.14em]',
            dark ? 'text-[var(--nupsbox-yellow)]' : 'text-[var(--nupsbox-blue)]'
          )}>
            {eyebrow}
          </p>
        ) : null}
        <h1 className={clsx(
          'mt-3 text-[clamp(2.55rem,5vw,4.35rem)] font-extrabold leading-[1.02] tracking-[-0.045em]',
          dark ? 'text-white' : 'text-[var(--nupsbox-navy)]'
        )}>
          {title}
        </h1>
        {description ? (
          <p className={clsx(
            'mt-4 max-w-2xl text-base leading-7 sm:text-lg',
            dark ? 'text-white/70' : 'text-[var(--nupsbox-slate)]'
          )}>
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-6 flex flex-wrap gap-3">{children}</div> : null}
      </div>
    </Section>
  );
}
```

Update `Section` to:
- compact: `py-12 sm:py-14 lg:py-16`
- default: `py-16 sm:py-20 lg:py-22`

Update `SectionHeading` title to use:
`text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-[1.05] tracking-[-0.035em]`.

Update global tokens only where needed for subtler shadows/surfaces; do not alter brand colors.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run:

```bash
npm run test:run -- tests/unit/public-ui-primitives.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/globals.css components/ui/container.tsx components/ui/section.tsx components/ui/section-heading.tsx components/ui/page-intro.tsx tests/unit/public-ui-primitives.test.tsx
git commit -m "feat: refine public visual primitives"
```

---

### Task 2: Fix the desktop header and homepage first viewport

**Files:**
- Modify: `components/marketing/site-header.tsx`
- Modify: `components/marketing/hero.tsx`
- Create: `tests/e2e/visual-layout.spec.ts`

**Interfaces:**
- Consumes: `ConversionCta`, `buttonClassName`, real facility image URL.
- Produces: semantic hero region with `aria-labelledby="home-hero-title"` and stable first-viewport layout invariants.

- [ ] **Step 1: Write failing first-viewport layout tests**

Create `tests/e2e/visual-layout.spec.ts`:

```ts
import {expect, test} from '@playwright/test';

const desktopViewports = [
  {width: 1366, height: 768},
  {width: 1440, height: 900},
  {width: 1536, height: 864}
];

for (const viewport of desktopViewports) {
  test(`homepage hero completes its narrative at ${viewport.width}x${viewport.height}`, async ({page}) => {
    await page.setViewportSize(viewport);
    await page.goto('/');

    const hero = page.getByRole('region', {name: /thêm không gian|more room/i});
    const header = page.locator('header').first();
    const heading = hero.getByRole('heading', {level: 1});
    const primary = hero.getByRole('link', {name: /tìm kho phù hợp/i});
    const secondary = hero.getByRole('link', {name: /xem bảng giá/i});
    const trust = hero.getByText(/kho riêng/i);

    const headerBox = await header.boundingBox();
    const headingBox = await heading.boundingBox();
    const primaryBox = await primary.boundingBox();
    const secondaryBox = await secondary.boundingBox();
    const trustBox = await trust.boundingBox();

    expect(headerBox?.height ?? 999).toBeLessThanOrEqual(68);
    expect(headingBox?.y ?? 999).toBeGreaterThanOrEqual(headerBox?.height ?? 0);
    expect(primaryBox?.y ?? 999).toBeLessThan(viewport.height);
    expect(secondaryBox?.y ?? 999).toBeLessThan(viewport.height);
    expect((trustBox?.y ?? 999) + (trustBox?.height ?? 999)).toBeLessThanOrEqual(viewport.height);
  });
}
```

- [ ] **Step 2: Run the visual-layout test and verify RED**

Run:

```bash
npx playwright test tests/e2e/visual-layout.spec.ts
```

Expected: at least the 1366×768 case fails because the current 650 px hero / 570 px image / 4.65rem H1 pushes CTA/trust content below the first viewport.

- [ ] **Step 3: Refine the header**

In `site-header.tsx`:
- reduce desktop header from `min-h-18` to approximately `min-h-16`;
- reduce desktop logo block from `size-10` to `size-9`;
- preserve 44 px interactive touch targets;
- slightly tighten nav gap/padding;
- keep Finder CTA visible and primary;
- preserve mobile menu behavior.

- [ ] **Step 4: Refine the hero**

In `hero.tsx`:
- add `aria-labelledby="home-hero-title"` to the section;
- add `id="home-hero-title"` to the H1;
- remove `min-h-[650px]`;
- use content-driven grid padding such as `py-10 sm:py-12 lg:py-14`;
- use grid close to `lg:grid-cols-[1.06fr_.94fr]`;
- set H1 to a fluid upper bound around `clamp(3.35rem,5vw,4.2rem)`;
- reduce headline/content gaps;
- reduce desktop image from fixed 570 px to a responsive `min-h`/aspect combination around 440–500 px;
- retain the real image and facility caption;
- keep full copy and both CTAs;
- keep trust cues inside the hero region.

- [ ] **Step 5: Run the first-viewport test and verify GREEN**

Run:

```bash
npx playwright test tests/e2e/visual-layout.spec.ts
```

Expected: all three desktop hero cases PASS.

- [ ] **Step 6: Run homepage funnel regression**

Run:

```bash
npx playwright test tests/e2e/home-funnel.spec.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add components/marketing/site-header.tsx components/marketing/hero.tsx tests/e2e/visual-layout.spec.ts
git commit -m "fix: complete homepage hero within laptop viewport"
```

---

### Task 3: Harmonize homepage section rhythm and premium surfaces

**Files:**
- Modify: `components/marketing/featured-units.tsx`
- Modify: `components/marketing/use-cases.tsx`
- Modify: `components/marketing/gallery.tsx`
- Modify: `components/marketing/security-benefits.tsx`
- Modify: `components/marketing/cost-comparison.tsx`
- Modify: `components/marketing/how-it-works.tsx`
- Modify: `components/marketing/social-proof.tsx`
- Modify: `components/marketing/home-faq.tsx`
- Modify: `components/marketing/final-cta.tsx`
- Modify: `app/[locale]/page.tsx`
- Test: `tests/e2e/visual-layout.spec.ts`

**Interfaces:**
- Consumes: refined `Section`, `SectionHeading`.
- Produces: consistent homepage rhythm with restrained dark-section usage and no horizontal overflow.

- [ ] **Step 1: Add homepage rhythm invariants**

Append:

```ts
test('homepage major sections do not create excessive empty vertical bands', async ({page}) => {
  await page.setViewportSize({width: 1440, height: 900});
  await page.goto('/');

  const headings = page.locator('main h2:visible');
  const count = await headings.count();
  expect(count).toBeGreaterThan(5);

  for (let index = 0; index < count - 1; index += 1) {
    const current = await headings.nth(index).boundingBox();
    const next = await headings.nth(index + 1).boundingBox();
    if (!current || !next) continue;
    expect(next.y - current.y).toBeLessThan(1100);
  }
});

test('homepage stays free of horizontal overflow on desktop', async ({page}) => {
  await page.setViewportSize({width: 1366, height: 768});
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
});
```

- [ ] **Step 2: Run the focused visual tests**

Run:

```bash
npx playwright test tests/e2e/visual-layout.spec.ts
```

Record baseline; if all new invariants already pass, continue as a refactor task and retain them as regression guards.

- [ ] **Step 3: Refine each homepage section using shared primitives**

Apply these rules:
- replace custom `py-20 sm:py-24` wrappers with `Section` where practical;
- use `SectionHeading` rather than one-off H2 typography;
- reduce repeated `font-black` to `font-extrabold`/bold for secondary titles;
- use `rounded-2xl` / `rounded-3xl` consistently instead of oversized radii everywhere;
- use subtle shadows and borders;
- keep only `CostComparison` and `SocialProof` as strong navy emphasis moments;
- make Gallery photography visually prominent without increasing section height;
- keep factual copy unchanged except harmless line-length tightening.

- [ ] **Step 4: Check homepage composition order**

Keep the existing funnel order in `app/[locale]/page.tsx`; do not introduce new marketing sections or move Finder after product browsing.

- [ ] **Step 5: Run homepage visual + funnel tests**

```bash
npx playwright test tests/e2e/visual-layout.spec.ts tests/e2e/home-funnel.spec.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/marketing app/[locale]/page.tsx tests/e2e/visual-layout.spec.ts
git commit -m "feat: harmonize homepage premium visual rhythm"
```

---

### Task 4: Refine Storage Finder without changing recommendation behavior

**Files:**
- Modify: `components/storage-finder/storage-finder.tsx`
- Modify: `components/storage-finder/storage-result.tsx`
- Test: `tests/e2e/storage-finder.spec.ts`
- Test: `tests/e2e/visual-layout.spec.ts`

**Interfaces:**
- Consumes: existing `recommendStorage`, `buildFinderConversionContext`.
- Produces: same selection/recommendation/handoff behavior with a lighter visual shell.

- [ ] **Step 1: Add keyboard/size regression assertions**

Append:

```ts
test('finder remains usable by keyboard and avoids an oversized shell', async ({page}) => {
  await page.setViewportSize({width: 1366, height: 768});
  await page.goto('/');

  const finder = page.getByRole('region', {name: /kho nào phù hợp/i});
  const finderBox = await finder.boundingBox();
  expect(finderBox?.height ?? 9999).toBeLessThan(720);

  const firstChoice = finder.getByRole('button', {name: /shop online/i});
  await firstChoice.focus();
  await page.keyboard.press('Enter');
  await expect(firstChoice).toHaveAttribute('aria-pressed', 'true');
});
```

- [ ] **Step 2: Run Finder tests**

```bash
npx playwright test tests/e2e/storage-finder.spec.ts tests/e2e/visual-layout.spec.ts
```

Expected: behavior test remains PASS; size target may be RED depending on current rendered content.

- [ ] **Step 3: Refine Finder presentation**

- reduce dark left-panel visual weight;
- tighten panel padding;
- keep progress semantics;
- make option buttons scan cleanly with selected state contrast;
- keep practical touch targets;
- make result card visually premium but clearly advisory;
- preserve all event tracking and conversion URLs;
- do not change `recommendStorage`.

- [ ] **Step 4: Run Finder tests again**

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/storage-finder tests/e2e/storage-finder.spec.ts tests/e2e/visual-layout.spec.ts
git commit -m "feat: refine storage finder presentation"
```

---

### Task 5: Refine unit, comparison, pricing, and location surfaces

**Files:**
- Modify: `components/units/unit-card.tsx`
- Modify: `components/units/unit-compare.tsx`
- Modify: `components/locations/location-card.tsx`
- Modify: `app/[locale]/kho-mini/page.tsx`
- Modify: `app/[locale]/bang-gia/page.tsx`
- Modify: `app/[locale]/dia-diem/page.tsx`
- Modify: `app/[locale]/dia-diem/[slug]/page.tsx`
- Test: `tests/e2e/unit-browsing.spec.ts`
- Test: `tests/e2e/pricing.spec.ts`
- Test: `tests/e2e/locations.spec.ts`

**Interfaces:**
- Consumes: existing public catalog data and compare cap of 3.
- Produces: visually consistent catalog/location cards with unchanged truthfulness and conversion context.

- [ ] **Step 1: Preserve behavioral regression tests**

Run:

```bash
npx playwright test tests/e2e/unit-browsing.spec.ts tests/e2e/pricing.spec.ts tests/e2e/locations.spec.ts
```

Expected: PASS before visual edits.

- [ ] **Step 2: Apply premium card vocabulary**

For `UnitCard`, `UnitCompare`, and `LocationCard`:
- reduce nested boxiness;
- tighten card title/body hierarchy;
- keep availability labels exactly tied to real statuses;
- keep null pricing as contact-for-pricing;
- keep comparison cap at 3;
- reduce hover lift to subtle movement;
- preserve all conversion href context.

- [ ] **Step 3: Replace secondary-route custom hero markup with `PageIntro`**

Use `PageIntro` on:
- mini storage index;
- pricing;
- location index/detail where appropriate.

Pass existing localized copy; do not invent facts.

- [ ] **Step 4: Run route tests**

```bash
npx playwright test tests/e2e/unit-browsing.spec.ts tests/e2e/pricing.spec.ts tests/e2e/locations.spec.ts tests/e2e/public-pages.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/units components/locations app/[locale]/kho-mini app/[locale]/bang-gia app/[locale]/dia-diem
git commit -m "feat: polish catalog pricing and location surfaces"
```

---

### Task 6: Refine conversion forms and compact page intros

**Files:**
- Modify: `components/forms/conversion-summary.tsx`
- Modify: `components/forms/lead-form.tsx`
- Modify: `components/forms/lead-form-fields.tsx`
- Modify: `app/[locale]/lien-he/page.tsx`
- Modify: `app/[locale]/dat-kho/page.tsx`
- Test: `tests/e2e/conversion-forms.spec.ts`
- Test: `tests/e2e/visual-layout.spec.ts`

**Interfaces:**
- Consumes: existing `LeadForm` props and `/api/leads` payload behavior.
- Produces: same form semantics, clearer visual grouping, compact top-of-page narrative.

- [ ] **Step 1: Add a desktop conversion-page first-screen invariant**

Append:

```ts
for (const route of ['/lien-he', '/dat-kho']) {
  test(`${route} shows its h1 and form start without an oversized intro`, async ({page}) => {
    await page.setViewportSize({width: 1366, height: 768});
    await page.goto(route);
    const heading = page.locator('h1:visible');
    const firstField = page.getByLabel(/tên/i);
    const headingBox = await heading.boundingBox();
    const fieldBox = await firstField.boundingBox();

    expect(headingBox?.y ?? 999).toBeLessThan(320);
    expect(fieldBox?.y ?? 999).toBeLessThan(760);
  });
}
```

- [ ] **Step 2: Run conversion tests and verify baseline**

```bash
npx playwright test tests/e2e/conversion-forms.spec.ts tests/e2e/visual-layout.spec.ts
```

- [ ] **Step 3: Refine forms without touching submission logic**

- use `PageIntro` or a compact split composition;
- preserve required/optional fields exactly;
- tighten field spacing and label weight;
- refine `ConversionSummary` surface;
- preserve appointment request disclaimer;
- preserve phone/Zalo fallback truthfulness;
- do not change `submit()`, payload keys, attribution logic, or appointment construction.

- [ ] **Step 4: Run conversion tests again**

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/forms app/[locale]/lien-he app/[locale]/dat-kho tests/e2e/visual-layout.spec.ts
git commit -m "feat: refine public conversion page hierarchy"
```

---

### Task 7: Apply premium consistency to remaining public routes

**Files:**
- Modify: `app/[locale]/giai-phap/page.tsx`
- Modify: `components/marketing/solution-page.tsx`
- Modify: `app/[locale]/cach-thue/page.tsx`
- Modify: `app/[locale]/ve-nupsbox/page.tsx`
- Modify: `app/[locale]/cau-hoi-thuong-gap/page.tsx`
- Modify: `components/marketing/site-footer.tsx`
- Test: `tests/e2e/public-pages.spec.ts`

**Interfaces:**
- Consumes: `PageIntro`, `Section`, `SectionHeading`, `FinalCta`.
- Produces: one H1 per route, compact page-intro system, consistent section density.

- [ ] **Step 1: Add a public page intro density regression**

Append to `tests/e2e/public-pages.spec.ts`:

```ts
for (const route of ['/cach-thue', '/ve-nupsbox', '/cau-hoi-thuong-gap', '/giai-phap']) {
  test(`${route} keeps its primary heading near the top on desktop`, async ({page}) => {
    await page.setViewportSize({width: 1366, height: 768});
    await page.goto(route);
    const box = await page.locator('h1:visible').boundingBox();
    expect(box?.y ?? 999).toBeLessThan(300);
  });
}
```

- [ ] **Step 2: Run the public-page test**

```bash
npx playwright test tests/e2e/public-pages.spec.ts
```

- [ ] **Step 3: Adopt shared visual primitives**

- replace page-local oversized H1 blocks with `PageIntro`;
- keep route-specific content and CTA semantics;
- keep solution copy factual;
- refine FAQ details/summary spacing;
- make footer slightly tighter and visually calmer;
- keep mobile footer bottom padding for action bar clearance.

- [ ] **Step 4: Run public route tests**

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/[locale]/giai-phap app/[locale]/cach-thue app/[locale]/ve-nupsbox app/[locale]/cau-hoi-thuong-gap components/marketing/solution-page.tsx components/marketing/site-footer.tsx tests/e2e/public-pages.spec.ts
git commit -m "feat: unify premium public route presentation"
```

---

### Task 8: Harden mobile layout, sticky UI, and accessibility

**Files:**
- Modify: `components/marketing/mobile-action-bar.tsx`
- Modify if needed: `components/marketing/site-header.tsx`
- Modify if needed: `app/globals.css`
- Modify: `tests/e2e/mobile-shell.spec.ts`
- Modify: `tests/e2e/visual-layout.spec.ts`

**Interfaces:**
- Consumes: current honest contact fallback behavior.
- Produces: no sticky overlap, no horizontal overflow, preserved touch targets.

- [ ] **Step 1: Add mobile overlap assertions**

Append:

```ts
test('mobile sticky controls do not cover primary content', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/');

  const header = page.locator('header').first();
  const heroHeading = page.getByRole('heading', {level: 1});
  const actionBar = page.getByRole('navigation', {name: /quick actions/i});

  const headerBox = await header.boundingBox();
  const headingBox = await heroHeading.boundingBox();
  const barBox = await actionBar.boundingBox();

  expect(headerBox?.height ?? 999).toBeLessThanOrEqual(68);
  expect(headingBox?.y ?? 0).toBeGreaterThanOrEqual((headerBox?.height ?? 0) - 2);
  expect((barBox?.y ?? 0) + (barBox?.height ?? 0)).toBeLessThanOrEqual(844);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
});
```

- [ ] **Step 2: Run mobile tests and verify RED/GREEN status**

```bash
npx playwright test tests/e2e/mobile-shell.spec.ts tests/e2e/visual-layout.spec.ts
```

- [ ] **Step 3: Refine mobile action bar**

- visually reduce bulk while keeping minimum practical touch size;
- preserve Finder + Quote/View intent;
- preserve no fake call/Zalo actions when settings are absent;
- keep safe-area positioning;
- ensure footer spacing clears the bar.

- [ ] **Step 4: Run mobile tests again**

Expected: PASS.

- [ ] **Step 5: Run component/unit suite**

```bash
npm run test:run
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/marketing/mobile-action-bar.tsx components/marketing/site-header.tsx app/globals.css tests/e2e/mobile-shell.spec.ts tests/e2e/visual-layout.spec.ts
git commit -m "fix: harden responsive sticky public layout"
```

---

### Task 9: Run React quality review and remove visual implementation debt

**Files:**
- Review: all modified `.tsx` files from Tasks 1–8.
- Modify only where review finds a concrete issue.

**Interfaces:**
- Consumes: final TSX implementation.
- Produces: no unnecessary client state, no avoidable rerender regressions, no accidental large client boundary.

- [ ] **Step 1: Apply the Vercel React best-practices checklist**

Check specifically:
- no new client component unless interaction requires it;
- no inline component definitions inside render;
- no new effect-derived state;
- static arrays/objects can be hoisted where useful;
- no unnecessary large props crossing Server → Client;
- Next/Image remains used for facility imagery;
- no new bundle-heavy dependency.

- [ ] **Step 2: Run lint and typecheck**

```bash
npm run lint
npm run typecheck
```

Expected: both PASS.

- [ ] **Step 3: Run the full unit/integration suite**

```bash
npm run test:run
```

Expected: PASS.

- [ ] **Step 4: Commit any review-only fixes**

If files changed:

```bash
git add .
git commit -m "refactor: tighten P2.6 react presentation"
```

If no files changed, do not create an empty commit.

---

### Task 10: Final multi-viewport E2E, build, Preview, and browser visual verification

**Files:**
- Modify only if verification exposes a defect.
- Verify: GitHub Actions workflows already in repo.
- Verify: Vercel Preview exact-head deployment.

**Interfaces:**
- Consumes: final branch head.
- Produces: evidence that P2.6 meets the spec before PR readiness.

- [ ] **Step 1: Run the complete local/CI-equivalent quality set**

```bash
npm run lint
npm run typecheck
npm run test:run
npm run build
npx playwright test
```

Expected: all PASS.

- [ ] **Step 2: Open/update the PR as draft if not already open**

PR target: `main`  
Head: `codex/p26-premium-visual-refinement`

PR body must state:
- visual-only public scope;
- exact acceptance viewport set;
- no DB/CRM/admin/domain changes;
- production-data gates unchanged.

- [ ] **Step 3: Wait for exact-head CI**

Required:
- CI quality success;
- P2.5/P2.6 Playwright workflow success;
- Database Tests pgTAP/RLS success;
- Vercel Preview READY;
- Preview smoke success.

- [ ] **Step 4: Browser-verify the exact Preview at required viewport sizes**

Using browser tooling, inspect the homepage at:
- 390×844;
- 768×1024;
- 1366×768;
- 1440×900;
- 1536×864.

For each viewport verify:
- no framework error overlay;
- no horizontal overflow;
- no clipped H1;
- desktop first viewport contains full hero narrative and trust cues;
- mobile sticky elements do not cover content;
- image crop remains meaningful.

- [ ] **Step 5: Capture visual evidence**

Capture screenshots of at least:
- homepage 1366×768;
- homepage 1440×900;
- homepage 390×844;
- one pricing/catalog route;
- one contact/viewing route.

Do not treat screenshots as pixel-perfect regression baselines; use them for review evidence.

- [ ] **Step 6: Check exact Preview runtime logs**

Check `error` and `fatal` logs for the latest Preview window.

Expected: no new P2.6 runtime error/fatal cluster.

- [ ] **Step 7: Final scope audit**

Confirm:
- no `supabase/migrations/**` changes;
- no admin component changes;
- no production seed scripts/data mutations;
- no domain/canonical changes;
- no focused `.only` tests;
- no new heavy dependency.

- [ ] **Step 8: Mark PR ready only after all evidence is green**

Do not merge automatically. Integration remains a separate user decision.

