import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

describe('compact homepage composition', () => {
  it('uses four focused primary blocks and moves depth to drill-down pages', () => {
    const source = readFileSync(join(process.cwd(), 'app/[locale]/page.tsx'), 'utf8');

    expect(source).toContain('<Hero');
    expect(source).toContain('<HomeDecisionHub');
    expect(source).toContain('<HomeInsights');
    expect(source).toContain('<FinalCta');

    expect(source).not.toContain('<CommercialOverview');
    expect(source).not.toContain('<HomeProofBento');
    expect(source).not.toContain('<WarehouseGallery');
    expect(source).not.toContain('<HomeLocationJourney');
    expect(source).not.toContain('<HomeFaq');

    expect(source).not.toContain('getMarketingFaqs');
    expect(source).not.toContain('getPublicLocationGallery');
  });
});
