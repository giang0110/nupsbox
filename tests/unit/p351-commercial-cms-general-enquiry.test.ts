import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it, vi} from 'vitest';

vi.mock('server-only', () => ({}));
import {prepareCommercialBlockUpdate} from '@/features/admin/commercial-content';
import {LeadInputSchema} from '@/features/leads/schema';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('P3.51 commercial CMS and general enquiry', () => {
  it('allowlists and validates bilingual commercial CMS blocks', () => {
    expect(prepareCommercialBlockUpdate('staff', {
      blockKey: 'commercial_cta',
      contentVi: {
        eyebrow: 'LIÊN HỆ',
        title: 'Trao đổi với NupsBox',
        description: 'Nội dung mô tả',
        primaryLabel: 'Liên hệ',
        secondaryLabel: 'Dịch vụ'
      },
      contentEn: {
        eyebrow: 'CONTACT',
        title: 'Talk to NupsBox',
        description: 'Description',
        primaryLabel: 'Contact',
        secondaryLabel: 'Services'
      },
      active: true,
      sortOrder: 40
    })).toMatchObject({
      page_key: 'commercial',
      block_key: 'commercial_cta',
      active: true,
      sort_order: 40
    });

    expect(() => prepareCommercialBlockUpdate('viewer', {
      blockKey: 'seo',
      contentVi: {title: 'SEO', description: 'Mô tả'},
      contentEn: {title: 'SEO', description: 'Description'},
      active: true,
      sortOrder: 50
    })).toThrow('forbidden');
  });

  it('validates structured enquiry categories and keeps legacy submissions compatible', () => {
    expect(LeadInputSchema.parse({
      fullName: 'Nguyen A',
      phone: '0901234567',
      inquiryType: 'partnership'
    }).inquiryType).toBe('partnership');

    expect(LeadInputSchema.parse({
      fullName: 'Nguyen A',
      phone: '0901234567'
    }).inquiryType).toBe('storage');
  });

  it('wires commercial CMS content into the public information architecture', () => {
    const home = source('app/[locale]/page.tsx');
    const cta = source('components/marketing/final-cta.tsx');
    const nav = source('features/admin/navigation.ts');

    expect(home).toContain('getCommercialContent');
    expect(home).toContain('commercial.companyProfile');
    expect(home).toContain('commercial.capabilities');
    expect(cta).toContain('getCommercialContent');
    expect(nav).toContain('/admin/content/commercial');
  });
});
