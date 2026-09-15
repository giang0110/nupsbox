import {describe, expect, it} from 'vitest';
import {
  BlogInputSchema,
  FaqInputSchema,
  MediaMetadataInputSchema,
  SiteSettingInputSchema
} from '@/features/admin/content-schemas';
import {
  prepareFaqCreate,
  prepareFaqPublication,
  prepareFaqUpdate
} from '@/features/admin/faqs';
import {
  prepareMediaMetadataUpdate
} from '@/features/admin/media';
import {requirePermission} from '@/features/admin/mutation-guard';

const faqId = 'a8ba1e58-ece7-4a8a-844c-3b5edcbf8ab0';
const mediaId = 'b8ba1e58-ece7-4a8a-844c-3b5edcbf8ab1';

const validFaqInput = {
  questionVi: 'Kho mini là gì?',
  answerVi: 'Không gian lưu trữ riêng theo nhu cầu.',
  questionEn: 'What is mini storage?',
  answerEn: 'Private storage space sized to your needs.',
  sortOrder: 10
};

const validMediaInput = {
  altVi: 'Kho mini NupsBox',
  altEn: 'NupsBox mini storage',
  category: 'unit' as const,
  sortOrder: 10,
  isPublic: true,
  locationId: null,
  unitTypeId: null
};

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

  it('forces new FAQs to start inactive and keeps publication out of ordinary updates', () => {
    expect(prepareFaqCreate('staff', validFaqInput)).toMatchObject({
      question_vi: validFaqInput.questionVi,
      active: false
    });

    expect(prepareFaqUpdate('staff', faqId, validFaqInput)).toEqual({
      id: faqId,
      changes: {
        question_vi: validFaqInput.questionVi,
        answer_vi: validFaqInput.answerVi,
        question_en: validFaqInput.questionEn,
        answer_en: validFaqInput.answerEn,
        sort_order: 10
      }
    });
  });

  it('requires content publish permission for FAQ publication', () => {
    expect(() => prepareFaqPublication('viewer', faqId, true)).toThrow('forbidden');
    expect(prepareFaqPublication('staff', faqId, true)).toEqual({id: faqId, active: true});
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

  it('allows staff metadata updates but denies viewer media mutation', () => {
    expect(() => prepareMediaMetadataUpdate('viewer', mediaId, validMediaInput)).toThrow('forbidden');
    expect(prepareMediaMetadataUpdate('staff', mediaId, validMediaInput)).toEqual({
      id: mediaId,
      changes: {
        alt_vi: validMediaInput.altVi,
        alt_en: validMediaInput.altEn,
        category: 'unit',
        sort_order: 10,
        is_public: true,
        location_id: null,
        unit_type_id: null
      }
    });
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
