import 'server-only';

import type {AppLocale} from '@/i18n/routing';
import type {PublicLocation, PublicUnitType} from './types';
import {
  readActiveUnitRowBySlug,
  readActiveUnitRows,
  readFeaturedLocationRow,
  readLocationRowBySlug,
  readPricingRows
} from './repository';

type LocationRow = NonNullable<Awaited<ReturnType<typeof readFeaturedLocationRow>>>;
type UnitRow = Awaited<ReturnType<typeof readActiveUnitRows>>[number];
type PricingRow = Awaited<ReturnType<typeof readPricingRows>>[number];

function localizeUnit(row: UnitRow, pricing: PricingRow | undefined, locale: AppLocale): PublicUnitType {
  return {
    id: row.id,
    slug: row.slug,
    name: locale === 'vi' ? row.name_vi : row.name_en,
    areaM2: Number(row.area_m2),
    recommendedFor: locale === 'vi' ? row.recommended_for_vi ?? '' : row.recommended_for_en ?? '',
    capacityNote: locale === 'vi' ? row.capacity_note_vi : row.capacity_note_en,
    monthlyPrice: pricing?.monthly_price === null || pricing?.monthly_price === undefined ? null : Number(pricing.monthly_price),
    promoPrice: pricing?.promo_price === null || pricing?.promo_price === undefined ? null : Number(pricing.promo_price),
    availabilityStatus: pricing?.availability_status ?? 'contact',
    availableCount: pricing?.available_count ?? null,
    featured: pricing?.featured ?? false,
    sortOrder: row.sort_order
  };
}

async function hydrateLocation(row: LocationRow, locale: AppLocale): Promise<PublicLocation> {
  const [unitRows, pricingRows] = await Promise.all([readActiveUnitRows(), readPricingRows(row.id)]);
  const pricingByUnit = new Map(pricingRows.map((pricing) => [pricing.unit_type_id, pricing]));

  return {
    id: row.id,
    slug: row.slug,
    name: locale === 'vi' ? row.name_vi : row.name_en,
    address: locale === 'vi' ? row.address_vi : row.address_en,
    district: row.district,
    city: row.city,
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
    phone: row.phone,
    zaloUrl: row.zalo_url,
    openingHours: (row.opening_hours ?? {}) as Record<string, unknown>,
    unitTypes: unitRows.map((unit) => localizeUnit(unit, pricingByUnit.get(unit.id), locale))
  };
}

export async function getFeaturedLocation(locale: AppLocale): Promise<PublicLocation | null> {
  const row = await readFeaturedLocationRow();
  return row ? hydrateLocation(row, locale) : null;
}

export async function getLocationBySlug(slug: string, locale: AppLocale): Promise<PublicLocation | null> {
  const row = await readLocationRowBySlug(slug);
  return row ? hydrateLocation(row, locale) : null;
}

export async function getActiveUnitTypes(locale: AppLocale): Promise<PublicUnitType[]> {
  const location = await readFeaturedLocationRow();
  const [unitRows, pricingRows] = await Promise.all([
    readActiveUnitRows(),
    location ? readPricingRows(location.id) : Promise.resolve([])
  ]);
  const pricingByUnit = new Map(pricingRows.map((pricing) => [pricing.unit_type_id, pricing]));
  return unitRows.map((unit) => localizeUnit(unit, pricingByUnit.get(unit.id), locale));
}

export async function getUnitTypeBySlug(slug: string, locale: AppLocale): Promise<PublicUnitType | null> {
  const [unit, location] = await Promise.all([readActiveUnitRowBySlug(slug), readFeaturedLocationRow()]);
  if (!unit) return null;
  const pricingRows = location ? await readPricingRows(location.id) : [];
  return localizeUnit(unit, pricingRows.find((pricing) => pricing.unit_type_id === unit.id), locale);
}
