import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';
import {
  adminMutationConflict,
  adminMutationFailure,
  adminMutationSuccess
} from '@/features/admin/action-result';
import {
  isStaleAdminWrite,
  STALE_ADMIN_WRITE
} from '@/features/admin/optimistic-concurrency';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('P3.47 admin conflict recovery UX', () => {
  it('exposes typed recoverable mutation outcomes', () => {
    expect(adminMutationSuccess()).toEqual({ok: true});
    expect(adminMutationSuccess('/next')).toEqual({ok: true, redirectTo: '/next'});
    expect(adminMutationFailure('failed')).toEqual({
      ok: false,
      kind: 'error',
      message: 'failed'
    });
    expect(adminMutationConflict('2026-09-23T03:30:00.000Z')).toMatchObject({
      ok: false,
      kind: 'conflict',
      latestUpdatedAt: '2026-09-23T03:30:00.000Z'
    });
    expect(isStaleAdminWrite(new Error(STALE_ADMIN_WRITE))).toBe(true);
    expect(isStaleAdminWrite(new Error('other'))).toBe(false);
  });

  it('keeps form values in place and gives explicit recovery choices', () => {
    const form = source('components/admin/admin-mutation-form.tsx');

    expect(form).toContain('event.preventDefault()');
    expect(form).toContain('new FormData(form)');
    expect(form).toContain('setVersion(feedback.latestUpdatedAt)');
    expect(form).toContain('window.location.reload()');
    expect(form).toContain('Giữ bản đang nhập');
    expect(form).toContain('Tải bản mới');
    expect(form).toContain('Dữ liệu bạn vừa nhập vẫn được giữ');
  });

  it('keeps submit buttons pending-aware for manual recoverable actions', () => {
    const button = source('components/admin/admin-submit-button.tsx');
    expect(button).toContain('useAdminMutationPending');
    expect(button).toContain('nativePending || manualPending');
  });

  it('recovers stale editable admin writes with the latest server version', () => {
    for (const path of [
      'app/admin/catalog/locations/actions.ts',
      'app/admin/catalog/unit-types/actions.ts',
      'app/admin/catalog/pricing/actions.ts',
      'app/admin/content/faq/actions.ts',
      'app/admin/content/media/actions.ts',
      'app/admin/content/settings/actions.ts'
    ]) {
      const action = source(path);
      expect(action).toContain('isStaleAdminWrite');
      expect(action).toContain('adminMutationConflict');
      expect(action).toContain("select('updated_at')");
    }
  });

  it('uses the recovery form on every optimistic-concurrency editor', () => {
    for (const path of [
      'components/admin/location-form.tsx',
      'components/admin/unit-type-form.tsx',
      'components/admin/pricing-form.tsx',
      'components/admin/faq-form.tsx',
      'components/admin/site-setting-form.tsx',
      'components/admin/media-metadata-form.tsx'
    ]) {
      const form = source(path);
      expect(form).toContain('AdminMutationForm');
      expect(form).toContain('expectedUpdatedAt=');
    }
  });

  it('recovers publication conflicts instead of falling through to the admin error boundary', () => {
    expect(source('components/admin/location-form.tsx')).toContain(
      'recoverableAction={setLocationPublication}'
    );
    expect(source('components/admin/unit-type-form.tsx')).toContain(
      'recoverableAction={setUnitTypePublication}'
    );
    expect(source('components/admin/faq-form.tsx')).toContain(
      'recoverableAction={setFaqPublication}'
    );
  });
});
