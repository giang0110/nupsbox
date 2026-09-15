import {describe, expect, it} from 'vitest';
import {
  LocationInputSchema,
  PricingInputSchema,
  UnitTypeInputSchema
} from '@/features/admin/catalog-schemas';
import {requirePermission} from '@/features/admin/mutation-guard';

describe('catalog CMS mutation contracts', () => {
  it('rejects invalid location slugs', () => {
    expect(() =>
      LocationInputSchema.parse({
        slug: 'Bad Slug',
        nameVi: 'Kho Tân Phú',
        nameEn: 'Tan Phu Storage',
        addressVi: '1 Đường A',
        addressEn: '1 A Street',
        district: 'Tân Phú',
        city: 'Ho Chi Minh City'
      })
    ).toThrow();
  });

  it('rejects non-positive unit area', () => {
    expect(() =>
      UnitTypeInputSchema.parse({
        slug: 's',
        nameVi: 'Kho S',
        nameEn: 'Storage S',
        areaM2: -1
      })
    ).toThrow();
  });

  it('rejects invalid pricing and normalizes blank verified prices to null', () => {
    expect(() =>
      PricingInputSchema.parse({
        locationId: 'a8ba1e58-ece7-4a8a-844c-3b5edcbf8ab0',
        unitTypeId: 'b8ba1e58-ece7-4a8a-844c-3b5edcbf8ab1',
        monthlyPrice: '-1',
        promoPrice: '',
        depositAmount: '',
        availabilityStatus: 'contact'
      })
    ).toThrow();

    expect(
      PricingInputSchema.parse({
        locationId: 'a8ba1e58-ece7-4a8a-844c-3b5edcbf8ab0',
        unitTypeId: 'b8ba1e58-ece7-4a8a-844c-3b5edcbf8ab1',
        monthlyPrice: '',
        promoPrice: '',
        depositAmount: '',
        availabilityStatus: 'contact'
      })
    ).toMatchObject({monthlyPrice: null, promoPrice: null, depositAmount: null});
  });

  it('enforces shared catalog permissions', () => {
    expect(() => requirePermission('viewer', 'catalog:update')).toThrow('forbidden');
    expect(() => requirePermission('staff', 'catalog:create')).not.toThrow();
  });
});
