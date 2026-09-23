'use server';

import {revalidatePath} from 'next/cache';
import {
  prepareLocationCreate,
  prepareLocationPublication,
  prepareLocationUpdate
} from '@/features/admin/locations';
import {adminMutationConflict, adminMutationFailure, adminMutationSuccess, type AdminMutationResult} from '@/features/admin/action-result';
import {assertFreshAdminWrite, isStaleAdminWrite, requireExpectedUpdatedAt} from '@/features/admin/optimistic-concurrency';
import {requireAdminUser} from '@/features/auth/require-admin-user';
import {createSupabaseServerClient} from '@/lib/supabase/server';

function parseOpeningHours(value: FormDataEntryValue | null): Record<string, unknown> {
  const raw = String(value ?? '').trim();
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('invalid_opening_hours');
    }
    return parsed as Record<string, unknown>;
  } catch {
    throw new Error('invalid_opening_hours');
  }
}

function inputFromFormData(formData: FormData) {
  return {
    slug: String(formData.get('slug') ?? ''),
    nameVi: String(formData.get('nameVi') ?? ''),
    nameEn: String(formData.get('nameEn') ?? ''),
    addressVi: String(formData.get('addressVi') ?? ''),
    addressEn: String(formData.get('addressEn') ?? ''),
    district: String(formData.get('district') ?? ''),
    city: String(formData.get('city') ?? 'Ho Chi Minh City'),
    latitude: String(formData.get('latitude') ?? ''),
    longitude: String(formData.get('longitude') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    zaloUrl: String(formData.get('zaloUrl') ?? ''),
    openingHours: parseOpeningHours(formData.get('openingHours')),
    isFeatured: formData.get('isFeatured') === 'on',
    sortOrder: String(formData.get('sortOrder') ?? '0')
  };
}

function throwCmsError(error: {code?: string; message?: string} | null) {
  if (!error) return;
  if (error.code === '23505') throw new Error('slug_conflict');
  if (error.code === '23514' && error.message?.includes('published_slug_immutable')) {
    throw new Error('published_slug_immutable');
  }
  throw error;
}

function revalidateLocations() {
  revalidatePath('/admin/catalog');
  revalidatePath('/admin/catalog/locations');
  revalidatePath('/');
  revalidatePath('/vi/dia-diem');
  revalidatePath('/en/locations');
}

async function recoverLocationConflict(id: string): Promise<AdminMutationResult> {
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('locations')
    .select('updated_at')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data?.updated_at) {
    return adminMutationFailure('Địa điểm này không còn tồn tại. Hãy tải lại trang để đồng bộ dữ liệu.');
  }
  return adminMutationConflict(data.updated_at);
}

export async function createLocation(formData: FormData) {
  const session = await requireAdminUser();
  const payload = prepareLocationCreate(session.role, inputFromFormData(formData));
  const supabase = await createSupabaseServerClient();
  const {error} = await supabase.from('locations').insert(payload);
  throwCmsError(error);
  revalidateLocations();
}

export async function updateLocation(formData: FormData): Promise<AdminMutationResult> {
  const id = String(formData.get('id') ?? '');

  try {
    const session = await requireAdminUser();
    const {id: preparedId, changes} = prepareLocationUpdate(
      session.role,
      id,
      inputFromFormData(formData)
    );
    const expectedUpdatedAt = requireExpectedUpdatedAt(formData.get('expectedUpdatedAt'));
    const supabase = await createSupabaseServerClient();
    const {data, error} = await supabase
      .from('locations')
      .update(changes)
      .eq('id', preparedId)
      .eq('updated_at', expectedUpdatedAt)
      .select('id')
      .maybeSingle();
    throwCmsError(error);
    assertFreshAdminWrite(data);
    revalidateLocations();
    return adminMutationSuccess();
  } catch (error) {
    if (!isStaleAdminWrite(error)) throw error;
    return recoverLocationConflict(id);
  }
}

export async function setLocationPublication(formData: FormData): Promise<AdminMutationResult> {
  const rawId = String(formData.get('id') ?? '');

  try {
    const session = await requireAdminUser();
    const {id, status} = prepareLocationPublication(
      session.role,
      rawId,
      String(formData.get('publish') ?? '') === 'true'
    );
    const expectedUpdatedAt = requireExpectedUpdatedAt(formData.get('expectedUpdatedAt'));
    const supabase = await createSupabaseServerClient();
    const {data, error} = await supabase
      .from('locations')
      .update({status})
      .eq('id', id)
      .eq('updated_at', expectedUpdatedAt)
      .select('id')
      .maybeSingle();
    throwCmsError(error);
    assertFreshAdminWrite(data);
    revalidateLocations();

    return adminMutationSuccess(
      status === 'active' && String(formData.get('next') ?? '') === 'media'
        ? '/admin/content/media?location=' + id
        : undefined
    );
  } catch (error) {
    if (!isStaleAdminWrite(error)) throw error;
    return recoverLocationConflict(rawId);
  }
}
