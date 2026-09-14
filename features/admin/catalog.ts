import {createSupabaseServerClient} from '@/lib/supabase/server';
import type {AvailabilityStatus, LocationStatus} from '@/types/database';

export type AdminLocationRow = {
  id: string;
  slug: string;
  nameVi: string;
  nameEn: string;
  district: string;
  status: LocationStatus;
  isFeatured: boolean;
  sortOrder: number;
};

export type AdminUnitRow = {
  id: string;
  slug: string;
  nameVi: string;
  nameEn: string;
  areaM2: number;
  active: boolean;
  sortOrder: number;
};

export type AdminPricingRow = {
  id: string;
  locationId: string;
  unitTypeId: string;
  monthlyPrice: number | null;
  promoPrice: number | null;
  depositAmount: number | null;
  availabilityStatus: AvailabilityStatus;
  availableCount: number | null;
  featured: boolean;
};

export type AdminCatalog = {
  locations: AdminLocationRow[];
  unitTypes: AdminUnitRow[];
  pricing: AdminPricingRow[];
};

const vnd = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
});

export function formatAdminPrice(value: number | null): string {
  return value == null ? 'Liên hệ' : vnd.format(value);
}

export function adminAvailabilityLabel(status: AvailabilityStatus): string {
  switch (status) {
    case 'available':
      return 'Có thể tư vấn';
    case 'limited':
      return 'Giới hạn';
    case 'sold_out':
      return 'Tạm hết';
    case 'contact':
      return 'Liên hệ xác nhận';
  }
}

export async function getAdminCatalog(): Promise<AdminCatalog> {
  const supabase = await createSupabaseServerClient();
  const [locationsResult, unitsResult, pricingResult] = await Promise.all([
    supabase
      .from('locations')
      .select('id, slug, name_vi, name_en, district, status, is_featured, sort_order')
      .order('sort_order', {ascending: true})
      .order('name_vi', {ascending: true}),
    supabase
      .from('unit_types')
      .select('id, slug, name_vi, name_en, area_m2, active, sort_order')
      .order('sort_order', {ascending: true})
      .order('area_m2', {ascending: true}),
    supabase
      .from('location_unit_types')
      .select('id, location_id, unit_type_id, monthly_price, promo_price, deposit_amount, availability_status, available_count, featured')
      .order('featured', {ascending: false})
  ]);

  const firstError = [locationsResult.error, unitsResult.error, pricingResult.error].find(Boolean);
  if (firstError) throw firstError;

  return {
    locations: (locationsResult.data ?? []).map((row) => ({
      id: row.id,
      slug: row.slug,
      nameVi: row.name_vi,
      nameEn: row.name_en,
      district: row.district,
      status: row.status,
      isFeatured: row.is_featured,
      sortOrder: row.sort_order
    })),
    unitTypes: (unitsResult.data ?? []).map((row) => ({
      id: row.id,
      slug: row.slug,
      nameVi: row.name_vi,
      nameEn: row.name_en,
      areaM2: row.area_m2,
      active: row.active,
      sortOrder: row.sort_order
    })),
    pricing: (pricingResult.data ?? []).map((row) => ({
      id: row.id,
      locationId: row.location_id,
      unitTypeId: row.unit_type_id,
      monthlyPrice: row.monthly_price,
      promoPrice: row.promo_price,
      depositAmount: row.deposit_amount,
      availabilityStatus: row.availability_status,
      availableCount: row.available_count,
      featured: row.featured
    }))
  };
}
