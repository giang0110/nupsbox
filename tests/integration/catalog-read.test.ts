import {describe, expect, it} from 'vitest';

const runIntegration = process.env.RUN_SUPABASE_INTEGRATION === '1';

describe.skipIf(!runIntegration)('seeded public catalog', () => {
  it('reads Tân Phú and preserves absent pricing as null', async () => {
    const {getFeaturedLocation} = await import('@/features/catalog/queries');
    const location = await getFeaturedLocation('vi');
    expect(location?.slug).toBe('tan-phu');
    expect(location?.unitTypes.map((unit) => unit.areaM2)).toEqual(expect.arrayContaining([1.64, 5.43]));
    expect(location?.unitTypes.every((unit) => unit.monthlyPrice === null)).toBe(true);
  });
});
