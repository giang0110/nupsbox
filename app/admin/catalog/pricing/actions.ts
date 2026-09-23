'use server';

import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {preparePricingCreate, preparePricingUpdate} from '@/features/admin/pricing';
import {adminMutationConflict, adminMutationFailure, adminMutationSuccess, type AdminMutationResult} from '@/features/admin/action-result';
import {assertFreshAdminWrite, isStaleAdminWrite, requireExpectedUpdatedAt} from '@/features/admin/optimistic-concurrency';
import {requireAdminUser} from '@/features/auth/require-admin-user';
import {createSupabaseServerClient} from '@/lib/supabase/server';

function inputFromFormData(formData: FormData) {
  return {
    locationId: String(formData.get('locationId') ?? ''),
    unitTypeId: String(formData.get('unitTypeId') ?? ''),
    monthlyPrice: String(formData.get('monthlyPrice') ?? ''),
    promoPrice: String(formData.get('promoPrice') ?? ''),
    depositAmount: String(formData.get('depositAmount') ?? ''),
    availabilityStatus: String(formData.get('availabilityStatus') ?? 'contact'),
    availableCount: String(formData.get('availableCount') ?? ''),
    featured: formData.get('featured') === 'on'
  };
}

function throwPricingError(error: {code?: string} | null) {
  if (!error) return;
  if (error.code === '23505') throw new Error('pricing_conflict');
  throw error;
}

function revalidatePricing() {
  revalidatePath('/admin/catalog');
  revalidatePath('/admin/catalog/pricing');
  revalidatePath('/');
  revalidatePath('/vi/bang-gia');
  revalidatePath('/en/pricing');
}

async function recoverPricingConflict(id: string): Promise<AdminMutationResult> {
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('location_unit_types')
    .select('updated_at')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data?.updated_at) {
    return adminMutationFailure('Cấu hình giá này không còn tồn tại. Hãy tải lại trang để đồng bộ dữ liệu.');
  }
  return adminMutationConflict(data.updated_at);
}

export async function createPricing(formData: FormData) {
  const session = await requireAdminUser();
  const payload = preparePricingCreate(session.role, inputFromFormData(formData));
  const supabase = await createSupabaseServerClient();
  const {data: existing, error: lookupError} = await supabase
    .from('location_unit_types')
    .select('id')
    .eq('location_id', payload.location_id)
    .eq('unit_type_id', payload.unit_type_id)
    .maybeSingle();
  throwPricingError(lookupError);
  if (existing) throw new Error('pricing_conflict');

  const {error} = await supabase.from('location_unit_types').insert(payload);
  throwPricingError(error);
  revalidatePricing();

  if (String(formData.get('next') ?? '') === 'preview') {
    redirect('/bang-gia');
  }
}

export async function updatePricing(formData: FormData): Promise<AdminMutationResult> {
  const id = String(formData.get('id') ?? '');

  try {
    const session = await requireAdminUser();
    const {id: preparedId, changes} = preparePricingUpdate(
      session.role,
      id,
      inputFromFormData(formData)
    );
    const expectedUpdatedAt = requireExpectedUpdatedAt(formData.get('expectedUpdatedAt'));
    const supabase = await createSupabaseServerClient();
    const {data, error} = await supabase
      .from('location_unit_types')
      .update(changes)
      .eq('id', preparedId)
      .eq('updated_at', expectedUpdatedAt)
      .select('id')
      .maybeSingle();
    throwPricingError(error);
    assertFreshAdminWrite(data);
    revalidatePricing();

    return adminMutationSuccess(
      String(formData.get('next') ?? '') === 'preview' ? '/bang-gia' : undefined
    );
  } catch (error) {
    if (!isStaleAdminWrite(error)) throw error;
    return recoverPricingConflict(id);
  }
}
