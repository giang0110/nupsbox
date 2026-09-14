import {describe, expect, it} from 'vitest';
import {mediaAltCompleteness, projectAdminFaq} from '@/features/admin/content';

describe('admin content QA', () => {
  it('projects bilingual FAQ rows without losing active state', () => {
    expect(projectAdminFaq({
      id: 'faq-1',
      question_vi: 'Kho mini là gì?',
      answer_vi: 'Không gian lưu trữ riêng.',
      question_en: 'What is mini storage?',
      answer_en: 'A private storage space.',
      active: true,
      sort_order: 10
    })).toEqual({
      id: 'faq-1',
      questionVi: 'Kho mini là gì?',
      answerVi: 'Không gian lưu trữ riêng.',
      questionEn: 'What is mini storage?',
      answerEn: 'A private storage space.',
      active: true,
      sortOrder: 10
    });
  });

  it('detects missing bilingual media alt text', () => {
    expect(mediaAltCompleteness({alt_vi: 'Kho NupsBox', alt_en: 'NupsBox storage'})).toEqual({vi: true, en: true, complete: true});
    expect(mediaAltCompleteness({alt_vi: 'Kho NupsBox', alt_en: ' '})).toEqual({vi: true, en: false, complete: false});
  });
});
