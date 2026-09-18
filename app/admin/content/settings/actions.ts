'use server';

import {revalidatePath} from 'next/cache';
import {preparePublicSiteSettingUpdate} from '@/features/admin/settings';
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
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (currentError) throw currentError;

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

  const {data, error} = await supabase
    .from('site_settings')
    .upsert({
      key: prepared.key,
      value: prepared.value,
      is_public: prepared.is_public,
      updated_by: session.user.id
    }, {onConflict: 'key'})
    .select('key')
    .single();

  if (error) throw error;
  if (!data) throw new Error('setting_not_found');

  revalidatePath('/admin/content');
  revalidatePath('/admin/content/settings');
  revalidatePath('/');
  revalidatePath('/lien-he');
  revalidatePath('/ve-nupsbox');
}
