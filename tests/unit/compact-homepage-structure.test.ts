import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

describe('compact homepage composition', () => {
  it('uses seven compact primary blocks including the CMS warehouse gallery', () => {
    const source = readFileSync(join(process.cwd(), 'app/[locale]/page.tsx'), 'utf8');

    expect(source).toContain('<Hero');
    expect(source).toContain('hasGallery={galleryItems.length > 0}');
    expect(source).toContain('<HomeChoiceHub');
    expect(source).toContain('<HomeProofBento');
    expect(source).toContain('<WarehouseGallery');
    expect(source).toContain('<HomeLocationJourney');
    expect(source).toContain('<HomeFaq');
    expect(source).toContain('<FinalCta');

    expect(source).not.toContain('<UseCases');
    expect(source).not.toContain('<Gallery');
    expect(source).not.toContain('<SecurityBenefits');
    expect(source).not.toContain('<CostComparison');
    expect(source).not.toContain('<HowItWorks');
    expect(source).not.toContain('<SocialProof');
  });
});
