import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('Facebook source integration', () => {
  it('allows Admin to bootstrap public_contact and preserve opening-hours data', () => {
    const action = source('app/admin/content/settings/actions.ts');
    const settings = source('features/admin/settings.ts');

    expect(action).toContain(".upsert({");
    expect(action).toContain('existingOpeningHours');
    expect(settings).toContain('facebook_url');
    expect(settings).toContain("updatedAt: row?.updated_at ?? ''");
  });

  it('threads Facebook through footer, mobile actions, contact and About media', () => {
    expect(source('app/[locale]/layout.tsx')).toContain('facebookUrl={settings.facebookUrl}');
    expect(source('components/marketing/mobile-action-bar.tsx')).toContain("kind: 'facebook' as const");
    expect(source('components/marketing/site-footer.tsx')).toContain('kind="facebook"');
    expect(source('app/[locale]/lien-he/page.tsx')).toContain('placement="contact-page"');
    expect(source('components/marketing/gallery.tsx')).toContain('placement="about-gallery');
  });

  it('keeps the Facebook share URL out of structured-data sameAs until canonical identity is verified', () => {
    const entity = source('features/seo/business-entity.ts');
    expect(entity).not.toContain('sameAs');
    expect(entity).not.toContain('facebook');
  });
});
