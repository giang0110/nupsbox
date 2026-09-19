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
import {preparePricingCreate, preparePricingUpdate} from '@/features/admin/pricing';
import {
  mapAdminUnitType,
  prepareUnitTypeCreate,
  prepareUnitTypePublication,
  prepareUnitTypeUpdate
} from '@/features/admin/unit-types';

const locationId = 'a8ba1e58-ece7-4a8a-844c-3b5edcbf8ab0';
const unitTypeId = 'b8ba1e58-ece7-4a8a-844c-3b5edcbf8ab1';
const pricingId = 'c8ba1e58-ece7-4a8a-844c-3b5edcbf8ab2';

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

const validUnitInput = {
  slug: 'xl',
  nameVi: 'Kho XL',
  nameEn: 'Storage XL',
  areaM2: 8.5,
  recommendedForVi: null,
  recommendedForEn: null,
  capacityNoteVi: null,
  capacityNoteEn: null,
  sortOrder: 30
};

const validPricingInput = {
  locationId,
  unitTypeId,
  monthlyPrice: null,
  promoPrice: null,
  depositAmount: null,
  availabilityStatus: 'contact' as const,
  availableCount: null,
  featured: false
};

describe('catalog CMS mutation contracts', () => {
  it('normalizes human-friendly location slugs and rejects empty results', () => {
    expect(
      LocationInputSchema.parse({
        slug: 'Bad Slug',
        nameVi: 'Kho Tân Phú',
        nameEn: 'Tan Phu Storage',
        addressVi: '1 Đường A',
        addressEn: '1 A Street',
        district: 'Tân Phú',
        city: 'Ho Chi Minh City'
      }).slug
    ).toBe('bad-slug');

    expect(() =>
      LocationInputSchema.parse({
        slug: '---',
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
        locationId,
        unitTypeId,
        monthlyPrice: '-1',
        promoPrice: '',
        depositAmount: '',
        availabilityStatus: 'contact'
      })
    ).toThrow();

    expect(
      PricingInputSchema.parse({
        locationId,
        unitTypeId,
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
        id: locationId,
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
    expect(() => prepareLocationUpdate('viewer', locationId, validLocationInput)).toThrow('forbidden');
  });

  it('requires catalog publish permission for location publication changes', () => {
    expect(() => prepareLocationPublication('viewer', locationId, true)).toThrow('forbidden');
    expect(prepareLocationPublication('staff', locationId, true)).toEqual({id: locationId, status: 'active'});
  });

  it('maps unit publication state and forces new units inactive', () => {
    expect(
      mapAdminUnitType({
        id: unitTypeId,
        slug: 'm',
        name_vi: 'Kho M',
        name_en: 'Storage M',
        area_m2: 5.43,
        recommended_for_vi: null,
        recommended_for_en: null,
        capacity_note_vi: null,
        capacity_note_en: null,
        sort_order: 20,
        active: false,
        published_at: null,
        created_at: '2026-09-15T00:00:00Z',
        updated_at: '2026-09-15T00:00:00Z'
      })
    ).toMatchObject({active: false, publishedAt: null});
    expect(prepareUnitTypeCreate('staff', validUnitInput)).toMatchObject({slug: 'xl', active: false});
  });

  it('separates unit updates from publication permission', () => {
    expect(() => prepareUnitTypeUpdate('viewer', unitTypeId, validUnitInput)).toThrow('forbidden');
    expect(() => prepareUnitTypePublication('viewer', unitTypeId, true)).toThrow('forbidden');
    expect(prepareUnitTypePublication('staff', unitTypeId, true)).toEqual({id: unitTypeId, active: true});
  });

  it('preserves nullable verified prices and separates create/update permissions', () => {
    expect(preparePricingCreate('staff', validPricingInput)).toMatchObject({
      monthly_price: null,
      promo_price: null,
      deposit_amount: null,
      availability_status: 'contact'
    });
    expect(() => preparePricingCreate('viewer', validPricingInput)).toThrow('forbidden');
    expect(() => preparePricingUpdate('viewer', pricingId, validPricingInput)).toThrow('forbidden');
    expect(preparePricingUpdate('staff', pricingId, validPricingInput)).toMatchObject({id: pricingId});
  });

  it('enforces shared catalog permissions', () => {
    expect(() => requirePermission('viewer', 'catalog:update')).toThrow('forbidden');
    expect(() => requirePermission('staff', 'catalog:create')).not.toThrow();
  });
});
