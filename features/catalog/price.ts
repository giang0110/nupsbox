import type {AppLocale} from '@/i18n/routing';

export function formatMonthlyPrice(price: number | null, locale: AppLocale): string | null {
  if (price === null) return null;

  return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(price);
}
