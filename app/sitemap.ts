import type {MetadataRoute} from 'next';
import {getMarketingLocationSlugs, getMarketingUnits} from '@/features/catalog/public-catalog';
import {getPublishedBlogSlugs} from '@/features/content/blog';
import {absoluteUrl, buildSeoRoutePairs} from '@/features/seo/routes';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [units, locationSlugs, blogSlugs] = await Promise.all([
    getMarketingUnits('vi'),
    getMarketingLocationSlugs(),
    getPublishedBlogSlugs()
  ]);
  const routes = buildSeoRoutePairs({
    unitSlugs: units.map((unit) => unit.slug),
    locationSlugs,
    blogSlugs
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
