'use server';

import {revalidatePath} from 'next/cache';
import {
  prepareFaqCreate,
  prepareFaqPublication,
  prepareFaqUpdate
} from '@/features/admin/faqs';
import {adminMutationConflict, adminMutationFailure, adminMutationSuccess, type AdminMutationResult} from '@/features/admin/action-result';
import {assertFreshAdminWrite, isStaleAdminWrite, requireExpectedUpdatedAt} from '@/features/admin/optimistic-concurrency';
import {requireAdminUser} from '@/features/auth/require-admin-user';
import {createSupabaseServerClient} from '@/lib/supabase/server';

function inputFromFormData(formData: FormData) {
  return {
    questionVi: String(formData.get('questionVi') ?? ''),
    answerVi: String(formData.get('answerVi') ?? ''),
    questionEn: String(formData.get('questionEn') ?? ''),
    answerEn: String(formData.get('answerEn') ?? ''),
    sortOrder: String(formData.get('sortOrder') ?? '0')
  };
}

function revalidateFaqs() {
  revalidatePath('/admin/content');
  revalidatePath('/admin/content/faq');
  revalidatePath('/');
}

async function recoverFaqConflict(id: string): Promise<AdminMutationResult> {
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('faqs')
    .select('updated_at')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data?.updated_at) {
    return adminMutationFailure('FAQ này không còn tồn tại. Hãy tải lại trang để đồng bộ dữ liệu.');
  }
  return adminMutationConflict(data.updated_at);
}

export async function createFaq(formData: FormData) {
  const session = await requireAdminUser();
  const payload = prepareFaqCreate(session.role, inputFromFormData(formData));
  const supabase = await createSupabaseServerClient();
  const {error} = await supabase.from('faqs').insert(payload);
  if (error) throw error;
  revalidateFaqs();
}

export async function updateFaq(formData: FormData): Promise<AdminMutationResult> {
  const id = String(formData.get('id') ?? '');

  try {
    const session = await requireAdminUser();
    const {id: preparedId, changes} = prepareFaqUpdate(
      session.role,
      id,
      inputFromFormData(formData)
    );
    const expectedUpdatedAt = requireExpectedUpdatedAt(formData.get('expectedUpdatedAt'));
    const supabase = await createSupabaseServerClient();
    const {data, error} = await supabase
      .from('faqs')
      .update(changes)
      .eq('id', preparedId)
      .eq('updated_at', expectedUpdatedAt)
      .select('id')
      .maybeSingle();
    if (error) throw error;
    assertFreshAdminWrite(data);
    revalidateFaqs();
    return adminMutationSuccess();
  } catch (error) {
    if (!isStaleAdminWrite(error)) throw error;
    return recoverFaqConflict(id);
  }
}

export async function setFaqPublication(formData: FormData): Promise<AdminMutationResult> {
  const id = String(formData.get('id') ?? '');

  try {
    const session = await requireAdminUser();
    const publish = String(formData.get('publish') ?? '') === 'true';
    const expectedUpdatedAt = requireExpectedUpdatedAt(formData.get('expectedUpdatedAt'));
    const supabase = await createSupabaseServerClient();

    let currentInput: ReturnType<typeof inputFromFormData> | undefined;
    if (publish) {
      const {data, error} = await supabase
        .from('faqs')
        .select('question_vi, answer_vi, question_en, answer_en, sort_order')
        .eq('id', id)
        .single();
      if (error) throw error;
      currentInput = {
        questionVi: data.question_vi,
        answerVi: data.answer_vi,
        questionEn: data.question_en,
        answerEn: data.answer_en,
        sortOrder: String(data.sort_order)
      };
    }

    const command = prepareFaqPublication(session.role, id, publish, currentInput);
    const {data, error} = await supabase
      .from('faqs')
      .update({active: command.active})
      .eq('id', command.id)
      .eq('updated_at', expectedUpdatedAt)
      .select('id')
      .maybeSingle();
    if (error) throw error;
    assertFreshAdminWrite(data);
    revalidateFaqs();
    return adminMutationSuccess();
  } catch (error) {
    if (!isStaleAdminWrite(error)) throw error;
    return recoverFaqConflict(id);
  }
}
