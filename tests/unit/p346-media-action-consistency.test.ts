import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('P3.46 media action consistency', () => {
  it('guards promote and reorder writes with the media updated_at version', () => {
    const action = source('app/admin/content/media/actions.ts');
    expect(action).toContain(".eq('updated_at', media.updated_at)");
    expect(action).toContain('assertFreshAdminWrite(updated)');
  });

  it('attempts rollback when hero demotion fails', () => {
    const action = source('app/admin/content/media/actions.ts');
    expect(action).toContain('media_hero_rollback_failed');
    expect(action).toContain('demoteError');
    expect(action).toContain('previousHeroes');
    expect(action).toContain('category: media.category');
    expect(action).toContain('sort_order: media.sort_order');
  });

  it('refuses to delete metadata that changed after the delete confirmation read', () => {
    const action = source('app/admin/content/media/actions.ts');
    const deleteSection = action.slice(action.indexOf('export async function deleteMediaAsset'));
    expect(deleteSection).toContain(".eq('updated_at', media.updated_at)");
    expect(deleteSection).toContain('deletedRows.length !== 1');
  });
});
