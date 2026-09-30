import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('P3.58 premium visual composition and conversion flow', () => {
  it('keeps the homepage to the existing four primary blocks', () => {
    const home = source('app/[locale]/page.tsx');

    expect(home).toContain('<Hero');
    expect(home).toContain('<HomeDecisionHub');
    expect(home).toContain('<HomeInsights');
    expect(home).toContain('<FinalCta');
    expect(home).not.toContain('<CommercialOverview');
    expect(home).not.toContain('<WarehouseGallery');
  });

  it('tightens compact section rhythm without changing default rhythm', () => {
    const section = source('components/ui/section.tsx');

    expect(section).toContain("size === 'compact' ? 'py-10 sm:py-12 lg:py-14'");
    expect(section).toContain(": 'py-14 sm:py-16 lg:py-18'");
  });

  it('adds a tracked conversion action to the decision hub', () => {
    const hub = source('components/marketing/home-decision-hub.tsx');

    expect(hub).toContain("import {ConversionCta}");
    expect(hub).toContain('placement="home-decision-hub"');
    expect(hub).toContain('intent="finder"');
  });

  it('gives the featured insight image more editorial weight', () => {
    const insights = source('components/marketing/home-insights.tsx');

    expect(insights).toContain("sm:grid-cols-[minmax(0,1fr)_minmax(220px,.8fr)]");
    expect(insights).toContain('sm:aspect-[4/3]');
    expect(insights).not.toContain('sizes="170px"');
  });

  it('uses a compact horizontal final conversion rail on desktop', () => {
    const cta = source('components/marketing/final-cta.tsx');

    expect(cta).toContain('py-10');
    expect(cta).toContain("lg:grid-cols-[minmax(0,1fr)_auto]");
    expect(cta).toContain('lg:text-left');
    expect(cta).toContain('lg:justify-end');
  });

  it('adds premium verified-media framing to the hero without another section', () => {
    const hero = source('components/marketing/hero.tsx');

    expect(hero).toContain('border border-white/10 bg-white/[0.04] p-2');
    expect(hero).toContain('lg:h-[clamp(410px,34vw,500px)]');
  });
});
