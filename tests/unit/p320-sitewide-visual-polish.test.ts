import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('P3.20 sitewide visual polish', () => {
  it('uses CMS warehouse imagery on locations and about pages', () => {
    const locations = source('app/[locale]/dia-diem/page.tsx');
    const about = source('app/[locale]/ve-nupsbox/page.tsx');
    expect(locations).toContain('getPublicLocationGallery');
    expect(locations).toContain('<WarehouseGallery');
    expect(about).toContain('getPublicLocationGallery');
    expect(about).toContain('<WarehouseGallery');
    expect(about).not.toContain("import {Gallery}");
  });

  it('keeps the public design compact and editorial', () => {
    const section = source('components/ui/section.tsx');
    const intro = source('components/ui/page-intro.tsx');
    const choice = source('components/marketing/home-choice-hub.tsx');
    expect(section).toContain("py-14 sm:py-16 lg:py-18");
    expect(intro).toContain('text-balance');
    expect(choice).toContain("index: '01'");
    expect(choice).not.toContain('BriefcaseBusiness');
  });

  it('adds consistent closing CTAs to pricing and locations', () => {
    expect(source('app/[locale]/bang-gia/page.tsx')).toContain('<FinalCta locale={rawLocale} />');
    expect(source('app/[locale]/dia-diem/page.tsx')).toContain('<FinalCta locale={rawLocale} />');
  });

  it('uses meaningful icons in admin navigation instead of first letters', () => {
    const shell = source('components/admin/admin-shell.tsx');
    expect(shell).toContain('<NavigationIcon href={item.href} />');
    expect(shell).not.toContain('item.label.slice(0, 1)');
  });
});
