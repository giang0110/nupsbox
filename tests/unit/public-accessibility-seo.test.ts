import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';
import {createLocalizedMetadata} from '@/features/seo/metadata';
import {getStaticSeoRoute} from '@/features/seo/routes';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('public accessibility and SEO polish', () => {
  it('provides a localized skip link and focusable content target', () => {
    const layout = source('app/[locale]/layout.tsx');

    expect(layout).toContain('href="#main-content"');
    expect(layout).toContain("locale === 'vi' ? 'Bỏ qua điều hướng' : 'Skip to content'");
    expect(layout).toContain('id="main-content" tabIndex={-1}');
  });

  it('localizes public navigation accessibility labels', () => {
    const header = source('components/marketing/site-header.tsx');

    expect(header).toContain("'Mở menu điều hướng'");
    expect(header).toContain("'Open navigation menu'");
    expect(header).toContain("'Điều hướng chính'");
    expect(header).toContain("'Primary navigation'");
  });

  it('marks the public lead form busy while submitting', () => {
    const form = source('components/forms/lead-form.tsx');
    expect(form).toContain("aria-busy={state === 'submitting'}");
  });

  it('adds Twitter metadata while preserving canonical and language alternates', () => {
    const metadata = createLocalizedMetadata({
      route: getStaticSeoRoute('pricing'),
      locale: 'vi',
      title: 'Bảng giá kho mini',
      description: 'Giá đã được xác nhận.'
    });

    expect(metadata.twitter).toMatchObject({
      card: 'summary',
      title: 'Bảng giá kho mini',
      description: 'Giá đã được xác nhận.'
    });
    expect(metadata.alternates?.canonical).toContain('/bang-gia');
    expect(metadata.alternates?.languages).toMatchObject({
      'vi-VN': expect.stringContaining('/bang-gia'),
      en: expect.stringContaining('/en/pricing')
    });
  });

  it('gives the main public landing pages route-specific metadata', () => {
    const pages: Array<[string, string]> = [
      ['app/[locale]/kho-mini/page.tsx', 'units'],
      ['app/[locale]/bang-gia/page.tsx', 'pricing'],
      ['app/[locale]/dia-diem/page.tsx', 'locations'],
      ['app/[locale]/giai-phap/page.tsx', 'solutions'],
      ['app/[locale]/cach-thue/page.tsx', 'how-it-works'],
      ['app/[locale]/ve-nupsbox/page.tsx', 'about'],
      ['app/[locale]/cau-hoi-thuong-gap/page.tsx', 'faq'],
      ['app/[locale]/lien-he/page.tsx', 'contact']
    ];

    for (const [path, key] of pages) {
      const page = source(path);
      expect(page).toContain('export function generateMetadata');
      expect(page).toContain(`createStaticPageMetadata(params, '${key}'`);
    }
  });
});
