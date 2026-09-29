import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {Hero} from '@/components/marketing/hero';
import {CommercialOverview} from '@/components/marketing/commercial-overview';
import {HomeProofBento} from '@/components/marketing/home-proof-bento';
import {HomeLocationJourney} from '@/components/marketing/home-location-journey';
import {HomeFaq} from '@/components/marketing/home-faq';
import {FinalCta} from '@/components/marketing/final-cta';
import {WarehouseGallery} from '@/components/marketing/warehouse-gallery';
import {isSupportedLocale} from '@/i18n/routing';
import {getMarketingFeaturedLocation, getMarketingUnits} from '@/features/catalog/public-catalog';
import {getMarketingFaqs} from '@/features/content/faqs';
import {getPublicLocationGallery} from '@/features/content/public-media';
import {getCommercialContent} from '@/features/content/commercial-content';
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

  const [units, location, faqs, commercial] = await Promise.all([
    getMarketingUnits(locale),
    getMarketingFeaturedLocation(locale),
    getMarketingFaqs(locale),
    getCommercialContent(locale)
  ]);

  const featuredUnits = selectHomepageUnits(units).slice(0, 3);
  const galleryItems = location
    ? await getPublicLocationGallery(location.id, locale)
    : [];

  return (
    <main>
      <Hero
        locale={locale}
        location={location}
        units={featuredUnits}
        hasGallery={galleryItems.length > 0}
        copy={commercial.companyProfile}
      />
      <CommercialOverview locale={locale} services={commercial.services} capabilities={commercial.capabilities} />
      <WarehouseGallery locale={locale} items={galleryItems} />
      <HomeProofBento locale={locale} location={location} units={featuredUnits} content={commercial.capabilities} />
      <HomeLocationJourney location={location} locale={locale} />
      <HomeFaq items={faqs} locale={locale} />
      <FinalCta locale={locale} content={commercial.cta} />
    </main>
  );
}
