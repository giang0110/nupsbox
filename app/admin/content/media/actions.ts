'use server';

import {revalidatePath} from 'next/cache';
import {prepareMediaMetadataUpdate} from '@/features/admin/media';
import {requireAdminUser} from '@/features/auth/require-admin-user';
import {createSupabaseServerClient} from '@/lib/supabase/server';

function inputFromFormData(formData: FormData) {
  return {
    altVi: String(formData.get('altVi') ?? ''),
    altEn: String(formData.get('altEn') ?? ''),
    category: String(formData.get('category') ?? ''),
    sortOrder: String(formData.get('sortOrder') ?? '0'),
    isPublic: String(formData.get('isPublic') ?? '') === 'true',
    locationId: String(formData.get('locationId') ?? ''),
    unitTypeId: String(formData.get('unitTypeId') ?? '')
  };
}

function revalidateMedia() {
  revalidatePath('/admin/content');
  revalidatePath('/admin/content/media');
  revalidatePath('/');
}

export async function updateMediaMetadata(formData: FormData) {
  const session = await requireAdminUser();
  const {id, changes} = prepareMediaMetadataUpdate(
    session.role,
    String(formData.get('id') ?? ''),
    inputFromFormData(formData)
  );
  const supabase = await createSupabaseServerClient();
  const {error} = await supabase.from('media_assets').update(changes).eq('id', id);
  if (error) throw error;
  revalidateMedia();
}
