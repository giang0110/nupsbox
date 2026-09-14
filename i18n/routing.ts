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
    '/kho-mini': {vi: '/kho-mini', en: '/mini-storage'},
    '/kho-mini/[slug]': {vi: '/kho-mini/[slug]', en: '/mini-storage/[slug]'},
    '/bang-gia': {vi: '/bang-gia', en: '/pricing'},
    '/dia-diem': {vi: '/dia-diem', en: '/locations'},
    '/dia-diem/[slug]': {vi: '/dia-diem/[slug]', en: '/locations/[slug]'},
    '/giai-phap': {vi: '/giai-phap', en: '/solutions'},
    '/giai-phap/shop-online': {vi: '/giai-phap/shop-online', en: '/solutions/online-sellers'},
    '/giai-phap/doanh-nghiep-nho': {vi: '/giai-phap/doanh-nghiep-nho', en: '/solutions/small-business'},
    '/giai-phap/chua-hang': {vi: '/giai-phap/chua-hang', en: '/solutions/inventory-storage'},
    '/giai-phap/ca-nhan': {vi: '/giai-phap/ca-nhan', en: '/solutions/personal-storage'},
    '/cach-thue': {vi: '/cach-thue', en: '/how-it-works'},
    '/ve-nupsbox': {vi: '/ve-nupsbox', en: '/about-nupsbox'},
    '/cau-hoi-thuong-gap': {vi: '/cau-hoi-thuong-gap', en: '/faq'},
    '/lien-he': {vi: '/lien-he', en: '/contact'},
    '/dat-kho': {vi: '/dat-kho', en: '/book-storage'},
    '/blog': '/blog'
  }
});
