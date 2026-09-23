'use server';

import {revalidatePath} from 'next/cache';
import {preparePublicSiteSettingUpdate} from '@/features/admin/settings';
import {assertFreshAdminWrite, requireExpectedUpdatedAt} from '@/features/admin/optimistic-concurrency';
import {requireAdminUser} from '@/features/auth/require-admin-user';
import {createSupabaseServerClient} from '@/lib/supabase/server';

function existingOpeningHours(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const openingHours = (value as Record<string, unknown>).opening_hours;
  return openingHours && typeof openingHours === 'object' && !Array.isArray(openingHours)
    ? openingHours as Record<string, unknown>
    : {};
}

export async function updatePublicSiteSetting(formData: FormData) {
  const session = await requireAdminUser();
  const supabase = await createSupabaseServerClient();
  const key = String(formData.get('key') ?? '');

  const {data: current, error: currentError} = await supabase
    .from('site_settings')
    .select('value, updated_at')
    .eq('key', key)
    .maybeSingle();

  if (currentError) throw currentError;

  const expectedUpdatedAt = String(formData.get('expectedUpdatedAt') ?? '').trim();
  if (current) {
    requireExpectedUpdatedAt(formData.get('expectedUpdatedAt'));
    if (current.updated_at !== expectedUpdatedAt) throw new Error('stale_admin_write');
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
}
