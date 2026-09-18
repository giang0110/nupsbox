import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

describe('compact homepage composition', () => {
  it('uses six primary blocks instead of the previous stacked marketing sections', () => {
    const source = readFileSync(join(process.cwd(), 'app/[locale]/page.tsx'), 'utf8');

    expect(source).toContain('<Hero locale={locale} />');
    expect(source).toContain('<HomeChoiceHub');
    expect(source).toContain('<HomeProofBento');
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
