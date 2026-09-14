import {describe, expect, it} from 'vitest';
import {recommendStorage} from '@/features/storage-finder/recommend';

const catalog = [
  {id: 's', slug: 's', areaM2: 1.64, sortOrder: 10},
  {id: 'm', slug: 'm', areaM2: 5.43, sortOrder: 20}
];

describe('recommendStorage', () => {
  it('recommends the smallest active unit for under 20 boxes', () => {
    expect(recommendStorage({need: 'shop_online', volume: 'under_20'}, catalog).unit.slug).toBe('s');
  });

  it('recommends the next larger unit for 20-50 boxes', () => {
    expect(recommendStorage({need: 'inventory', volume: '20_50'}, catalog).unit.slug).toBe('m');
  });

  it('flags unknown volume for consultation instead of inventing capacity', () => {
    expect(recommendStorage({need: 'business', volume: 'unknown'}, catalog).needsConsultation).toBe(true);
  });
});
