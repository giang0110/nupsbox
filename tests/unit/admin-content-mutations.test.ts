import {describe, expect, it} from 'vitest';
import {
  BlogInputSchema,
  FaqInputSchema,
  MediaMetadataInputSchema,
  SiteSettingInputSchema
} from '@/features/admin/content-schemas';
import {requirePermission} from '@/features/admin/mutation-guard';

describe('content CMS mutation contracts', () => {
  it('rejects empty bilingual FAQ content', () => {
    expect(() =>
      FaqInputSchema.parse({
        questionVi: '',
        answerVi: '',
        questionEn: '',
        answerEn: ''
      })
    ).toThrow();
  });

  it('keeps publication state out of ordinary blog edits', () => {
    expect(() =>
      BlogInputSchema.parse({
        status: 'published',
        slug: 'huong-dan-kho-mini',
        titleVi: '',
        titleEn: '',
        bodyVi: {},
        bodyEn: {}
      })
    ).toThrow();
  });

  it('requires bilingual media alt metadata', () => {
    expect(() =>
      MediaMetadataInputSchema.parse({
        altVi: '',
        altEn: 'Storage unit',
        category: 'unit',
        isPublic: true
      })
    ).toThrow();
  });

  it('rejects secret-like setting keys at validation boundary', () => {
    expect(() =>
      SiteSettingInputSchema.parse({key: 'service_role_key', value: 'x', isPublic: true})
    ).toThrow();
  });

  it('enforces shared content permissions', () => {
    expect(() => requirePermission('viewer', 'content:update')).toThrow('forbidden');
    expect(() => requirePermission('staff', 'content:publish')).not.toThrow();
  });
});
