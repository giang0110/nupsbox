import {describe, expect, it} from 'vitest';
import {
  LocationInputSchema,
  PricingInputSchema,
  UnitTypeInputSchema
} from '@/features/admin/catalog-schemas';
import {
  mapAdminLocation,
  prepareLocationCreate,
  prepareLocationPublication,
  prepareLocationUpdate
} from '@/features/admin/locations';
import {requirePermission} from '@/features/admin/mutation-guard';

const validLocationInput = {
  slug: 'tan-phu-2',
  nameVi: 'NupsBox Tân Phú 2',
  nameEn: 'NupsBox Tan Phu 2',
  addressVi: '2 Đường A',
  addressEn: '2 A Street',
  district: 'Tân Phú',
  city: 'Ho Chi Minh City',
  latitude: null,
  longitude: null,
  phone: null,
  zaloUrl: null,
  openingHours: {},
  isFeatured: false,
  sortOrder: 20
};

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

  it('maps inactive locations and preserves nullable contacts', () => {
    expect(
      mapAdminLocation({
        id: 'a8ba1e58-ece7-4a8a-844c-3b5edcbf8ab0',
        slug: 'tan-phu',
        name_vi: 'NupsBox Tân Phú',
        name_en: 'NupsBox Tan Phu',
        address_vi: '1 Đường A',
        address_en: '1 A Street',
        district: 'Tân Phú',
        city: 'Ho Chi Minh City',
        latitude: null,
        longitude: null,
        phone: null,
        zalo_url: null,
        opening_hours: {},
        status: 'inactive',
        is_featured: false,
        sort_order: 10,
        published_at: null,
        created_at: '2026-09-15T00:00:00Z',
        updated_at: '2026-09-15T00:00:00Z'
      })
    ).toMatchObject({status: 'inactive', phone: null, zaloUrl: null, publishedAt: null});
  });

  it('forces staff-created locations to start inactive', () => {
    expect(prepareLocationCreate('staff', validLocationInput)).toMatchObject({
      slug: 'tan-phu-2',
      status: 'inactive'
    });
  });

  it('rejects viewer location updates', () => {
    expect(() =>
      prepareLocationUpdate(
        'viewer',
        'a8ba1e58-ece7-4a8a-844c-3b5edcbf8ab0',
        validLocationInput
      )
    ).toThrow('forbidden');
  });

  it('requires catalog publish permission for publication changes', () => {
    expect(() =>
      prepareLocationPublication('viewer', 'a8ba1e58-ece7-4a8a-844c-3b5edcbf8ab0', true)
    ).toThrow('forbidden');
    expect(
      prepareLocationPublication('staff', 'a8ba1e58-ece7-4a8a-844c-3b5edcbf8ab0', true)
    ).toEqual({id: 'a8ba1e58-ece7-4a8a-844c-3b5edcbf8ab0', status: 'active'});
  });

  it('enforces shared catalog permissions', () => {
    expect(() => requirePermission('viewer', 'catalog:update')).toThrow('forbidden');
    expect(() => requirePermission('staff', 'catalog:create')).not.toThrow();
  });
});
