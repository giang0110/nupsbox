'use server';

import {revalidatePath} from 'next/cache';
import {prepareCommercialBlockUpdate} from '@/features/admin/commercial-content';
import {
  adminMutationConflict,
  adminMutationFailure,
  adminMutationSuccess,
  type AdminMutationResult
} from '@/features/admin/action-result';
import {
  assertFreshAdminWrite,
  isStaleAdminWrite,
  STALE_ADMIN_WRITE
} from '@/features/admin/optimistic-concurrency';
import {requireAdminUser} from '@/features/auth/require-admin-user';
import {createSupabaseServerClient} from '@/lib/supabase/server';

function bool(formData: FormData, key: string) {
  return formData.get(key) === 'on' || formData.get(key) === 'true';
}

function copy(formData: FormData, suffix: 'Vi' | 'En') {
  return {
    eyebrow: String(formData.get('eyebrow' + suffix) ?? ''),
    title: String(formData.get('title' + suffix) ?? ''),
    description: String(formData.get('description' + suffix) ?? ''),
    primaryLabel: String(formData.get('primaryLabel' + suffix) ?? ''),
    secondaryLabel: String(formData.get('secondaryLabel' + suffix) ?? '')
  };
}

async function recoverConflict(blockKey: string): Promise<AdminMutationResult> {
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('content_blocks')
    .select('updated_at')
    .eq('page_key', 'commercial')
    .eq('block_key', blockKey)
    .maybeSingle();

  if (error) throw error;
  if (!data?.updated_at) {
    return adminMutationFailure('Khối nội dung này không còn tồn tại. Hãy tải lại trang để đồng bộ.');
  }
  return adminMutationConflict(data.updated_at);
}

export async function updateCommercialBlock(formData: FormData): Promise<AdminMutationResult> {
  const blockKey = String(formData.get('blockKey') ?? '');

  try {
    const session = await requireAdminUser();
    const supabase = await createSupabaseServerClient();
    const prepared = prepareCommercialBlockUpdate(session.role, {
      blockKey,
      contentVi: copy(formData, 'Vi'),
      contentEn: copy(formData, 'En'),
      active: bool(formData, 'active'),
      sortOrder: Number(formData.get('sortOrder') ?? 0)
    });

    const {data: current, error: currentError} = await supabase
      .from('content_blocks')
      .select('id, updated_at')
      .eq('page_key', 'commercial')
      .eq('block_key', prepared.block_key)
      .maybeSingle();

    if (currentError) throw currentError;
    const expectedUpdatedAt = String(formData.get('expectedUpdatedAt') ?? '').trim();

    if (!current) {
      const {error} = await supabase.from('content_blocks').insert(prepared);
      if (error?.code === '23505') throw new Error(STALE_ADMIN_WRITE);
      if (error) throw error;
    } else {
      if (!expectedUpdatedAt || expectedUpdatedAt !== current.updated_at) {
        throw new Error(STALE_ADMIN_WRITE);
      }

      const {data, error} = await supabase
        .from('content_blocks')
        .update({
          content_vi: prepared.content_vi,
          content_en: prepared.content_en,
          active: prepared.active,
          sort_order: prepared.sort_order
        })
        .eq('id', current.id)
        .eq('updated_at', expectedUpdatedAt)
        .select('id')
        .maybeSingle();

      if (error) throw error;
      assertFreshAdminWrite(data);
    }

    revalidatePath('/admin/content');
    revalidatePath('/admin/content/commercial');
    revalidatePath('/');
    revalidatePath('/en');
    revalidatePath('/giai-phap');
    revalidatePath('/en/solutions');
    revalidatePath('/ve-nupsbox');
    revalidatePath('/en/about-nupsbox');
    revalidatePath('/lien-he');
    revalidatePath('/en/contact');
    return adminMutationSuccess();
  } catch (error) {
    if (!isStaleAdminWrite(error)) throw error;
    return recoverConflict(blockKey);
  }
}
