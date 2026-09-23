'use server';

import {revalidatePath} from 'next/cache';
import {preparePublicSiteSettingUpdate} from '@/features/admin/settings';
import {adminMutationConflict, adminMutationFailure, adminMutationSuccess, type AdminMutationResult} from '@/features/admin/action-result';
import {assertFreshAdminWrite, isStaleAdminWrite, requireExpectedUpdatedAt, STALE_ADMIN_WRITE} from '@/features/admin/optimistic-concurrency';
import {requireAdminUser} from '@/features/auth/require-admin-user';
import {createSupabaseServerClient} from '@/lib/supabase/server';

function existingOpeningHours(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const openingHours = (value as Record<string, unknown>).opening_hours;
  return openingHours && typeof openingHours === 'object' && !Array.isArray(openingHours)
    ? openingHours as Record<string, unknown>
    : {};
}

async function recoverSettingConflict(key: string): Promise<AdminMutationResult> {
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('site_settings')
    .select('updated_at')
    .eq('key', key)
    .maybeSingle();

  if (error) throw error;
  if (!data?.updated_at) {
    return adminMutationFailure('Thiết lập này không còn tồn tại. Hãy tải lại trang để đồng bộ dữ liệu.');
  }
  return adminMutationConflict(data.updated_at);
}

export async function updatePublicSiteSetting(formData: FormData): Promise<AdminMutationResult> {
  const key = String(formData.get('key') ?? '');

  try {
    const session = await requireAdminUser();
    const supabase = await createSupabaseServerClient();

    const {data: current, error: currentError} = await supabase
      .from('site_settings')
      .select('value, updated_at')
      .eq('key', key)
      .maybeSingle();

    if (currentError) throw currentError;

    const expectedUpdatedAt = String(formData.get('expectedUpdatedAt') ?? '').trim();
    if (current) {
      if (!expectedUpdatedAt || current.updated_at !== expectedUpdatedAt) {
        throw new Error(STALE_ADMIN_WRITE);
      }
      requireExpectedUpdatedAt(formData.get('expectedUpdatedAt'));
    }

    const prepared = preparePublicSiteSettingUpdate(session.role, {
      key,
      value: {
        phone: String(formData.get('phone') ?? ''),
        zalo_url: String(formData.get('zaloUrl') ?? ''),
        email: String(formData.get('email') ?? ''),
        facebook_url: String(formData.get('facebookUrl') ?? ''),
        opening_hours: existingOpeningHours(current?.value)
      },
      isPublic: true
    });

    const payload = {
      key: prepared.key,
      value: prepared.value,
      is_public: prepared.is_public,
      updated_by: session.user.id
    };

    if (!current) {
      const {data, error} = await supabase
        .from('site_settings')
        .insert(payload)
        .select('key')
        .single();
      if (error?.code === '23505') throw new Error(STALE_ADMIN_WRITE);
      if (error) throw error;
      if (!data) throw new Error('setting_not_found');
    } else {
      const {data, error} = await supabase
        .from('site_settings')
        .update(payload)
        .eq('key', prepared.key)
        .eq('updated_at', expectedUpdatedAt)
        .select('key')
        .maybeSingle();
      if (error) throw error;
      assertFreshAdminWrite(data);
    }

    revalidatePath('/admin/content');
    revalidatePath('/admin/content/settings');
    revalidatePath('/');
    revalidatePath('/lien-he');
    revalidatePath('/ve-nupsbox');
    return adminMutationSuccess();
  } catch (error) {
    if (!isStaleAdminWrite(error)) throw error;
    return recoverSettingConflict(key);
  }
}
