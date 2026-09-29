import type {Metadata} from 'next';
import type {ReactNode} from 'react';
import {getCommercialContent, getCommercialFallback} from '@/features/content/commercial-content';
import {createLocalizedMetadata} from '@/features/seo/metadata';
import {getStaticSeoRoute} from '@/features/seo/routes';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale: rawLocale} = await params;
  const locale = rawLocale === 'en' ? 'en' : 'vi';
  const commercial = await getCommercialContent(locale).catch(() => getCommercialFallback(locale));
  const seo = commercial.pageSeo.about;
  return createLocalizedMetadata({
    route: getStaticSeoRoute('about'),
    locale,
    title: seo.title,
    description: seo.description
  });
}

export default function Layout({children}: {children: ReactNode}) {
  return children;
}
