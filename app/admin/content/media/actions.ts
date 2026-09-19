'use server';

import {randomUUID} from 'node:crypto';
import {revalidatePath} from 'next/cache';
import {
  MEDIA_BUCKET,
  prepareMediaBulkUpdate,
  prepareMediaMetadataUpdate,
  prepareMediaUpload
} from '@/features/admin/media';
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
  revalidatePath('/ve-nupsbox');
}

export async function uploadMediaAsset(formData: FormData) {
  const session = await requireAdminUser();
  const file = formData.get('file');
  if (!(file instanceof File)) throw new Error('media_file_required');

  const prepared = prepareMediaUpload(session.role, inputFromFormData(formData), {
    name: file.name,
    type: file.type,
    size: file.size
  });

  const scope = prepared.metadata.location_id ?? 'general';
  const storagePath = `${scope}/${randomUUID()}.${prepared.extension}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const supabase = await createSupabaseServerClient();

  const {error: uploadError} = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(storagePath, bytes, {
      contentType: file.type,
      cacheControl: '31536000',
      upsert: false
    });

  if (uploadError) throw uploadError;

  const {error: metadataError} = await supabase.from('media_assets').insert({
    storage_path: storagePath,
    ...prepared.metadata
  });

  if (metadataError) {
    await supabase.storage.from(MEDIA_BUCKET).remove([storagePath]);
    throw metadataError;
  }

  revalidateMedia();
}

export async function bulkUpdateMediaAssets(formData: FormData) {
  const session = await requireAdminUser();
  const command = prepareMediaBulkUpdate(
    session.role,
    formData.getAll('mediaIds').map(value => String(value)),
    {
      visibility: formData.get('bulkVisibility'),
      category: formData.get('bulkCategory'),
      locationId: formData.get('bulkLocationId')
    }
  );

  const supabase = await createSupabaseServerClient();
  const {error} = await supabase
    .from('media_assets')
    .update(command.changes)
    .in('id', command.ids);

  if (error) throw error;
  revalidateMedia();
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
