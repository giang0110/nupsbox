import {describe, expect, it} from 'vitest';
import {projectActiveFaqs, selectHomepageUnits} from '@/features/home/content';

describe('homepage content selection', () => {
  it('puts featured units first and then respects sort order', () => {
    const units = [
      {slug: 'c', featured: false, sortOrder: 1},
      {slug: 'b', featured: true, sortOrder: 20},
      {slug: 'a', featured: true, sortOrder: 10}
    ];
    expect(selectHomepageUnits(units).map((unit) => unit.slug)).toEqual(['a', 'b', 'c']);
  });

  it('projects only active FAQ rows in sort order for the requested locale', () => {
    const rows = [
      {id: '2', question_vi: 'Q2', answer_vi: 'A2', question_en: 'E2', answer_en: 'EA2', active: true, sort_order: 20},
      {id: 'off', question_vi: 'Off', answer_vi: 'Off', question_en: 'Off', answer_en: 'Off', active: false, sort_order: 1},
      {id: '1', question_vi: 'Q1', answer_vi: 'A1', question_en: 'E1', answer_en: 'EA1', active: true, sort_order: 10}
    ];

    expect(projectActiveFaqs(rows, 'vi')).toEqual([
      {id: '1', question: 'Q1', answer: 'A1'},
      {id: '2', question: 'Q2', answer: 'A2'}
    ]);
  });
});
