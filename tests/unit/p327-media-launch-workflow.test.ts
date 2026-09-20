import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';
import {summarizeMediaLaunch} from '@/features/admin/media-launch';
import type {AdminMedia} from '@/features/admin/media';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

function media(overrides: Partial<AdminMedia> = {}): AdminMedia {
  return {
    id: '00000000-0000-4000-8000-000000000001',
    storagePath: 'location/a.jpg',
    publicUrl: 'https://example.com/a.jpg',
    altVi: 'Kho NupsBOX',
    altEn: 'NupsBOX storage',
    locationId: '00000000-0000-4000-8000-000000000002',
    unitTypeId: null,
    category: 'location',
    sortOrder: 10,
    isPublic: true,
    createdAt: '2026-09-20T00:00:00.000Z',
    updatedAt: '2026-09-20T00:00:00.000Z',
    ...overrides
  };
}

describe('P3.27 media launch workflow', () => {
  it('summarizes public, alt, mapping and hero readiness', () => {
    const result = summarizeMediaLaunch([
      media({category: 'hero'}),
      media({
        id: '00000000-0000-4000-8000-000000000003',
        altEn: '',
        locationId: null
      })
    ]);
    expect(result).toMatchObject({
      total: 2,
      publicCount: 2,
      heroCount: 1,
      issueCount: 1
    });
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThan(100);
  });

  it('wires scoped media, hero promotion and gallery ordering', () => {
    expect(source('app/admin/content/media/page.tsx')).toContain('Media Readiness');
    expect(source('app/admin/content/media/page.tsx')).toContain('defaultUnitTypeId');
    expect(source('components/admin/media-metadata-form.tsx')).toContain('Ưu tiên làm hero');
    expect(source('components/admin/media-metadata-form.tsx')).toContain('Đưa lên đầu gallery');
    expect(source('components/admin/media-metadata-form.tsx')).toContain('Preview location');
    expect(source('app/admin/content/media/actions.ts')).toContain('promoteMediaHero');
    expect(source('app/admin/content/media/actions.ts')).toContain('moveMediaToFront');
    expect(source('app/admin/content/media/actions.ts')).toContain(".update({category: 'location'})");
  });
});
