import type {MetadataRoute} from 'next';
import {getMarketingFeaturedLocation, getMarketingUnits} from '@/features/catalog/public-catalog';
import {absoluteUrl, buildSeoRoutePairs} from '@/features/seo/routes';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [units, location] = await Promise.all([
    getMarketingUnits('vi'),
    getMarketingFeaturedLocation('vi')
  ]);
  const routes = buildSeoRoutePairs({
    unitSlugs: units.map((unit) => unit.slug),
    locationSlugs: location ? [location.slug] : []
  });

  return routes.flatMap((route) => {
    const languages = {
      vi: absoluteUrl(route.vi),
      en: absoluteUrl(route.en)
    };
    return [
      {url: absoluteUrl(route.vi), alternates: {languages}},
      {url: absoluteUrl(route.en), alternates: {languages}}
    ];
  });
}
