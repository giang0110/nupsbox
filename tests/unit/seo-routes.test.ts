import {describe, expect, it} from 'vitest';
import {buildSeoRoutePairs, SITE_ORIGIN} from '@/features/seo/routes';

describe('SEO route manifest', () => {
  const routes = buildSeoRoutePairs({
    unitSlugs: ['s'],
    locationSlugs: ['tan-phu'],
    blogSlugs: ['huong-dan-thue-kho']
  });

  it('uses NEXT_PUBLIC_SITE_URL as the canonical origin and pairs VI/EN URLs', () => {
    const expectedOrigin = new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nupsbox.vercel.app'
    ).origin;
    expect(SITE_ORIGIN).toBe(expectedOrigin);
    expect(routes.find((route) => route.key === 'home')).toMatchObject({vi: '/', en: '/en'});
    expect(routes.find((route) => route.key === 'pricing')).toMatchObject({vi: '/bang-gia', en: '/en/pricing'});
  });

  it('includes dynamic unit, location and blog pairs', () => {
    expect(routes).toContainEqual({key: 'unit:s', vi: '/kho-mini/s', en: '/en/mini-storage/s'});
    expect(routes).toContainEqual({key: 'location:tan-phu', vi: '/dia-diem/tan-phu', en: '/en/locations/tan-phu'});
    expect(routes).toContainEqual({
      key: 'blog:huong-dan-thue-kho',
      vi: '/blog/huong-dan-thue-kho',
      en: '/en/blog/huong-dan-thue-kho'
    });
  });

  it('does not expose admin, auth, API or booking-preparation pages', () => {
    const urls = routes.flatMap((route) => [route.vi, route.en]);
    expect(urls.some((url) => url.includes('/admin'))).toBe(false);
    expect(urls.some((url) => url.includes('/auth'))).toBe(false);
    expect(urls.some((url) => url.includes('/api'))).toBe(false);
    expect(urls.some((url) => url.includes('dat-kho') || url.includes('book-storage'))).toBe(false);
  });
});
