const configuredSiteOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nupsbox.vercel.app';

export const SITE_ORIGIN = new URL(configuredSiteOrigin).origin;

export type SeoRoutePair = {
  key: string;
  vi: string;
  en: string;
};

type DynamicRouteInput = {
  unitSlugs?: string[];
  locationSlugs?: string[];
};

const staticRoutes: SeoRoutePair[] = [
  {key: 'home', vi: '/', en: '/en'},
  {key: 'units', vi: '/kho-mini', en: '/en/mini-storage'},
  {key: 'pricing', vi: '/bang-gia', en: '/en/pricing'},
  {key: 'locations', vi: '/dia-diem', en: '/en/locations'},
  {key: 'solutions', vi: '/giai-phap', en: '/en/solutions'},
  {key: 'solution:shop-online', vi: '/giai-phap/shop-online', en: '/en/solutions/online-sellers'},
  {key: 'solution:small-business', vi: '/giai-phap/doanh-nghiep-nho', en: '/en/solutions/small-business'},
  {key: 'solution:inventory', vi: '/giai-phap/chua-hang', en: '/en/solutions/inventory-storage'},
  {key: 'solution:personal', vi: '/giai-phap/ca-nhan', en: '/en/solutions/personal-storage'},
  {key: 'how-it-works', vi: '/cach-thue', en: '/en/how-it-works'},
  {key: 'about', vi: '/ve-nupsbox', en: '/en/about-nupsbox'},
  {key: 'faq', vi: '/cau-hoi-thuong-gap', en: '/en/faq'},
  {key: 'blog', vi: '/blog', en: '/en/blog'},
  {key: 'contact', vi: '/lien-he', en: '/en/contact'}
];

function uniqueSlugs(values: string[] | undefined): string[] {
  return [...new Set((values ?? []).map((value) => value.trim()).filter(Boolean))].sort();
}

export function unitSeoRoute(slug: string): SeoRoutePair {
  const encoded = encodeURIComponent(slug);
  return {key: `unit:${slug}`, vi: `/kho-mini/${encoded}`, en: `/en/mini-storage/${encoded}`};
}

export function locationSeoRoute(slug: string): SeoRoutePair {
  const encoded = encodeURIComponent(slug);
  return {key: `location:${slug}`, vi: `/dia-diem/${encoded}`, en: `/en/locations/${encoded}`};
}

export function getStaticSeoRoute(key: string): SeoRoutePair {
  const route = staticRoutes.find((item) => item.key === key);
  if (!route) throw new Error(`unknown_seo_route:${key}`);
  return route;
}

export function buildSeoRoutePairs(input: DynamicRouteInput = {}): SeoRoutePair[] {
  const unitRoutes = uniqueSlugs(input.unitSlugs).map(unitSeoRoute);
  const locationRoutes = uniqueSlugs(input.locationSlugs).map(locationSeoRoute);
  return [...staticRoutes, ...unitRoutes, ...locationRoutes];
}

export function absoluteUrl(pathname: string): string {
  return new URL(pathname, SITE_ORIGIN).toString();
}

export function routeAlternates(route: SeoRoutePair, locale: 'vi' | 'en') {
  return {
    canonical: absoluteUrl(route[locale]),
    languages: {
      'vi-VN': absoluteUrl(route.vi),
      en: absoluteUrl(route.en),
      'x-default': absoluteUrl(route.vi)
    }
  };
}
