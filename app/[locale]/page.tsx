import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {Hero} from '@/components/marketing/hero';
import {HomeChoiceHub} from '@/components/marketing/home-choice-hub';
import {HomeProofBento} from '@/components/marketing/home-proof-bento';
import {HomeLocationJourney} from '@/components/marketing/home-location-journey';
import {HomeFaq} from '@/components/marketing/home-faq';
import {FinalCta} from '@/components/marketing/final-cta';
import {isSupportedLocale} from '@/i18n/routing';
import {getMarketingFeaturedLocation, getMarketingUnits} from '@/features/catalog/public-catalog';
import {getMarketingFaqs} from '@/features/content/faqs';
import {selectHomepageUnits} from '@/features/home/content';
import {createLocalizedMetadata} from '@/features/seo/metadata';
import {getStaticSeoRoute} from '@/features/seo/routes';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale: rawLocale} = await params;
  const locale = rawLocale === 'en' ? 'en' : 'vi';
  return createLocalizedMetadata({
    route: getStaticSeoRoute('home'),
    locale,
    title: locale === 'vi' ? 'Kho mini cho kinh doanh tại TP.HCM' : 'Mini storage for business in Ho Chi Minh City',
    description: locale === 'vi'
      ? 'Kho mini linh hoạt cho shop online, doanh nghiệp nhỏ và cá nhân tại TP.HCM. Tìm loại kho phù hợp và gửi yêu cầu báo giá cho NupsBox.'
      : 'Flexible mini storage for online sellers, small businesses and individuals in Ho Chi Minh City. Find a suitable unit and request a quote from NupsBox.'
  });
}

export default async function HomePage({params}: {params: Promise<{locale: string}>}) {
  const {locale: rawLocale} = await params;
  if (!isSupportedLocale(rawLocale)) notFound();
  setRequestLocale(rawLocale);
  const locale = rawLocale;

  const [units, location, faqs] = await Promise.all([
    getMarketingUnits(locale),
    getMarketingFeaturedLocation(locale),
    getMarketingFaqs(locale)
  ]);

  const finderUnits = units.map(({id, slug, name, areaM2, sortOrder}) => ({
    id,
    slug,
    name,
    areaM2,
    sortOrder
  }));
  const featuredUnits = selectHomepageUnits(units).slice(0, 3);

  return (
    <main>
      <Hero locale={locale} />
      <HomeChoiceHub units={featuredUnits} finderUnits={finderUnits} locale={locale} />
      <HomeProofBento locale={locale} />
      <HomeLocationJourney location={location} locale={locale} />
      <HomeFaq items={faqs} locale={locale} />
      <FinalCta locale={locale} />
    </main>
  );
}
