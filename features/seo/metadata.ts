import type {Metadata} from 'next';
import {routeAlternates, type SeoRoutePair} from '@/features/seo/routes';

export function createLocalizedMetadata({
  route,
  locale,
  title,
  description,
  index = true
}: {
  route: SeoRoutePair;
  locale: 'vi' | 'en';
  title: string;
  description: string;
  index?: boolean;
}): Metadata {
  const alternates = routeAlternates(route, locale);
  return {
    title,
    description,
    alternates,
    robots: index ? {index: true, follow: true} : {index: false, follow: true},
    openGraph: {
      type: 'website',
      title,
      description,
      url: alternates.canonical,
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
      alternateLocale: locale === 'vi' ? ['en_US'] : ['vi_VN'],
      siteName: 'NupsBox'
    },
    twitter: {
      card: 'summary',
      title,
      description
    }
  };
}
