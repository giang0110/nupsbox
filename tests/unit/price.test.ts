import {describe, expect, it} from 'vitest';
import {formatMonthlyPrice} from '@/features/catalog/price';

describe('formatMonthlyPrice', () => {
  it('returns null when price is unavailable', () => {
    expect(formatMonthlyPrice(null, 'vi')).toBeNull();
  });

  it('formats Vietnamese currency without inventing decimals', () => {
    expect(formatMonthlyPrice(1200000, 'vi')).toContain('1.200.000');
  });
});
