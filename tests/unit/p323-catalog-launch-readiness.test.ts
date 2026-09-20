import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';
import {buildCatalogLaunchReadiness} from '@/features/admin/catalog-launch';
import type {AdminCatalog} from '@/features/admin/catalog';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

function catalog(overrides: Partial<AdminCatalog> = {}): AdminCatalog {
  return {
    locations: [{
      id: 'location-1',
      slug: 'tan-phu',
      nameVi: 'NupsBOX',
      nameEn: 'NupsBOX',
      district: 'Tan Phu',
      status: 'active',
      isFeatured: true,
      sortOrder: 0
    }],
    unitTypes: [],
    pricing: [],
    ...overrides
  };
}

describe('P3.23 catalog launch readiness', () => {
  it('points production-like catalog to Unit Type as the next step', () => {
    const result = buildCatalogLaunchReadiness(catalog());
    expect(result.score).toBe(25);
    expect(result.nextHref).toBe('/admin/catalog/unit-types');
    expect(result.steps.find(step => step.id === 'location')?.ready).toBe(true);
    expect(result.steps.find(step => step.id === 'unit')?.current).toBe(true);
  });

  it('requires pricing to join active location and active unit', () => {
    const withUnit = catalog({
      unitTypes: [{
        id: 'unit-1',
        slug: 'kho-s',
        nameVi: 'Kho S',
        nameEn: 'Storage S',
        areaM2: 1.64,
        active: true,
        sortOrder: 0
      }]
    });
    expect(buildCatalogLaunchReadiness(withUnit).nextHref).toBe('/admin/catalog/pricing');

    const ready = buildCatalogLaunchReadiness({
      ...withUnit,
      pricing: [{
        id: 'price-1',
        locationId: 'location-1',
        unitTypeId: 'unit-1',
        monthlyPrice: null,
        promoPrice: null,
        depositAmount: null,
        availabilityStatus: 'contact',
        availableCount: null,
        featured: false
      }]
    });
    expect(ready.score).toBe(100);
    expect(ready.steps.every(step => step.ready)).toBe(true);
  });

  it('wires launch workflow and prerequisite-aware pricing UI', () => {
    expect(source('app/admin/catalog/page.tsx')).toContain('Catalog Launch');
    expect(source('app/admin/catalog/pricing/page.tsx')).toContain('hasPrerequisites');
    expect(source('app/admin/catalog/pricing/page.tsx')).toContain('defaultUnitTypeId');
    expect(source('components/admin/unit-type-form.tsx')).toContain('Tiếp theo: cấu hình giá');
    expect(source('components/admin/pricing-form.tsx')).toContain('defaultLocationId');
  });
});
