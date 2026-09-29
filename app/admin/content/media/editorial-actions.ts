'use server';

import {revalidatePath} from 'next/cache';
import {
  prepareMediaEditorialLinkCreate,
  prepareMediaEditorialLinkDelete
} from '@/features/admin/media-editorial';
import {requireAdminUser} from '@/features/auth/require-admin-user';
import {createSupabaseServerClient} from '@/lib/supabase/server';

function revalidateEditorialMedia() {
  revalidatePath('/admin/content/media');
  revalidatePath('/blog');
  revalidatePath('/en/blog');
  revalidatePath('/giai-phap');
  revalidatePath('/en/solutions');
  revalidatePath('/giai-phap/shop-online');
  revalidatePath('/giai-phap/doanh-nghiep-nho');
  revalidatePath('/giai-phap/chua-hang');
  revalidatePath('/giai-phap/ca-nhan');
}

export async function createMediaEditorialLink(formData: FormData) {
  const session = await requireAdminUser();
  const context = String(formData.get('context') ?? '');
  const separator = context.indexOf(':');
  if (separator <= 0) throw new Error('invalid_media_editorial_context');

  const payload = prepareMediaEditorialLinkCreate(session.role, {
    mediaId: String(formData.get('mediaId') ?? ''),
    contextType: context.slice(0, separator),
    contextKey: context.slice(separator + 1),
    role: String(formData.get('role') ?? ''),
    sortOrder: String(formData.get('sortOrder') ?? '0')
  });

  const supabase = await createSupabaseServerClient();
  const {error} = await supabase
    .from('media_editorial_links')
    .insert(payload);

  if (error?.code === '23505') throw new Error('media_editorial_link_exists');
  if (error) throw error;
  revalidateEditorialMedia();
}

export async function deleteMediaEditorialLink(formData: FormData) {
  const session = await requireAdminUser();
  const {id} = prepareMediaEditorialLinkDelete(session.role, String(formData.get('id') ?? ''));
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('media_editorial_links')
    .delete()
    .eq('id', id)
    .select('id');

  if (error) throw error;
  if (!data || data.length !== 1) throw new Error('media_editorial_link_delete_noop');
  revalidateEditorialMedia();
}
