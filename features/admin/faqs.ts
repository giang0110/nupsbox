import {z} from 'zod';
import {FaqInputSchema, type FaqInput} from '@/features/admin/content-schemas';
import {requirePermission} from '@/features/admin/mutation-guard';
import type {AppRole} from '@/types/database';

const idSchema = z.string().uuid();

export type FaqDbRow = {
  id: string;
  question_vi: string;
  answer_vi: string;
  question_en: string;
  answer_en: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type AdminFaq = {
  id: string;
  questionVi: string;
  answerVi: string;
  questionEn: string;
  answerEn: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export function mapAdminFaq(row: FaqDbRow): AdminFaq {
  return {
    id: row.id,
    questionVi: row.question_vi,
    answerVi: row.answer_vi,
    questionEn: row.question_en,
    answerEn: row.answer_en,
    active: row.active,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toFaqMutation(input: FaqInput) {
  return {
    question_vi: input.questionVi,
    answer_vi: input.answerVi,
    question_en: input.questionEn,
    answer_en: input.answerEn,
    sort_order: input.sortOrder
  };
}

export function prepareFaqCreate(role: AppRole, input: unknown) {
  requirePermission(role, 'content:create');
  const parsed = FaqInputSchema.parse(input);
  return {...toFaqMutation(parsed), active: false as const};
}

export function prepareFaqUpdate(role: AppRole, id: string, input: unknown) {
  requirePermission(role, 'content:update');
  const faqId = idSchema.parse(id);
  const parsed = FaqInputSchema.parse(input);
  return {id: faqId, changes: toFaqMutation(parsed)};
}

export function prepareFaqPublication(
  role: AppRole,
  id: string,
  publish: boolean,
  currentInput?: unknown
) {
  requirePermission(role, 'content:publish');
  if (publish) FaqInputSchema.parse(currentInput);
  return {id: idSchema.parse(id), active: publish};
}

export async function listAdminFaqs(): Promise<AdminFaq[]> {
  const {createSupabaseServerClient} = await import('@/lib/supabase/server');
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('faqs')
    .select('*')
    .order('sort_order', {ascending: true})
    .order('created_at', {ascending: true});

  if (error) throw error;
  return (data ?? []).map((row) => mapAdminFaq(row as FaqDbRow));
}
