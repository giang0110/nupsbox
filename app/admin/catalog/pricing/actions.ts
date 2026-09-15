'use server';

import {revalidatePath} from 'next/cache';
import {preparePricingCreate, preparePricingUpdate} from '@/features/admin/pricing';
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

export async function createPricing(formData: FormData) {
  const session = await requireAdminUser();
  const payload = preparePricingCreate(session.role, inputFromFormData(formData));
  const supabase = await createSupabaseServerClient();
  const {error} = await supabase.from('location_unit_types').insert(payload);
  throwPricingError(error);
  revalidatePricing();
}

export async function updatePricing(formData: FormData) {
  const session = await requireAdminUser();
  const {id, changes} = preparePricingUpdate(
    session.role,
    String(formData.get('id') ?? ''),
    inputFromFormData(formData)
  );
  const supabase = await createSupabaseServerClient();
  const {error} = await supabase.from('location_unit_types').update(changes).eq('id', id);
  throwPricingError(error);
  revalidatePricing();
}
