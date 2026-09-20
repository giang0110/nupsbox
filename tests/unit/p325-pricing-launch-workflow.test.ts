import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';
import {pricingPairKey, summarizePricingLaunch} from '@/features/admin/pricing-launch';
import type {AdminLocation} from '@/features/admin/locations';
import type {AdminPricing} from '@/features/admin/pricing';
import type {AdminUnitType} from '@/features/admin/unit-types';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

const location: AdminLocation = {
  id: '00000000-0000-4000-8000-000000000001',
  slug: 'tan-phu',
  nameVi: 'NupsBOX',
  nameEn: 'NupsBOX',
  addressVi: 'A',
  addressEn: 'A',
  district: 'Tan Phu',
  city: 'Ho Chi Minh City',
  latitude: null,
  longitude: null,
  phone: null,
  zaloUrl: null,
  openingHours: {},
  status: 'active',
  isFeatured: true,
  sortOrder: 0,
  publishedAt: '2026-09-20T00:00:00.000Z',
  createdAt: '2026-09-20T00:00:00.000Z',
  updatedAt: '2026-09-20T00:00:00.000Z'
};

const unit: AdminUnitType = {
  id: '00000000-0000-4000-8000-000000000002',
  slug: 'kho-s',
  nameVi: 'Kho S',
  nameEn: 'Storage S',
  areaM2: 1.64,
  recommendedForVi: 'Shop nhỏ',
  recommendedForEn: 'Small shops',
  capacityNoteVi: null,
  capacityNoteEn: null,
  sortOrder: 0,
  active: true,
  publishedAt: '2026-09-20T00:00:00.000Z',
  createdAt: '2026-09-20T00:00:00.000Z',
  updatedAt: '2026-09-20T00:00:00.000Z'
};

function mapping(monthlyPrice: number | null): AdminPricing {
  return {
    id: '00000000-0000-4000-8000-000000000003',
    locationId: location.id,
    unitTypeId: unit.id,
    monthlyPrice,
    promoPrice: null,
    depositAmount: null,
    availabilityStatus: 'contact',
    availableCount: null,
    featured: false,
    createdAt: '2026-09-20T00:00:00.000Z',
    updatedAt: '2026-09-20T00:00:00.000Z'
  };
}

describe('P3.25 pricing launch workflow', () => {
  it('tracks pair coverage without requiring a verified price', () => {
    const empty = summarizePricingLaunch([location], [unit], []);
    expect(empty).toMatchObject({missingPairs: 1, score: 0, ready: false});

    const contactOnly = summarizePricingLaunch([location], [unit], [mapping(null)]);
    expect(contactOnly).toMatchObject({
      missingPairs: 0,
      contactOnlyMappings: 1,
      verifiedPriceMappings: 0,
      score: 100,
      ready: true
    });
  });

  it('builds stable pair keys for duplicate detection', () => {
    expect(pricingPairKey('a', 'b')).toBe('a:b');
  });

  it('wires live preview, duplicate guard and preview redirect', () => {
    expect(source('app/admin/catalog/pricing/page.tsx')).toContain('Pricing Launch');
    expect(source('components/admin/pricing-form.tsx')).toContain('Preview public');
    expect(source('components/admin/pricing-form.tsx')).toContain('duplicatePair');
    expect(source('app/admin/catalog/pricing/actions.ts')).toContain("throw new Error('pricing_conflict')");
    expect(source('app/admin/catalog/pricing/actions.ts')).toContain("redirect('/bang-gia')");
  });
});
