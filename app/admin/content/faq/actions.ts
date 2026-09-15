'use server';

import {revalidatePath} from 'next/cache';
import {
  prepareFaqCreate,
  prepareFaqPublication,
  prepareFaqUpdate
} from '@/features/admin/faqs';
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

export async function createFaq(formData: FormData) {
  const session = await requireAdminUser();
  const payload = prepareFaqCreate(session.role, inputFromFormData(formData));
  const supabase = await createSupabaseServerClient();
  const {error} = await supabase.from('faqs').insert(payload);
  if (error) throw error;
  revalidateFaqs();
}

export async function updateFaq(formData: FormData) {
  const session = await requireAdminUser();
  const {id, changes} = prepareFaqUpdate(
    session.role,
    String(formData.get('id') ?? ''),
    inputFromFormData(formData)
  );
  const supabase = await createSupabaseServerClient();
  const {error} = await supabase.from('faqs').update(changes).eq('id', id);
  if (error) throw error;
  revalidateFaqs();
}

export async function setFaqPublication(formData: FormData) {
  const session = await requireAdminUser();
  const id = String(formData.get('id') ?? '');
  const publish = String(formData.get('publish') ?? '') === 'true';
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
  const {error} = await supabase.from('faqs').update({active: command.active}).eq('id', command.id);
  if (error) throw error;
  revalidateFaqs();
}
