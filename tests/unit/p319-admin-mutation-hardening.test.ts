import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';
import {UnitTypeInputSchema} from '@/features/admin/catalog-schemas';
import {BlogInputSchema} from '@/features/admin/content-schemas';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('P3.19 admin mutation hardening', () => {
  it('normalizes unit type and blog slugs before validation', () => {
    expect(UnitTypeInputSchema.parse({
      slug: 'Kho Mini 2.5m²',
      nameVi: 'Kho Mini 2.5m²',
      nameEn: 'Mini Storage 2.5m2',
      areaM2: 2.5,
      recommendedForVi: '',
      recommendedForEn: '',
      capacityNoteVi: '',
      capacityNoteEn: '',
      sortOrder: 0
    }).slug).toBe('kho-mini-2-5m2');

    expect(BlogInputSchema.parse({
      slug: 'Giới thiệu NupsBox',
      titleVi: 'Giới thiệu',
      titleEn: 'Introduction',
      excerptVi: '',
      excerptEn: '',
      bodyVi: {},
      bodyEn: {},
      seoTitleVi: '',
      seoTitleEn: '',
      seoDescriptionVi: '',
      seoDescriptionEn: '',
      coverMediaId: '',
      sourceUrl: ''
    }).slug).toBe('gioi-thieu-nupsbox');
  });

  it('validates raw JSON fields in the browser', () => {
    const json = source('components/admin/json-textarea.tsx');
    const location = source('components/admin/location-form.tsx');
    const blog = source('components/admin/blog-form.tsx');
    expect(json).toContain('JSON.parse(raw)');
    expect(json).toContain('setCustomValidity');
    expect(location).toContain('<JsonTextarea');
    expect(blog.match(/<JsonTextarea/g)?.length).toBe(2);
  });

  it('blocks oversized media before upload and verifies media updates', () => {
    const input = source('components/admin/media-file-input.tsx');
    const action = source('app/admin/content/media/actions.ts');
    expect(input).toContain('8 * 1024 * 1024');
    expect(input).toContain('Ảnh vượt quá giới hạn 8 MB.');
    expect(action).toContain('data.length !== command.ids.length');
    expect(action).toContain('media_metadata_update_noop');
  });

  it('checks cross-field pricing before submit', () => {
    const pricing = source('components/admin/pricing-form.tsx');
    expect(pricing).toContain('promoValue > monthlyValue');
    expect(pricing).toContain('Giá ưu đãi không được lớn hơn giá tháng.');
  });

  it('verifies critical update actions actually affect records', () => {
    for (const path of [
      'app/admin/catalog/locations/actions.ts',
      'app/admin/catalog/unit-types/actions.ts',
      'app/admin/catalog/pricing/actions.ts',
      'app/admin/content/faq/actions.ts',
      'app/admin/content/blog/actions.ts',
      'app/admin/leads/actions.ts'
    ]) {
      expect(source(path)).toContain(".select('id')");
    }
  });
});
