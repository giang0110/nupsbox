import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('media delete CMS contract', () => {
  it('shows a confirmed destructive action only when canDelete is supplied', () => {
    const form = source('components/admin/media-metadata-form.tsx');
    const button = source('components/admin/media-delete-form.tsx');
    expect(form).toContain('canDelete');
    expect(form).toContain('<MediaDeleteForm');
    expect(button).toContain('window.confirm');
    expect(button).toContain('Xoá ảnh');
  });

  it('blocks blog cover deletion and removes both metadata and storage', () => {
    const action = source('app/admin/content/media/actions.ts');
    expect(action).toContain(".eq('cover_media_id', id)");
    expect(action).toContain(".from('media_assets')");
    expect(action).toContain('.delete()');
    expect(action).toContain(".select('id')");
    expect(action).toContain('deletedRows.length !== 1');
    expect(action).toContain('.remove([media.storage_path])');
    expect(action).toContain('rollback');
  });

  it('ships admin-only database and storage delete policies', () => {
    const migration = source('supabase/migrations/20260919085426_p317_fix_media_delete_rls.sql');
    expect(migration).toContain('media_assets_admin_delete');
    expect(migration).toContain('nupsbox_media_admin_delete');
    expect(migration).toContain("current_app_role() = 'admin'::app_role");
    expect(migration).toContain("bucket_id = 'nupsbox-media'");
  });

  it('keeps delete feedback outside the collapsible metadata editor', () => {
    const form = source('components/admin/media-metadata-form.tsx');
    const detailsEnd = form.indexOf('</details>');
    const deleteForm = form.indexOf('<MediaDeleteForm');
    expect(detailsEnd).toBeGreaterThan(-1);
    expect(deleteForm).toBeGreaterThan(detailsEnd);
  });
});
