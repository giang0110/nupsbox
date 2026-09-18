import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {Hero} from '@/components/marketing/hero';
import {FeaturedUnits} from '@/components/marketing/featured-units';
import {UseCases} from '@/components/marketing/use-cases';
import {CostComparison} from '@/components/marketing/cost-comparison';
import {Gallery} from '@/components/marketing/gallery';
import {SecurityBenefits} from '@/components/marketing/security-benefits';
import {HowItWorks} from '@/components/marketing/how-it-works';
import {SocialProof} from '@/components/marketing/social-proof';
import {HomeFaq} from '@/components/marketing/home-faq';
import {FinalCta} from '@/components/marketing/final-cta';
import {StorageFinder} from '@/components/storage-finder/storage-finder';
import {LocationCard} from '@/components/locations/location-card';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
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
  const finderUnits = units.map(({id, slug, name, areaM2, sortOrder}) => ({id, slug, name, areaM2, sortOrder}));
  const featuredUnits = selectHomepageUnits(units).slice(0, 3);
  const vi = locale === 'vi';

  return (
    <main>
      <Hero locale={locale} />

      <Section tone="soft" size="compact">
        <div id="storage-finder" className="scroll-mt-24">
          <StorageFinder units={finderUnits} />
        </div>
      </Section>

      <FeaturedUnits units={featuredUnits} locale={locale} />
      <UseCases locale={locale} />
      <Gallery locale={locale} />
      <SecurityBenefits locale={locale} />
      <CostComparison locale={locale} />

      {location ? (
        <Section>
          <div className="grid items-start gap-10 lg:grid-cols-[.85fr_1.15fr] lg:gap-14">
            <SectionHeading
              eyebrow={vi ? 'ĐỊA ĐIỂM' : 'LOCATION'}
              title={vi ? 'Xem không gian trước khi quyết định.' : 'See the space before you decide.'}
              description={vi
                ? 'Tìm hiểu cơ sở đang hiển thị, các loại kho tại đó và gửi yêu cầu xem kho khi bạn sẵn sàng.'
                : 'Explore the listed facility, its unit options, and request a viewing when you are ready.'}
            />
            <LocationCard location={location} locale={locale} />
          </div>
        </Section>
      ) : null}

      <HowItWorks locale={locale} />
      <SocialProof locale={locale} />
      <HomeFaq items={faqs} locale={locale} />
      <FinalCta locale={locale} />
    </main>
  );
}
