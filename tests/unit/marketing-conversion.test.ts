import {describe, expect, it} from 'vitest';
import {buildConversionHref} from '@/features/marketing/conversion';

describe('buildConversionHref', () => {
  it('routes finder intent to the homepage finder anchor', () => {
    expect(buildConversionHref('vi', 'finder', {})).toBe('/kho-mini#storage-finder');
    expect(buildConversionHref('en', 'finder', {})).toBe('/en/storage-units#storage-finder');
  });

  it('passes explicit unit/location context to quote and viewing routes', () => {
    expect(buildConversionHref('vi', 'quote', {unitSlug: 's'})).toBe('/lien-he?inquiry=quote&unit=s');
    expect(buildConversionHref('en', 'viewing', {locationSlug: 'tan-phu'}))
      .toBe('/en/book-storage?location=tan-phu');
  });

  it('keeps conversion context non-sensitive', () => {
    const context = {unitId: 'verified-s'};
    expect(Object.keys(context)).toEqual(['unitId']);
  });
});
