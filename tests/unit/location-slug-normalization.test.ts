import {describe, expect, it} from 'vitest';
import {LocationInputSchema, normalizeCatalogSlug} from '@/features/admin/catalog-schemas';

describe('location slug normalization', () => {
  it('normalizes Vietnamese display text into a URL-safe slug', () => {
    expect(normalizeCatalogSlug(' NupsBox Tân Phú ')).toBe('nupsbox-tan-phu');
    expect(normalizeCatalogSlug('Kho Đường 3/2')).toBe('kho-duong-3-2');
  });

  it('accepts a human-friendly slug value through the location schema', () => {
    const parsed = LocationInputSchema.parse({
      slug: 'NupsBox Tân Phú',
      nameVi: 'NupsBox Tân Phú',
      nameEn: 'NupsBox Tan Phu',
      addressVi: 'Địa chỉ thử nghiệm',
      addressEn: 'Test address',
      district: 'Tân Phú',
      city: 'Ho Chi Minh City',
      latitude: '',
      longitude: '',
      phone: '',
      zaloUrl: '',
      openingHours: {},
      isFeatured: false,
      sortOrder: '0'
    });

    expect(parsed.slug).toBe('nupsbox-tan-phu');
    expect(parsed.latitude).toBeNull();
    expect(parsed.longitude).toBeNull();
  });

  it('still rejects a slug that becomes empty after normalization', () => {
    expect(() => LocationInputSchema.parse({
      slug: '---',
      nameVi: 'Tên',
      nameEn: 'Name',
      addressVi: 'Địa chỉ',
      addressEn: 'Address',
      district: 'District',
      city: 'Ho Chi Minh City',
      latitude: '',
      longitude: '',
      phone: '',
      zaloUrl: '',
      openingHours: {},
      isFeatured: false,
      sortOrder: '0'
    })).toThrow();
  });
});
