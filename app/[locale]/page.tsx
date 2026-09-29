import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {Hero} from '@/components/marketing/hero';
import {HomeDecisionHub} from '@/components/marketing/home-decision-hub';
import {HomeInsights} from '@/components/marketing/home-insights';
import {FinalCta} from '@/components/marketing/final-cta';
import {isSupportedLocale} from '@/i18n/routing';
import {getMarketingFeaturedLocation, getMarketingUnits} from '@/features/catalog/public-catalog';
import {getPublishedBlogCards} from '@/features/content/blog';
import {getCommercialContent, getCommercialFallback} from '@/features/content/commercial-content';
import {selectHomepageUnits} from '@/features/home/content';
import {createLocalizedMetadata} from '@/features/seo/metadata';
import {getStaticSeoRoute} from '@/features/seo/routes';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale: rawLocale} = await params;
  const locale = rawLocale === 'en' ? 'en' : 'vi';
  const commercial = await getCommercialContent(locale).catch(() => null);
  return createLocalizedMetadata({
    route: getStaticSeoRoute('home'),
    locale,
    title: commercial?.seo.title ?? (locale === 'vi'
      ? 'Thông tin thương mại & giải pháp lưu trữ tại TP.HCM'
      : 'Commercial information & storage solutions in Ho Chi Minh City'),
    description: commercial?.seo.description ?? (locale === 'vi'
      ? 'Website thông tin thương mại của NupsBox: dịch vụ lưu trữ, cơ sở, hình ảnh thực tế, bài viết và kênh liên hệ tại TP.HCM.'
      : 'NupsBox commercial information website covering storage services, facilities, real imagery, articles and contact channels in Ho Chi Minh City.')
  });
}

export default async function HomePage({params}: {params: Promise<{locale: string}>}) {
  const {locale: rawLocale} = await params;
  if (!isSupportedLocale(rawLocale)) notFound();
  setRequestLocale(rawLocale);
  const locale = rawLocale;

  const [units, location, commercial, posts] = await Promise.all([
    getMarketingUnits(locale),
    getMarketingFeaturedLocation(locale),
    getCommercialContent(locale).catch(() => getCommercialFallback(locale)),
    getPublishedBlogCards(locale)
  ]);

  const featuredUnits = selectHomepageUnits(units).slice(0, 3);

  return (
    <main>
      <Hero
        locale={locale}
        location={location}
        units={featuredUnits}
        copy={commercial.companyProfile}
      />
      <HomeDecisionHub
        locale={locale}
        location={location}
        units={featuredUnits}
        commercial={commercial}
      />
      <HomeInsights locale={locale} posts={posts} />
      <FinalCta locale={locale} content={commercial.cta} />
    </main>
  );
}
