import {z} from 'zod';
import {MediaMetadataInputSchema, type MediaMetadataInput} from '@/features/admin/content-schemas';
import {requirePermission} from '@/features/admin/mutation-guard';
import type {AppRole, MediaCategory} from '@/types/database';

const idSchema = z.string().uuid();

export const MEDIA_BUCKET = 'nupsbox-media';
export const MAX_MEDIA_FILE_BYTES = 8 * 1024 * 1024;

const mediaExtensionByMime = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif'
} as const;

export type AllowedMediaMime = keyof typeof mediaExtensionByMime;

export type MediaDbRow = {
  id: string;
  storage_path: string;
  alt_vi: string;
  alt_en: string;
  location_id: string | null;
  unit_type_id: string | null;
  category: MediaCategory;
  sort_order: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminMedia = {
  id: string;
  storagePath: string;
  publicUrl: string;
  altVi: string;
  altEn: string;
  locationId: string | null;
  unitTypeId: string | null;
  category: MediaCategory;
  sortOrder: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
};

export function mapAdminMedia(row: MediaDbRow, publicUrl = ''): AdminMedia {
  return {
    id: row.id,
    storagePath: row.storage_path,
    publicUrl,
    altVi: row.alt_vi,
    altEn: row.alt_en,
    locationId: row.location_id,
    unitTypeId: row.unit_type_id,
    category: row.category,
    sortOrder: row.sort_order,
    isPublic: row.is_public,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toMediaMutation(input: MediaMetadataInput) {
  return {
    alt_vi: input.altVi,
    alt_en: input.altEn,
    category: input.category,
    sort_order: input.sortOrder,
    is_public: input.isPublic,
    location_id: input.locationId ?? null,
    unit_type_id: input.unitTypeId ?? null
  };
}

export function prepareMediaDelete(role: AppRole, id: string) {
  requirePermission(role, 'media:delete');
  return {id: idSchema.parse(id)};
}

export function prepareMediaMetadataUpdate(role: AppRole, id: string, input: unknown) {
  requirePermission(role, 'media:update');
  const mediaId = idSchema.parse(id);
  const parsed = MediaMetadataInputSchema.parse(input);
  return {id: mediaId, changes: toMediaMutation(parsed)};
}

const bulkCategorySchema = z.union([
  z.literal('keep'),
  z.enum(['hero', 'location', 'unit', 'security', 'exterior', 'lifestyle', 'blog'])
]);
const bulkVisibilitySchema = z.enum(['keep', 'public', 'private']);

export function prepareMediaBulkUpdate(
  role: AppRole,
  rawIds: string[],
  input: {visibility?: unknown; category?: unknown; locationId?: unknown}
) {
  requirePermission(role, 'media:update');

  const ids = z.array(idSchema).min(1).max(100).parse([...new Set(rawIds)]);
  const visibility = bulkVisibilitySchema.parse(input.visibility ?? 'keep');
  const category = bulkCategorySchema.parse(input.category ?? 'keep');
  const locationValue = typeof input.locationId === 'string' ? input.locationId : '__keep__';

  const changes: {
    is_public?: boolean;
    category?: MediaCategory;
    location_id?: string | null;
  } = {};

  if (visibility === 'public') changes.is_public = true;
  if (visibility === 'private') changes.is_public = false;
  if (category !== 'keep') changes.category = category;

  if (locationValue === '__clear__') {
    changes.location_id = null;
  } else if (locationValue !== '__keep__') {
    changes.location_id = idSchema.parse(locationValue);
  }

  if (Object.keys(changes).length === 0) throw new Error('bulk_media_no_changes');
  return {ids, changes};
}

export function prepareMediaUpload(
  role: AppRole,
  input: unknown,
  file: {name: string; type: string; size: number}
) {
  requirePermission(role, 'media:create');
  const parsed = MediaMetadataInputSchema.parse(input);

  if (!file.name || file.size <= 0) throw new Error('media_file_required');
  if (file.size > MAX_MEDIA_FILE_BYTES) throw new Error('media_file_too_large');
  if (!(file.type in mediaExtensionByMime)) throw new Error('media_type_not_allowed');

  return {
    metadata: toMediaMutation(parsed),
    extension: mediaExtensionByMime[file.type as AllowedMediaMime]
  };
}

export async function listAdminMedia(): Promise<AdminMedia[]> {
  const {createSupabaseServerClient} = await import('@/lib/supabase/server');
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('media_assets')
    .select('*')
    .order('sort_order', {ascending: true})
    .order('created_at', {ascending: true});

  if (error) throw error;

  return (data ?? []).map((row) => {
    const mapped = row as MediaDbRow;
    const {data: publicData} = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(mapped.storage_path);
    return mapAdminMedia(mapped, publicData.publicUrl);
  });
}
