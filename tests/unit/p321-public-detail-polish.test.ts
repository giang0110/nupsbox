import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('P3.21 public detail and content polish', () => {
  it('uses shared premium primitives on unit detail', () => {
    const unit = source('app/[locale]/kho-mini/[slug]/page.tsx');
    expect(unit).toContain('<PageIntro');
    expect(unit).toContain('<Section>');
    expect(unit).toContain('<FinalCta');
    expect(unit).not.toContain('text-6xl font-black');
  });

  it('shows real media and a resilient empty catalog state on location detail', () => {
    const location = source('app/[locale]/dia-diem/[slug]/page.tsx');
    expect(location).toContain('getPublicLocationGallery');
    expect(location).toContain('<WarehouseGallery');
    expect(location).toContain('location.unitTypes.length ?');
    expect(location).toContain('DANH MỤC ĐANG CẬP NHẬT');
    expect(location).toContain('<FinalCta');
  });

  it('adds metadata and shared visual treatment to the blog index', () => {
    const blog = source('app/[locale]/blog/page.tsx');
    expect(blog).toContain('createStaticPageMetadata');
    expect(blog).toContain('<PageIntro');
    expect(blog).toContain('<Section>');
    expect(blog).toContain('<FinalCta');
  });

  it('adds breadcrumb and closing CTA to blog detail', () => {
    const article = source('app/[locale]/blog/[slug]/page.tsx');
    expect(article).toContain('BreadcrumbList');
    expect(article).toContain('<JsonLd data={breadcrumb}');
    expect(article).toContain('<FinalCta locale={locale} />');
  });

  it('ships route-specific metadata for every solution detail', () => {
    for (const path of [
      'app/[locale]/giai-phap/shop-online/page.tsx',
      'app/[locale]/giai-phap/doanh-nghiep-nho/page.tsx',
      'app/[locale]/giai-phap/chua-hang/page.tsx',
      'app/[locale]/giai-phap/ca-nhan/page.tsx'
    ]) {
      expect(source(path)).toContain('createStaticPageMetadata');
    }
  });
});
