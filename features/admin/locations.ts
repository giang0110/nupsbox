import {z} from 'zod';
import {LocationInputSchema, type LocationInput} from '@/features/admin/catalog-schemas';
import {requirePermission} from '@/features/admin/mutation-guard';
import type {AppRole, LocationStatus} from '@/types/database';

const idSchema = z.string().uuid();

export type LocationDbRow = {
  id: string;
  slug: string;
  name_vi: string;
  name_en: string;
  address_vi: string;
  address_en: string;
  district: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  zalo_url: string | null;
  opening_hours: unknown;
  status: LocationStatus;
  is_featured: boolean;
  sort_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminLocation = {
  id: string;
  slug: string;
  nameVi: string;
  nameEn: string;
  addressVi: string;
  addressEn: string;
  district: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  zaloUrl: string | null;
  openingHours: Record<string, unknown>;
  status: LocationStatus;
  isFeatured: boolean;
  sortOrder: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function openingHoursObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function mapAdminLocation(row: LocationDbRow): AdminLocation {
  return {
    id: row.id,
    slug: row.slug,
    nameVi: row.name_vi,
    nameEn: row.name_en,
    addressVi: row.address_vi,
    addressEn: row.address_en,
    district: row.district,
    city: row.city,
    latitude: row.latitude,
    longitude: row.longitude,
    phone: row.phone,
    zaloUrl: row.zalo_url,
    openingHours: openingHoursObject(row.opening_hours),
    status: row.status,
    isFeatured: row.is_featured,
    sortOrder: row.sort_order,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toLocationMutation(input: LocationInput) {
  return {
    slug: input.slug,
    name_vi: input.nameVi,
    name_en: input.nameEn,
    address_vi: input.addressVi,
    address_en: input.addressEn,
    district: input.district,
    city: input.city,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    phone: input.phone ?? null,
    zalo_url: input.zaloUrl ?? null,
    opening_hours: input.openingHours,
    is_featured: input.isFeatured,
    sort_order: input.sortOrder
  };
}

export function prepareLocationCreate(role: AppRole, input: unknown) {
  requirePermission(role, 'catalog:create');
  const parsed = LocationInputSchema.parse(input);
  return {...toLocationMutation(parsed), status: 'inactive' as const};
}

export function prepareLocationUpdate(role: AppRole, id: string, input: unknown) {
  requirePermission(role, 'catalog:update');
  const locationId = idSchema.parse(id);
  const parsed = LocationInputSchema.parse(input);
  return {id: locationId, changes: toLocationMutation(parsed)};
}

export function prepareLocationPublication(role: AppRole, id: string, publish: boolean) {
  requirePermission(role, 'catalog:publish');
  return {
    id: idSchema.parse(id),
    status: publish ? ('active' as const) : ('inactive' as const)
  };
}

export async function listAdminLocations(): Promise<AdminLocation[]> {
  const {createSupabaseServerClient} = await import('@/lib/supabase/server');
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('locations')
    .select('*')
    .order('sort_order', {ascending: true})
    .order('name_vi', {ascending: true});

  if (error) throw error;
  return (data ?? []).map((row) => mapAdminLocation(row as unknown as LocationDbRow));
}

export async function getAdminLocation(id: string): Promise<AdminLocation | null> {
  const locationId = idSchema.parse(id);
  const {createSupabaseServerClient} = await import('@/lib/supabase/server');
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase.from('locations').select('*').eq('id', locationId).maybeSingle();

  if (error) throw error;
  return data ? mapAdminLocation(data as unknown as LocationDbRow) : null;
}
