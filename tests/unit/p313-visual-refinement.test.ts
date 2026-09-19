import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('P3.13 premium visual refinement', () => {
  it('places real warehouse imagery before the choice hub', () => {
    const home = source('app/[locale]/page.tsx');
    expect(home.indexOf('<WarehouseGallery')).toBeGreaterThan(home.indexOf('<Hero'));
    expect(home.indexOf('<WarehouseGallery')).toBeLessThan(home.indexOf('<HomeChoiceHub'));
  });

  it('keeps the mobile bar at two primary columns with a contact sheet', () => {
    const mobile = source('components/marketing/mobile-action-bar.tsx');
    expect(mobile).toContain('grid-cols-2');
    expect(mobile).toContain('mobile-contact-sheet');
    expect(mobile).toContain("'Liên hệ'");
    expect(mobile).not.toContain('grid-cols-3');
  });

  it('uses the business domain as the canonical fallback', () => {
    const routes = source('features/seo/routes.ts');
    expect(routes).toContain("'https://nupsbox.vn'");
    expect(routes).not.toContain("?? 'https://nupsbox.vercel.app'");
  });

  it('exposes Action Center in the admin navigation', () => {
    const navigation = source('features/admin/navigation.ts');
    expect(navigation).toContain("href: '/admin/action-center'");
    expect(navigation).toContain("label: 'Việc cần làm'");
  });
});
