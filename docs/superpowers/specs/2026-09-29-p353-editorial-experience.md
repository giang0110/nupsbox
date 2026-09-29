# P3.53 — Editorial Experience & Deep Content

## Problem

The public site is information-rich but still feels vertically long and editorially thin:
- Home currently stacks seven sections.
- The hero already carries a real facility image, so the full gallery on Home repeats visual evidence.
- Proof, location journey and FAQ are all useful, but they compete for attention on the same page.
- Solution detail pages are too shallow for commercial evaluation.
- Production currently has zero published blog posts.

## Goals

1. Reduce Home to four high-signal sections:
   - Hero
   - Decision Hub
   - Insights
   - Final CTA
2. Move depth into service and editorial pages instead of repeating everything on Home.
3. Turn Blog into a real content hub with substantive bilingual articles tied to NupsBox use cases.
4. Make each solution page useful for decision-making, not just a marketing intro.
5. Keep CMS/blog/admin/security architecture intact.

## Home

Replace CommercialOverview + WarehouseGallery + HomeProofBento + HomeLocationJourney + HomeFaq with:
- HomeDecisionHub
  - 4 service/use-case entries
  - one compact “before you contact us” evidence panel
  - links to facility details and FAQ
- HomeInsights
  - one featured article
  - two supporting articles
  - link to full Blog

Home should fetch only the data needed for these sections.

## Solution pages

Each solution page should include:
- who the solution fits
- operating model / organization recommendations
- pre-rental checklist
- one editorial insight paragraph
- clear link to relevant contact/finder flow

## Blog

Seed six bilingual long-form foundation articles:
1. Mini storage for online sellers
2. How to choose storage size without over-renting
3. Small-stockroom organization for online sellers
4. Storage vs. expanding an office for small businesses
5. Managing slow-moving inventory without losing control
6. Personal storage for moving, renovation and seasonal rotation

Articles must be practical, analytical and product-relevant, not generic promotional copy.
Where external operational guidance is used, source_url may point to the reference.

## Blog UX

- Feature the newest article prominently.
- Show remaining articles as editorial cards.
- Preserve existing CMS publishing workflow and article URLs.
- Preserve structured body rendering and SEO.

## Release gate

- lint/typecheck/unit/build green
- Playwright E2E green
- Database pgTAP green
- apply blog seed migration to production
- verify published posts in both locales
- merge and production smoke
