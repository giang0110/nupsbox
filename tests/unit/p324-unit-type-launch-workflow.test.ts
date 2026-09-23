import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';
import {summarizeUnitTypeLaunch} from '@/features/admin/unit-type-launch';
import type {AdminUnitType} from '@/features/admin/unit-types';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

function unit(overrides: Partial<AdminUnitType> = {}): AdminUnitType {
  return {
    id: '00000000-0000-4000-8000-000000000001',
    slug: 'kho-s',
    nameVi: 'Kho S',
    nameEn: 'Storage S',
    areaM2: 1.64,
    recommendedForVi: 'Shop online nhỏ',
    recommendedForEn: 'Small online shops',
    capacityNoteVi: null,
    capacityNoteEn: null,
    sortOrder: 0,
    active: false,
    publishedAt: null,
    createdAt: '2026-09-20T00:00:00.000Z',
    updatedAt: '2026-09-20T00:00:00.000Z',
    ...overrides
  };
}

describe('P3.24 unit type launch workflow', () => {
  it('points empty catalog to first unit creation', () => {
    const summary = summarizeUnitTypeLaunch([]);
    expect(summary.nextAction).toBe('create');
    expect(summary.nextHref).toBe('#new-unit');
  });

  it('recognizes ready drafts and active-only states', () => {
    expect(summarizeUnitTypeLaunch([unit()])).toMatchObject({
      readyDrafts: 1,
      nextAction: 'publish'
    });
    expect(summarizeUnitTypeLaunch([unit({active: true, publishedAt: '2026-09-20T00:00:00.000Z'})])).toMatchObject({
      active: 1,
      nextAction: 'pricing',
      nextHref: '/admin/catalog/pricing'
    });
  });

  it('wires preview and publish-to-pricing behavior', () => {
    expect(source('app/admin/catalog/unit-types/page.tsx')).toContain('Unit Type Launch');
    expect(source('components/admin/unit-type-form.tsx')).toContain('Preview nội dung public');
    expect(source('components/admin/unit-type-form.tsx')).toContain('Xuất bản & cấu hình giá');
    expect(source('components/admin/unit-type-preview.tsx')).toContain("locale: 'VI'");
    expect(source('components/admin/unit-type-preview.tsx')).toContain('Preview {row.locale}');
    const action = source('app/admin/catalog/unit-types/actions.ts');
    expect(action).toContain('adminMutationSuccess(');
    expect(action).toContain("'/admin/catalog/pricing?unit=' + id");
  });
});
