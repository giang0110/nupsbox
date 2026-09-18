import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {MapPin} from 'lucide-react';
import {PageIntro} from '@/components/ui/page-intro';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
import {JsonLd} from '@/components/seo/json-ld';
import {UnitCard} from '@/components/units/unit-card';
import {ConversionCta} from '@/components/marketing/conversion-cta';
import {getMarketingLocationBySlug} from '@/features/catalog/public-catalog';
import {createLocalizedMetadata} from '@/features/seo/metadata';
import {absoluteUrl, getStaticSeoRoute, locationSeoRoute} from '@/features/seo/routes';
import {isSupportedLocale} from '@/i18n/routing';

export async function generateMetadata({params}: {params: Promise<{locale: string; slug: string}>}): Promise<Metadata> {
  const {locale: rawLocale, slug} = await params;
  if (!isSupportedLocale(rawLocale)) notFound();
  const location = await getMarketingLocationBySlug(slug, rawLocale);
  if (!location) notFound();
  const vi = rawLocale === 'vi';

  return createLocalizedMetadata({
    route: locationSeoRoute(slug),
    locale: rawLocale,
    title: location.name,
    description: vi
      ? `${location.name} tại ${location.address}. Xem các loại kho mini đang được giới thiệu và liên hệ NupsBox để xác nhận giá, tình trạng phù hợp.`
      : `${location.name} at ${location.address}. Explore listed mini storage sizes and contact NupsBox to confirm current pricing and suitability.`
  });
}

export default async function LocationDetailPage({params}: {params: Promise<{locale: string; slug: string}>}) {
  const {locale: rawLocale, slug} = await params;
  if (!isSupportedLocale(rawLocale)) notFound();
  setRequestLocale(rawLocale);
  const location = await getMarketingLocationBySlug(slug, rawLocale);
  if (!location) notFound();

  const vi = rawLocale === 'vi';
  const homeRoute = getStaticSeoRoute('home');
  const locationsRoute = getStaticSeoRoute('locations');
  const detailRoute = locationSeoRoute(slug);
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {'@type': 'ListItem', position: 1, name: vi ? 'Trang chủ' : 'Home', item: absoluteUrl(homeRoute[rawLocale])},
      {'@type': 'ListItem', position: 2, name: vi ? 'Địa điểm' : 'Locations', item: absoluteUrl(locationsRoute[rawLocale])},
      {'@type': 'ListItem', position: 3, name: location.name, item: absoluteUrl(detailRoute[rawLocale])}
    ]
  };

  return (
    <main>
      <JsonLd data={breadcrumb} />
      <PageIntro
        tone="navy"
        eyebrow={vi ? 'CƠ SỞ NUPSBOX' : 'NUPSBOX FACILITY'}
        title={location.name}
        description={vi
          ? 'Kho mini linh hoạt cho shop online, doanh nghiệp nhỏ và nhu cầu lưu trữ cá nhân.'
          : 'Flexible mini storage for online sellers, small businesses and personal storage needs.'}
      >
        <p className="flex min-h-11 items-center gap-2 text-sm text-white/68">
          <MapPin size={17} aria-hidden="true" />
          {location.address}
        </p>
        <ConversionCta
          locale={rawLocale}
          intent="viewing"
          context={{locationSlug: location.slug, locationId: location.id}}
          placement="location-detail-hero"
          size="lg"
        >
          {vi ? 'Đặt lịch xem kho' : 'Request a viewing'}
        </ConversionCta>
      </PageIntro>

      <Section>
        <SectionHeading
          eyebrow={vi ? 'LOẠI KHO TẠI CƠ SỞ' : 'UNITS AT THIS LOCATION'}
          title={vi ? 'Chọn điểm bắt đầu phù hợp.' : 'Choose a practical starting point.'}
          description={vi
            ? 'Tình trạng và giá vẫn cần được NupsBox xác nhận theo thời điểm; các thẻ không phải cam kết giữ chỗ.'
            : 'Pricing and status still require confirmation; these cards do not represent a reservation.'}
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {location.unitTypes.map((unit) => <UnitCard key={unit.id} unit={unit} locale={rawLocale} />)}
        </div>
      </Section>
    </main>
  );
}
