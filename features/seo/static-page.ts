import type {Metadata} from 'next';
import {createLocalizedMetadata} from '@/features/seo/metadata';
import {getStaticSeoRoute} from '@/features/seo/routes';

type StaticPageCopy = {
  vi: {title: string; description: string};
  en: {title: string; description: string};
};

export async function createStaticPageMetadata(
  params: Promise<{locale: string}>,
  routeKey: string,
  copy: StaticPageCopy
): Promise<Metadata> {
  const {locale: rawLocale} = await params;
  const locale = rawLocale === 'en' ? 'en' : 'vi';
  return createLocalizedMetadata({
    route: getStaticSeoRoute(routeKey),
    locale,
    title: copy[locale].title,
    description: copy[locale].description
  });
}
