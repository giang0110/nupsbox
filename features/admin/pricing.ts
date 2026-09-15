import {z} from 'zod';
import {PricingInputSchema, type PricingInput} from '@/features/admin/catalog-schemas';
import {requirePermission} from '@/features/admin/mutation-guard';
import type {AppRole, AvailabilityStatus} from '@/types/database';

const idSchema = z.string().uuid();

export type PricingDbRow = {
  id: string;
  location_id: string;
  unit_type_id: string;
  monthly_price: number | null;
  promo_price: number | null;
  deposit_amount: number | null;
  availability_status: AvailabilityStatus;
  available_count: number | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminPricing = {
  id: string;
  locationId: string;
  unitTypeId: string;
  monthlyPrice: number | null;
  promoPrice: number | null;
  depositAmount: number | null;
  availabilityStatus: AvailabilityStatus;
  availableCount: number | null;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};

export function mapAdminPricing(row: PricingDbRow): AdminPricing {
  return {
    id: row.id,
    locationId: row.location_id,
    unitTypeId: row.unit_type_id,
    monthlyPrice: row.monthly_price,
    promoPrice: row.promo_price,
    depositAmount: row.deposit_amount,
    availabilityStatus: row.availability_status,
    availableCount: row.available_count,
    featured: row.featured,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toPricingMutation(input: PricingInput) {
  return {
    location_id: input.locationId,
    unit_type_id: input.unitTypeId,
    monthly_price: input.monthlyPrice,
    promo_price: input.promoPrice,
    deposit_amount: input.depositAmount,
    availability_status: input.availabilityStatus,
    available_count: input.availableCount ?? null,
    featured: input.featured
  };
}

export function preparePricingCreate(role: AppRole, input: unknown) {
  requirePermission(role, 'catalog:create');
  return toPricingMutation(PricingInputSchema.parse(input));
}

export function preparePricingUpdate(role: AppRole, id: string, input: unknown) {
  requirePermission(role, 'catalog:update');
  return {id: idSchema.parse(id), changes: toPricingMutation(PricingInputSchema.parse(input))};
}

export async function listAdminPricing(): Promise<AdminPricing[]> {
  const {createSupabaseServerClient} = await import('@/lib/supabase/server');
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('location_unit_types')
    .select('*')
    .order('featured', {ascending: false})
    .order('updated_at', {ascending: false});
  if (error) throw error;
  return (data ?? []).map((row) => mapAdminPricing(row));
}
