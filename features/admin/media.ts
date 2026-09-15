import {z} from 'zod';
import {MediaMetadataInputSchema, type MediaMetadataInput} from '@/features/admin/content-schemas';
import {requirePermission} from '@/features/admin/mutation-guard';
import type {AppRole, MediaCategory} from '@/types/database';

const idSchema = z.string().uuid();

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

export function mapAdminMedia(row: MediaDbRow): AdminMedia {
  return {
    id: row.id,
    storagePath: row.storage_path,
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

export function prepareMediaMetadataUpdate(role: AppRole, id: string, input: unknown) {
  requirePermission(role, 'media:update');
  const mediaId = idSchema.parse(id);
  const parsed = MediaMetadataInputSchema.parse(input);
  return {id: mediaId, changes: toMediaMutation(parsed)};
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
  return (data ?? []).map((row) => mapAdminMedia(row as MediaDbRow));
}
