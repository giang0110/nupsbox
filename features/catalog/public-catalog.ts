import 'server-only';

import type {AppLocale} from '@/i18n/routing';
import {selectHomepageUnits} from '@/features/home/content';
import {isCatalogFixtureMode} from './public-catalog-mode';
import type {PublicLocation, PublicUnitType} from './types';
import {getActiveUnitTypes, getFeaturedLocation, getLocationBySlug, getUnitTypeBySlug} from './queries';

const fallbackUnits: PublicUnitType[] = [
  {
    id: 'verified-s',
    slug: 's',
    name: 'Kho S',
    areaM2: 1.64,
    recommendedFor: '',
    capacityNote: null,
    monthlyPrice: null,
    promoPrice: null,
    availabilityStatus: 'contact',
    availableCount: null,
    featured: true,
    sortOrder: 10
  },
  {
    id: 'verified-m',
    slug: 'm',
    name: 'Kho M',
    areaM2: 5.43,
    recommendedFor: '',
    capacityNote: null,
    monthlyPrice: null,
    promoPrice: null,
    availabilityStatus: 'contact',
    availableCount: null,
    featured: true,
    sortOrder: 20
  }
];

function localizedUnits(locale: AppLocale): PublicUnitType[] {
  return fallbackUnits.map((unit) => ({
    ...unit,
    name: locale === 'vi' ? `Kho ${unit.slug.toUpperCase()}` : `Storage ${unit.slug.toUpperCase()}`,
    recommendedFor: locale === 'vi'
      ? (unit.slug === 's' ? 'Shop online nhỏ, hàng mẫu và nhu cầu lưu trữ gọn.' : 'Doanh nghiệp nhỏ và lượng hàng cần thêm không gian.')
      : (unit.slug === 's' ? 'Small online shops, samples and compact storage needs.' : 'Small businesses and growing inventory needs.')
  }));
}

function fallbackLocation(locale: AppLocale): PublicLocation {
  return {
    id: 'verified-tan-phu',
    slug: 'tan-phu',
    name: locale === 'vi' ? 'NupsBox Tân Phú' : 'NupsBox Tan Phu',
    address: locale === 'vi'
      ? '1/1 Nguyễn Hữu Tiến, Tây Thạnh, Tân Phú, TP.HCM'
      : '1/1 Nguyen Huu Tien, Tay Thanh, Tan Phu, Ho Chi Minh City',
    district: locale === 'vi' ? 'Tân Phú' : 'Tan Phu',
    city: 'Ho Chi Minh City',
    latitude: null,
    longitude: null,
    phone: null,
    zaloUrl: null,
    openingHours: {},
    unitTypes: localizedUnits(locale)
  };
}

export async function getMarketingUnits(locale: AppLocale): Promise<PublicUnitType[]> {
  if (isCatalogFixtureMode()) return localizedUnits(locale);

  try {
    return await getActiveUnitTypes(locale);
  } catch {
    return [];
  }
}

export async function getMarketingFeaturedUnits(locale: AppLocale): Promise<PublicUnitType[]> {
  const units = await getMarketingUnits(locale);
  return selectHomepageUnits(units).slice(0, 3);
}

export async function getMarketingUnitBySlug(slug: string, locale: AppLocale): Promise<PublicUnitType | null> {
  if (isCatalogFixtureMode()) return localizedUnits(locale).find((unit) => unit.slug === slug) ?? null;

  try {
    return await getUnitTypeBySlug(slug, locale);
  } catch {
    return null;
  }
}

export async function getMarketingFeaturedLocation(locale: AppLocale): Promise<PublicLocation | null> {
  if (isCatalogFixtureMode()) return fallbackLocation(locale);

  try {
    return await getFeaturedLocation(locale);
  } catch {
    return null;
  }
}

export async function getMarketingLocationBySlug(slug: string, locale: AppLocale): Promise<PublicLocation | null> {
  if (isCatalogFixtureMode()) return slug === 'tan-phu' ? fallbackLocation(locale) : null;

  try {
    return await getLocationBySlug(slug, locale);
  } catch {
    return null;
  }
}
