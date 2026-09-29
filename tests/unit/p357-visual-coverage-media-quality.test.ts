import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('P3.57 visual coverage and media quality', () => {
  it('adds a batched unit-scoped public media reader without a migration', () => {
    const media = source('features/content/public-media.ts');
    const spec = source('docs/superpowers/specs/2026-09-30-p357-visual-coverage-media-quality.md');

    expect(media).toContain('getPublicUnitMediaMap');
    expect(media).toContain(".in('unit_type_id', uniqueUnitIds)");
    expect(media).toContain(".eq('is_public', true)");
    expect(media).toContain("if (!unitId || result[unitId]) continue");
    expect(spec).toContain('No new database columns or migration');
  });

  it('renders verified unit imagery in cards with the existing fallback preserved', () => {
    const card = source('components/units/unit-card.tsx');
    const compare = source('components/units/unit-compare.tsx');

    expect(card).toContain("import Image from 'next/image'");
    expect(card).toContain('visual?: PublicGalleryItem');
    expect(card).toContain('{visual ? (');
    expect(card).toContain('ẢNH THỰC TẾ');
    expect(card).toContain('bg-[var(--nupsbox-navy)]');

    expect(compare).toContain('visuals?: Record<string, PublicGalleryItem>');
    expect(compare).toContain('visual={visuals[unit.id]}');
  });

  it('uses one unit media map across catalog, pricing and detail surfaces', () => {
    const units = source('app/[locale]/kho-mini/page.tsx');
    const pricing = source('app/[locale]/bang-gia/page.tsx');
    const detail = source('app/[locale]/kho-mini/[slug]/page.tsx');
    const location = source('app/[locale]/dia-diem/[slug]/page.tsx');

    expect(units).toContain('getPublicUnitMediaMap');
    expect(units).toContain('visuals={unitVisuals}');
    expect(pricing).toContain('getPublicUnitMediaMap');
    expect(pricing).toContain('visuals={unitVisuals}');
    expect(detail).toContain('unitVisual');
    expect(detail).toContain('ẢNH LOẠI KHO');
    expect(location).toContain('getPublicUnitMediaMap');
    expect(location).toContain('visual={unitVisuals[unit.id]}');
  });

  it('uses existing solution mappings on the solutions hub without schema changes', () => {
    const solutions = source('app/[locale]/giai-phap/page.tsx');

    expect(solutions).toContain("getPublicEditorialMediaForContexts('solution'");
    expect(solutions).toContain('solutionVisuals');
    expect(solutions).toContain('ẢNH CƠ SỞ NUPSBOX');
    expect(solutions).toContain('<Image');
  });
});
