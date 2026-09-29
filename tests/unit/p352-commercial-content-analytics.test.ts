import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it, vi} from 'vitest';

vi.mock('server-only', () => ({}));

import {prepareCommercialBlockUpdate} from '@/features/admin/commercial-content';
import {
  commercialBlockKeys,
  getCommercialFallback
} from '@/features/content/commercial-content';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('P3.52 commercial content expansion and conversion analytics', () => {
  it('keeps the expanded commercial CMS on a fixed allowlist', () => {
    expect(commercialBlockKeys).toEqual(expect.arrayContaining([
      'service_shop_online',
      'service_small_business',
      'service_inventory',
      'service_personal',
      'seo_solutions',
      'seo_about',
      'seo_contact'
    ]));

    expect(prepareCommercialBlockUpdate('staff', {
      blockKey: 'service_shop_online',
      contentVi: {
        eyebrow: 'SHOP ONLINE',
        title: 'Kho cho shop online',
        description: 'Mô tả'
      },
      contentEn: {
        eyebrow: 'ONLINE SELLERS',
        title: 'Storage for online sellers',
        description: 'Description'
      },
      active: true,
      sortOrder: 21
    })).toMatchObject({
      page_key: 'commercial',
      block_key: 'service_shop_online'
    });

    expect(prepareCommercialBlockUpdate('admin', {
      blockKey: 'seo_contact',
      contentVi: {title: 'Liên hệ', description: 'Mô tả SEO'},
      contentEn: {title: 'Contact', description: 'SEO description'},
      active: true,
      sortOrder: 53
    })).toMatchObject({
      block_key: 'seo_contact'
    });
  });

  it('provides safe fallbacks for service cards and per-page SEO', () => {
    const fallback = getCommercialFallback('vi');
    expect(fallback.serviceGroups.shopOnline.title).toContain('shop online');
    expect(fallback.serviceGroups.smallBusiness.title).toContain('doanh nghiệp');
    expect(fallback.pageSeo.solutions.title).toContain('Dịch vụ');
    expect(fallback.pageSeo.contact.title).toContain('Liên hệ');
  });

  it('wires public service cards, page SEO and admin enquiry analytics', () => {
    const solutions = source('app/[locale]/giai-phap/page.tsx');
    const aboutLayout = source('app/[locale]/ve-nupsbox/layout.tsx');
    const contactLayout = source('app/[locale]/lien-he/layout.tsx');
    const analytics = source('features/admin/analytics.ts');
    const filterBar = source('components/admin/lead-filter-bar.tsx');

    expect(solutions).toContain('commercial.serviceGroups.shopOnline');
    expect(solutions).toContain('commercial.pageSeo.solutions');
    expect(aboutLayout).toContain('commercial.pageSeo.about');
    expect(contactLayout).toContain('commercial.pageSeo.contact');
    expect(analytics).toContain('byInquiryType');
    expect(analytics).toContain("row.inquiry_type === 'storage'");
    expect(filterBar).toContain('name="inquiry"');
  });
});
