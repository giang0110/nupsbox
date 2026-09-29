import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it, vi} from 'vitest';

vi.mock('server-only', () => ({}));

import {estimateBlogReadingMinutes} from '@/features/content/blog';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('P3.53 editorial experience', () => {
  it('keeps the homepage focused on decision and editorial depth', () => {
    const home = source('app/[locale]/page.tsx');
    const decision = source('components/marketing/home-decision-hub.tsx');
    const insights = source('components/marketing/home-insights.tsx');

    expect(home).toContain('<HomeDecisionHub');
    expect(home).toContain('<HomeInsights');
    expect(decision).toContain('Bạn đang cần giải quyết bài toán nào?');
    expect(decision).toContain('/giai-phap/shop-online');
    expect(decision).toContain('/cau-hoi-thuong-gap');
    expect(insights).toContain('Hiểu cách dùng kho, không chỉ biết có kho.');
  });

  it('gives every solution route its own operating model, checklist and editorial link', () => {
    const cases = [
      ['app/[locale]/giai-phap/shop-online/page.tsx', 'kho-cho-shop-online-tu-nha-ra-kho-rieng'],
      ['app/[locale]/giai-phap/doanh-nghiep-nho/page.tsx', 'kho-hay-mo-rong-van-phong'],
      ['app/[locale]/giai-phap/chua-hang/page.tsx', 'quan-ly-hang-ton-cham-luan-chuyen'],
      ['app/[locale]/giai-phap/ca-nhan/page.tsx', 'kho-ca-nhan-chuyen-nha-sua-nha']
    ];

    for (const [path, slug] of cases) {
      const page = source(path);
      expect(page).toContain('fitVi={[');
      expect(page).toContain('operatingVi={[');
      expect(page).toContain('checklistVi={[');
      expect(page).toContain(`relatedBlogSlug="${slug}"`);
    }

    const solution = source('components/marketing/solution-page.tsx');
    expect(solution).toContain('Pre-rental checklist');
    expect(solution).toContain('EDITORIAL INSIGHT');
    expect(solution).toContain('relatedBlogSlug');
  });

  it('seeds six bilingual long-form editorial articles with external references where relevant', () => {
    const migration = source('supabase/migrations/20260929000300_p353_editorial_deep_content.sql');
    const slugs = [
      'chon-dien-tich-kho-mini',
      'sap-xep-kho-shop-online',
      'kho-cho-shop-online-tu-nha-ra-kho-rieng',
      'kho-hay-mo-rong-van-phong',
      'quan-ly-hang-ton-cham-luan-chuyen',
      'kho-ca-nhan-chuyen-nha-sua-nha'
    ];

    for (const slug of slugs) expect(migration).toContain(slug);
    expect(migration.match(/'vi'/g)?.length).toBeGreaterThanOrEqual(6);
    expect(migration.match(/'en'/g)?.length).toBeGreaterThanOrEqual(6);
    expect(migration).toContain('help.shopify.com/en/manual/products/inventory/setup/bin-locations');
    expect(migration).toContain('help.shopify.com/en/manual/products/inventory/adjusting-inventory/abc-analysis');
    expect(migration).toContain('on conflict (blog_post_id, locale) do update');
  });

  it('estimates article reading time from structured body text', () => {
    const body = {
      type: 'doc',
      content: [
        {type: 'paragraph', content: [{type: 'text', text: Array(440).fill('word').join(' ')}]}
      ]
    };
    expect(estimateBlogReadingMinutes(body)).toBe(2);
  });

  it('adds editorial metadata and related-reading UX to article pages', () => {
    const article = source('app/[locale]/blog/[slug]/page.tsx');
    expect(article).toContain("'@type': 'Article'");
    expect(article).toContain('estimateBlogReadingMinutes');
    expect(article).toContain('CONTINUE READING');
    expect(article).toContain('Reference for selected principles');
  });
});
