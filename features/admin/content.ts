import {createSupabaseServerClient} from '@/lib/supabase/server';

export type AdminFaqRow = {
  id: string;
  questionVi: string;
  answerVi: string;
  questionEn: string;
  answerEn: string;
  active: boolean;
  sortOrder: number;
};

export type AdminMediaRow = {
  id: string;
  storagePath: string;
  category: string;
  altVi: string;
  altEn: string;
  isPublic: boolean;
  sortOrder: number;
};

export type AdminSettingRow = {
  key: string;
  isPublic: boolean;
  value: unknown;
};

export type AdminContent = {
  faqs: AdminFaqRow[];
  media: AdminMediaRow[];
  settings: AdminSettingRow[];
};

type FaqSource = {
  id?: unknown;
  question_vi?: unknown;
  answer_vi?: unknown;
  question_en?: unknown;
  answer_en?: unknown;
  active?: unknown;
  sort_order?: unknown;
};

type MediaAltSource = {alt_vi?: unknown; alt_en?: unknown};

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function numberValue(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function projectAdminFaq(row: FaqSource): AdminFaqRow {
  return {
    id: stringValue(row.id),
    questionVi: stringValue(row.question_vi),
    answerVi: stringValue(row.answer_vi),
    questionEn: stringValue(row.question_en),
    answerEn: stringValue(row.answer_en),
    active: row.active === true,
    sortOrder: numberValue(row.sort_order)
  };
}

export function mediaAltCompleteness(row: MediaAltSource) {
  const vi = stringValue(row.alt_vi).trim().length > 0;
  const en = stringValue(row.alt_en).trim().length > 0;
  return {vi, en, complete: vi && en};
}

export async function getAdminContent(options: {includeSettings?: boolean} = {}): Promise<AdminContent> {
  const supabase = await createSupabaseServerClient();
  const [faqsResult, mediaResult, settingsResult] = await Promise.all([
    supabase
      .from('faqs')
      .select('id, question_vi, answer_vi, question_en, answer_en, active, sort_order')
      .order('sort_order', {ascending: true}),
    supabase
      .from('media_assets')
      .select('id, storage_path, category, alt_vi, alt_en, is_public, sort_order')
      .order('sort_order', {ascending: true}),
    options.includeSettings
      ? supabase.from('site_settings').select('key, value, is_public').order('key', {ascending: true})
      : Promise.resolve({data: [], error: null})
  ]);

  const firstError = [faqsResult.error, mediaResult.error, settingsResult.error].find(Boolean);
  if (firstError) throw firstError;

  return {
    faqs: (faqsResult.data ?? []).map((row) => projectAdminFaq(row as FaqSource)),
    media: (mediaResult.data ?? []).map((row) => {
      const source = row as Record<string, unknown>;
      return {
        id: stringValue(source.id),
        storagePath: stringValue(source.storage_path),
        category: stringValue(source.category),
        altVi: stringValue(source.alt_vi),
        altEn: stringValue(source.alt_en),
        isPublic: source.is_public === true,
        sortOrder: numberValue(source.sort_order)
      };
    }),
    settings: (settingsResult.data ?? []).map((row) => {
      const source = row as Record<string, unknown>;
      return {
        key: stringValue(source.key),
        isPublic: source.is_public === true,
        value: source.value
      };
    })
  };
}
