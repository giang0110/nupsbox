'use server';

import {randomUUID} from 'node:crypto';
import {revalidatePath} from 'next/cache';
import {
  MEDIA_BUCKET,
  prepareMediaBulkUpdate,
  prepareMediaDelete,
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
    const {data: cleanupRows, error: cleanupError} = await supabase.storage
      .from(MEDIA_BUCKET)
      .remove([storagePath]);

    if (cleanupError || !cleanupRows || cleanupRows.length !== 1) {
      console.error('media_upload_cleanup_failed', {
        storagePath,
        metadataError: metadataError.message,
        cleanupError: cleanupError?.message ?? null,
        cleanedCount: cleanupRows?.length ?? 0
      });
    }

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
  const {data, error} = await supabase
    .from('media_assets')
    .update(command.changes)
    .in('id', command.ids)
    .select('id');

  if (error) throw error;
  if (!data || data.length !== command.ids.length) throw new Error('media_bulk_update_noop');
  revalidateMedia();
}


export async function promoteMediaHero(formData: FormData) {
  const session = await requireAdminUser();
  const id = String(formData.get('id') ?? '');
  const supabase = await createSupabaseServerClient();

  const {data: media, error: readError} = await supabase
    .from('media_assets')
    .select('*')
    .eq('id', id)
    .single();
  if (readError) throw readError;
  if (!media) throw new Error('media_not_found');
  if (!media.location_id) throw new Error('media_hero_requires_location');
  if (!media.is_public) throw new Error('media_hero_requires_public');

  const {data: ordering, error: orderingError} = await supabase
    .from('media_assets')
    .select('sort_order')
    .eq('location_id', media.location_id)
    .order('sort_order', {ascending: true})
    .limit(1);
  if (orderingError) throw orderingError;
  const firstSort = ordering?.[0]?.sort_order ?? 0;

  const {changes} = prepareMediaMetadataUpdate(session.role, id, {
    altVi: media.alt_vi,
    altEn: media.alt_en,
    category: 'hero',
    sortOrder: firstSort - 10,
    isPublic: true,
    locationId: media.location_id,
    unitTypeId: media.unit_type_id ?? ''
  });

  const {data: updated, error: updateError} = await supabase
    .from('media_assets')
    .update(changes)
    .eq('id', id)
    .select('id')
    .single();
  if (updateError) throw updateError;
  if (!updated) throw new Error('media_hero_update_noop');

  const {error: demoteError} = await supabase
    .from('media_assets')
    .update({category: 'location'})
    .eq('location_id', media.location_id)
    .eq('category', 'hero')
    .neq('id', id);
  if (demoteError) throw demoteError;

  revalidateMedia();
}


export async function moveMediaToFront(formData: FormData) {
  const session = await requireAdminUser();
  const id = String(formData.get('id') ?? '');
  const supabase = await createSupabaseServerClient();

  const {data: media, error: readError} = await supabase
    .from('media_assets')
    .select('*')
    .eq('id', id)
    .single();
  if (readError) throw readError;
  if (!media) throw new Error('media_not_found');
  if (!media.location_id) throw new Error('media_order_requires_location');

  const {data: ordering, error: orderingError} = await supabase
    .from('media_assets')
    .select('sort_order')
    .eq('location_id', media.location_id)
    .order('sort_order', {ascending: true})
    .limit(1);
  if (orderingError) throw orderingError;
  const firstSort = ordering?.[0]?.sort_order ?? 0;

  const {changes} = prepareMediaMetadataUpdate(session.role, id, {
    altVi: media.alt_vi,
    altEn: media.alt_en,
    category: media.category,
    sortOrder: firstSort - 10,
    isPublic: media.is_public,
    locationId: media.location_id,
    unitTypeId: media.unit_type_id ?? ''
  });

  const {data: updated, error: updateError} = await supabase
    .from('media_assets')
    .update(changes)
    .eq('id', id)
    .select('id')
    .single();
  if (updateError) throw updateError;
  if (!updated) throw new Error('media_order_update_noop');
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
  const {data, error} = await supabase.from('media_assets').update(changes).eq('id', id).select('id').single();
  if (error) throw error;
  if (!data) throw new Error('media_metadata_update_noop');
  revalidateMedia();
}


export type DeleteMediaState = {
  status: 'idle' | 'error';
  message?: string;
};

export async function deleteMediaAsset(
  _previousState: DeleteMediaState,
  formData: FormData
): Promise<DeleteMediaState> {
  try {
    const session = await requireAdminUser();
    const {id} = prepareMediaDelete(session.role, String(formData.get('id') ?? ''));
    const supabase = await createSupabaseServerClient();

    const {data: media, error: mediaError} = await supabase
      .from('media_assets')
      .select('*')
      .eq('id', id)
      .single();

    if (mediaError || !media) {
      return {status: 'error', message: 'Không tìm thấy ảnh hoặc bạn không có quyền truy cập ảnh này.'};
    }

    const {data: blogReferences, error: blogReferenceError} = await supabase
      .from('blog_posts')
      .select('id, slug')
      .eq('cover_media_id', id)
      .limit(1);

    if (blogReferenceError) {
      return {status: 'error', message: 'Chưa thể kiểm tra ảnh đang được sử dụng. Vui lòng thử lại.'};
    }

    if ((blogReferences ?? []).length > 0) {
      return {
        status: 'error',
        message: 'Ảnh đang được dùng làm cover Blog. Hãy đổi hoặc gỡ cover khỏi bài viết trước khi xoá ảnh.'
      };
    }

    const {data: deletedRows, error: deleteMetadataError} = await supabase
      .from('media_assets')
      .delete()
      .eq('id', id)
      .select('id');

    if (deleteMetadataError || !deletedRows || deletedRows.length !== 1) {
      console.error('media_delete_metadata_failed', {
        mediaId: id,
        error: deleteMetadataError?.message ?? null,
        deletedCount: deletedRows?.length ?? 0
      });
      return {
        status: 'error',
        message: 'Không thể xoá metadata ảnh. Quyền xoá hoặc RLS có thể đang chặn thao tác.'
      };
    }

    const {error: storageError} = await supabase.storage
      .from(MEDIA_BUCKET)
      .remove([media.storage_path]);

    if (storageError) {
      const {error: rollbackError} = await supabase.from('media_assets').insert(media);
      if (rollbackError) {
        console.error('media_delete_rollback_failed', {
          mediaId: id,
          storagePath: media.storage_path,
          storageError: storageError.message,
          rollbackError: rollbackError.message
        });
      }
      return {
        status: 'error',
        message: rollbackError
          ? 'Xoá file Storage thất bại và khôi phục metadata cũng không thành công. Vui lòng kiểm tra Supabase ngay.'
          : 'Xoá file Storage thất bại nên metadata đã được khôi phục. Vui lòng thử lại.'
      };
    }

    revalidateMedia();
    return {status: 'idle'};
  } catch (error) {
    console.error('media_delete_failed', error);
    return {
      status: 'error',
      message: 'Không thể xoá ảnh lúc này. Vui lòng kiểm tra quyền Admin và thử lại.'
    };
  }
}
