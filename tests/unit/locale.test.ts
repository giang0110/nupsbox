import {describe, expect, it} from 'vitest';
import {defaultLocale, isSupportedLocale, locales} from '@/i18n/routing';

describe('locale contract', () => {
  it('uses Vietnamese as default', () => {
    expect(defaultLocale).toBe('vi');
  });

  it('supports exactly vi and en', () => {
    expect(locales).toEqual(['vi', 'en']);
    expect(isSupportedLocale('en')).toBe(true);
    expect(isSupportedLocale('fr')).toBe(false);
  });
});
