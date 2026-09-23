import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';
import {buildLocationLaunchReadiness} from '@/features/admin/location-launch';
import type {AdminLocation} from '@/features/admin/locations';
import type {AdminMedia} from '@/features/admin/media';
import type {AdminPricing} from '@/features/admin/pricing';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

const location: AdminLocation = {
  id: '00000000-0000-4000-8000-000000000001',
  slug: 'tan-phu',
  nameVi: 'NupsBOX',
  nameEn: 'NupsBOX',
  addressVi: '1 Nguyen Huu Tien',
  addressEn: '1 Nguyen Huu Tien',
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

const media: AdminMedia = {
  id: '00000000-0000-4000-8000-000000000002',
  storagePath: 'locations/tan-phu.jpg',
  publicUrl: 'https://example.com/tan-phu.jpg',
  altVi: 'Kho NupsBOX',
  altEn: 'NupsBOX storage',
  locationId: location.id,
  unitTypeId: null,
  category: 'location',
  sortOrder: 0,
  isPublic: true,
  createdAt: '2026-09-20T00:00:00.000Z',
  updatedAt: '2026-09-20T00:00:00.000Z'
};

const pricing: AdminPricing = {
  id: '00000000-0000-4000-8000-000000000003',
  locationId: location.id,
  unitTypeId: '00000000-0000-4000-8000-000000000004',
  monthlyPrice: null,
  promoPrice: null,
  depositAmount: null,
  availabilityStatus: 'contact',
  availableCount: null,
  featured: false,
  createdAt: '2026-09-20T00:00:00.000Z',
  updatedAt: '2026-09-20T00:00:00.000Z'
};

describe('P3.26 location launch workflow', () => {
  it('treats quality gaps as recommendations instead of hard blockers', () => {
    const result = buildLocationLaunchReadiness(location, [], []);
    expect(result.qualityScore).toBe(0);
    expect(result.recommendedNext).toBe('media');
    expect(result.checks.every(check => check.required === false)).toBe(true);
  });

  it('moves from media to pricing to preview based on actual data', () => {
    const withMedia = buildLocationLaunchReadiness(location, [media], []);
    expect(withMedia.recommendedNext).toBe('pricing');

    const ready = buildLocationLaunchReadiness(location, [media], [pricing]);
    expect(ready.recommendedNext).toBe('preview');
    expect(ready.publicMediaCount).toBe(1);
    expect(ready.pricingCount).toBe(1);
  });

  it('wires location preview and scoped media handoff', () => {
    expect(source('app/admin/catalog/locations/page.tsx')).toContain('Location Launch');
    expect(source('components/admin/location-form.tsx')).toContain('Preview nội dung public');
    expect(source('components/admin/location-form.tsx')).toContain('Xuất bản & quản lý ảnh');
    const action = source('app/admin/catalog/locations/actions.ts');
    expect(action).toContain('adminMutationSuccess(');
    expect(action).toContain("'/admin/content/media?location=' + id");
    expect(source('app/admin/content/media/page.tsx')).toContain('defaultLocationId');
  });
});
