'use server';

import {revalidatePath} from 'next/cache';
import {preparePublicSiteSettingUpdate} from '@/features/admin/settings';
import {requireAdminUser} from '@/features/auth/require-admin-user';
import {createSupabaseServerClient} from '@/lib/supabase/server';

export async function updatePublicSiteSetting(formData: FormData) {
  const session = await requireAdminUser();
  const prepared = preparePublicSiteSettingUpdate(session.role, {
    key: String(formData.get('key') ?? ''),
    value: {
      phone: String(formData.get('phone') ?? ''),
      zalo_url: String(formData.get('zaloUrl') ?? '')
    },
    isPublic: true
  });

  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('site_settings')
    .update({
      value: prepared.value,
      is_public: prepared.is_public,
      updated_by: session.user.id
    })
    .eq('key', prepared.key)
    .select('key')
    .single();

  if (error) throw error;
  if (!data) throw new Error('setting_not_found');

  revalidatePath('/admin/content');
  revalidatePath('/admin/content/settings');
  revalidatePath('/');
}
