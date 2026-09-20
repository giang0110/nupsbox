import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';
import {buildPublicReadiness} from '@/features/admin/public-readiness';
import {getUnitTypePublicationReadiness} from '@/features/admin/unit-types';
import {summarizeLeadAnalytics} from '@/features/admin/analytics';
import type {AdminDashboardSummary} from '@/features/admin/dashboard';
import type {AdminQualitySnapshot} from '@/features/admin/quality';
import type {AdminDashboardStatusCounts} from '@/features/admin/dashboard';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

function quality(overrides: Partial<AdminQualitySnapshot> = {}): AdminQualitySnapshot {
  return {
    catalog: {totalLocations: 1, activeLocations: 1, totalUnitTypes: 0, activeUnitTypes: 0, pricingRows: 0, pricingMissingMonthly: 0},
    media: {total: 7, publicCount: 7, missingAlt: 0, unmappedLocation: 0},
    blog: {drafts: 0, published: 0, draftWithoutCover: 0, draftWithoutSource: 0},
    contact: {phone: false, email: false, zalo: false, facebook: true},
    crm: {newOver4h: 0, unassignedOpen: 0, staleOpen: 0},
    ...overrides
  };
}

function dashboard(): AdminDashboardSummary {
  const byStatus = {new: 0, contacted: 0, qualified: 0, viewing: 0, negotiating: 0, won: 0, lost: 0};
  return {
    crm: {newLeads: 0, inProgressLeads: 0, upcomingAppointments: 0, wonLeads: 0, lostLeads: 0, byStatus},
    attention: {newLeads: [], unassignedLeads: [], appointments: []},
    health: {activeLocations: 1, activeUnitTypes: 0, faqs: 0, publishedBlogPosts: 0}
  };
}

describe('P3.22 readiness and conversion foundation', () => {
  it('makes missing active units a blocking readiness item', () => {
    const result = buildPublicReadiness(quality(), dashboard());
    expect(result.items.find(item => item.id === 'units')).toMatchObject({ready: false, weight: 3});
    expect(result.blockingCount).toBeGreaterThan(0);
    expect(result.score).toBeLessThan(100);
  });

  it('requires core bilingual guidance before publishing a unit', () => {
    const incomplete = getUnitTypePublicationReadiness({
      nameVi: 'Kho S',
      nameEn: 'Storage S',
      areaM2: 1.64,
      recommendedForVi: 'Shop online nhỏ',
      recommendedForEn: null
    });
    expect(incomplete.ready).toBe(false);
    expect(incomplete.missingLabels).toContain('Gợi ý EN');

    const ready = getUnitTypePublicationReadiness({
      nameVi: 'Kho S',
      nameEn: 'Storage S',
      areaM2: 1.64,
      recommendedForVi: 'Shop online nhỏ',
      recommendedForEn: 'Small online shops'
    });
    expect(ready.ready).toBe(true);
  });

  it('derives a cumulative CRM funnel without new event storage', () => {
    const statuses: AdminDashboardStatusCounts = {
      new: 2,
      contacted: 3,
      qualified: 4,
      viewing: 2,
      negotiating: 1,
      won: 2,
      lost: 1
    };
    const result = summarizeLeadAnalytics([], statuses, 15, 30, '2026-09-01T00:00:00.000Z', new Date('2026-09-20T00:00:00.000Z'));
    expect(result.funnel.map(stage => stage.count)).toEqual([15, 12, 9, 5, 2]);
  });

  it('wires readiness, publish checklist and conversion fallback into UI', () => {
    expect(source('app/admin/page.tsx')).toContain('Public Readiness');
    expect(source('components/admin/unit-type-form.tsx')).toContain('Checklist trước khi xuất bản');
    expect(source('app/admin/catalog/unit-types/actions.ts')).toContain('unit_type_not_ready:');
    expect(source('components/storage-finder/storage-finder.tsx')).toContain('placement="finder-empty"');
    expect(source('app/admin/analytics/page.tsx')).toContain('Funnel chuyển đổi CRM');
  });
});
