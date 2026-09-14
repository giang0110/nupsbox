import {describe, expect, it} from 'vitest';
import {buildSeoRoutePairs, SITE_ORIGIN} from '@/features/seo/routes';

describe('SEO route manifest', () => {
  const routes = buildSeoRoutePairs({unitSlugs: ['s'], locationSlugs: ['tan-phu']});

  it('uses nupsbox.vn as the canonical origin and pairs VI/EN URLs', () => {
    expect(SITE_ORIGIN).toBe('https://nupsbox.vn');
    expect(routes.find((route) => route.key === 'home')).toMatchObject({vi: '/', en: '/en'});
    expect(routes.find((route) => route.key === 'pricing')).toMatchObject({vi: '/bang-gia', en: '/en/pricing'});
  });

  it('includes dynamic unit and location pairs', () => {
    expect(routes).toContainEqual({key: 'unit:s', vi: '/kho-mini/s', en: '/en/mini-storage/s'});
    expect(routes).toContainEqual({key: 'location:tan-phu', vi: '/dia-diem/tan-phu', en: '/en/locations/tan-phu'});
  });

  it('does not expose admin, auth, API or booking-preparation pages', () => {
    const urls = routes.flatMap((route) => [route.vi, route.en]);
    expect(urls.some((url) => url.includes('/admin'))).toBe(false);
    expect(urls.some((url) => url.includes('/auth'))).toBe(false);
    expect(urls.some((url) => url.includes('/api'))).toBe(false);
    expect(urls.some((url) => url.includes('dat-kho') || url.includes('book-storage'))).toBe(false);
  });
});
