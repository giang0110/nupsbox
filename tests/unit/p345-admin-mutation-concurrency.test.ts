import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';
import {
  assertFreshAdminWrite,
  requireExpectedUpdatedAt,
  STALE_ADMIN_WRITE
} from '@/features/admin/optimistic-concurrency';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('P3.45 admin mutation consistency and optimistic concurrency', () => {
  it('requires a valid record version and rejects stale writes', () => {
    expect(requireExpectedUpdatedAt('2026-09-23T03:00:00.000Z')).toBe(
      '2026-09-23T03:00:00.000Z'
    );
    expect(() => requireExpectedUpdatedAt('')).toThrow('invalid_expected_updated_at');
    expect(() => requireExpectedUpdatedAt('not-a-date')).toThrow('invalid_expected_updated_at');
    expect(() => assertFreshAdminWrite(null)).toThrow(STALE_ADMIN_WRITE);
    expect(assertFreshAdminWrite({id: 'ok'})).toEqual({id: 'ok'});
  });

  it('guards editable catalog and CMS writes with updated_at equality', () => {
    for (const path of [
      'app/admin/catalog/locations/actions.ts',
      'app/admin/catalog/unit-types/actions.ts',
      'app/admin/catalog/pricing/actions.ts',
      'app/admin/content/faq/actions.ts',
      'app/admin/content/media/actions.ts'
    ]) {
      const action = source(path);
      expect(action).toContain("formData.get('expectedUpdatedAt')");
      expect(action).toContain(".eq('updated_at', expectedUpdatedAt)");
      expect(action).toContain('assertFreshAdminWrite');
    }
  });

  it('guards public settings against stale edits without turning an update into an upsert overwrite', () => {
    const settings = source('app/admin/content/settings/actions.ts');
    expect(settings).toContain("select('value, updated_at')");
    expect(settings).toContain("current.updated_at !== expectedUpdatedAt");
    expect(settings).toContain(".eq('updated_at', expectedUpdatedAt)");
    expect(settings).not.toContain('.upsert(');
  });

  it('carries record versions through every protected admin edit form', () => {
    for (const path of [
      'components/admin/location-form.tsx',
      'components/admin/unit-type-form.tsx',
      'components/admin/pricing-form.tsx',
      'components/admin/faq-form.tsx',
      'components/admin/site-setting-form.tsx',
      'components/admin/media-metadata-form.tsx'
    ]) {
      expect(source(path)).toContain('name="expectedUpdatedAt"');
    }
  });

  it('uses pending-aware submit controls for protected edits', () => {
    const button = source('components/admin/admin-submit-button.tsx');
    expect(button).toContain('useFormStatus');
    expect(button).toContain('disabled={disabled || pending}');

    for (const path of [
      'components/admin/location-form.tsx',
      'components/admin/unit-type-form.tsx',
      'components/admin/pricing-form.tsx',
      'components/admin/faq-form.tsx',
      'components/admin/site-setting-form.tsx',
      'components/admin/media-metadata-form.tsx'
    ]) {
      expect(source(path)).toContain('AdminSubmitButton');
    }
  });
});
