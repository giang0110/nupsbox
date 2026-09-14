export type MarketingFaq = {
  id: string;
  question: string;
  answer: string;
};

type LocalizedFaqSource = {
  id?: unknown;
  question_vi?: unknown;
  answer_vi?: unknown;
  question_en?: unknown;
  answer_en?: unknown;
  active?: unknown;
  sort_order?: unknown;
};

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function sortOrderValue(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function selectHomepageUnits<T extends {featured?: boolean; sortOrder: number}>(units: T[]): T[] {
  return [...units].sort((a, b) => {
    const featuredDelta = Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    return featuredDelta || a.sortOrder - b.sortOrder;
  });
}

export function projectActiveFaqs(rows: LocalizedFaqSource[], locale: 'vi' | 'en'): MarketingFaq[] {
  return rows
    .filter((row) => row.active === true)
    .sort((a, b) => sortOrderValue(a.sort_order) - sortOrderValue(b.sort_order))
    .map((row) => ({
      id: stringValue(row.id),
      question: stringValue(locale === 'vi' ? row.question_vi : row.question_en),
      answer: stringValue(locale === 'vi' ? row.answer_vi : row.answer_en)
    }))
    .filter((row) => row.id && row.question && row.answer);
}
