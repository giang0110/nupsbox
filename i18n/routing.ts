import {defineRouting} from 'next-intl/routing';

export const locales = ['vi', 'en'] as const;
export type AppLocale = (typeof locales)[number];
export const defaultLocale: AppLocale = 'vi';
export const isSupportedLocale = (value: string): value is AppLocale =>
  locales.includes(value as AppLocale);

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
  pathnames: {
    '/': '/',
    '/kho-mini': {
      vi: '/kho-mini',
      en: '/mini-storage'
    },
    '/bang-gia': {
      vi: '/bang-gia',
      en: '/pricing'
    },
    '/dia-diem': {
      vi: '/dia-diem',
      en: '/locations'
    },
    '/giai-phap': {
      vi: '/giai-phap',
      en: '/solutions'
    },
    '/ve-nupsbox': {
      vi: '/ve-nupsbox',
      en: '/about-nupsbox'
    },
    '/lien-he': {
      vi: '/lien-he',
      en: '/contact'
    }
  }
});
