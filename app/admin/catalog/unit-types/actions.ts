'use server';

import {revalidatePath} from 'next/cache';
import {
  prepareUnitTypeCreate,
  prepareUnitTypePublication,
  prepareUnitTypeUpdate
} from '@/features/admin/unit-types';
import {requireAdminUser} from '@/features/auth/require-admin-user';
import {createSupabaseServerClient} from '@/lib/supabase/server';

function inputFromFormData(formData: FormData) {
  return {
    slug: String(formData.get('slug') ?? ''),
    nameVi: String(formData.get('nameVi') ?? ''),
    nameEn: String(formData.get('nameEn') ?? ''),
    areaM2: String(formData.get('areaM2') ?? ''),
    recommendedForVi: String(formData.get('recommendedForVi') ?? ''),
    recommendedForEn: String(formData.get('recommendedForEn') ?? ''),
    capacityNoteVi: String(formData.get('capacityNoteVi') ?? ''),
    capacityNoteEn: String(formData.get('capacityNoteEn') ?? ''),
    sortOrder: String(formData.get('sortOrder') ?? '0')
  };
}

function throwUnitError(error: {code?: string; message?: string} | null) {
  if (!error) return;
  if (error.code === '23505') throw new Error('slug_conflict');
  if (error.code === '23514' && error.message?.includes('published_slug_immutable')) {
    throw new Error('published_slug_immutable');
  }
  throw error;
}

function revalidateUnits() {
  revalidatePath('/admin/catalog');
  revalidatePath('/admin/catalog/unit-types');
  revalidatePath('/');
  revalidatePath('/vi/kho-mini');
  revalidatePath('/en/mini-storage');
}

export async function createUnitType(formData: FormData) {
  const session = await requireAdminUser();
  const payload = prepareUnitTypeCreate(session.role, inputFromFormData(formData));
  const supabase = await createSupabaseServerClient();
  const {error} = await supabase.from('unit_types').insert(payload);
  throwUnitError(error);
  revalidateUnits();
}

export async function updateUnitType(formData: FormData) {
  const session = await requireAdminUser();
  const {id, changes} = prepareUnitTypeUpdate(
    session.role,
    String(formData.get('id') ?? ''),
    inputFromFormData(formData)
  );
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase.from('unit_types').update(changes).eq('id', id).select('id').single();
  throwUnitError(error);
  if (!data) throw new Error('unit_type_update_noop');
  revalidateUnits();
}

export async function setUnitTypePublication(formData: FormData) {
  const session = await requireAdminUser();
  const {id, active} = prepareUnitTypePublication(
    session.role,
    String(formData.get('id') ?? ''),
    String(formData.get('publish') ?? '') === 'true'
  );
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase.from('unit_types').update({active}).eq('id', id).select('id').single();
  throwUnitError(error);
  if (!data) throw new Error('unit_type_publication_noop');
  revalidateUnits();
}
