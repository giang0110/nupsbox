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
