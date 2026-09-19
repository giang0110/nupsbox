import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {PageIntro} from '@/components/ui/page-intro';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
import {LocationCard} from '@/components/locations/location-card';
import {WarehouseGallery} from '@/components/marketing/warehouse-gallery';
import {getMarketingFeaturedLocation} from '@/features/catalog/public-catalog';
import {getPublicLocationGallery} from '@/features/content/public-media';
import {isSupportedLocale} from '@/i18n/routing';
import {createStaticPageMetadata} from '@/features/seo/static-page';

export function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  return createStaticPageMetadata(params, 'locations', {
    vi: {
      title: 'Địa điểm NupsBox',
      description: 'Xem thông tin cơ sở NupsBox đang được xác nhận và công bố trên website.'
    },
    en: {
      title: 'NupsBox locations',
      description: 'View NupsBox facility information that is currently verified and published on the website.'
    }
  });
}

export default async function LocationsPage({params}: {params: Promise<{locale: string}>}) {
  const {locale: rawLocale} = await params;
  if (!isSupportedLocale(rawLocale)) notFound();
  setRequestLocale(rawLocale);
  const location = await getMarketingFeaturedLocation(rawLocale);
  const galleryItems = location ? await getPublicLocationGallery(location.id, rawLocale) : [];
  const vi = rawLocale === 'vi';

  return (
    <main>
      <PageIntro
        eyebrow={vi ? 'ĐỊA ĐIỂM' : 'LOCATION'}
        title={vi ? 'Địa điểm NupsBox' : 'NupsBox location'}
        description={location
          ? (vi
              ? 'Xem thông tin cơ sở hiện đang được NupsBox công bố trên website.'
              : 'View the facility information currently published by NupsBox.')
          : (vi
              ? 'Thông tin cơ sở sẽ chỉ hiển thị sau khi được NupsBox xác nhận và công bố.'
              : 'Facility details appear only after NupsBox has verified and published them.')}
      />

      {galleryItems.length ? (
        <WarehouseGallery locale={rawLocale} items={galleryItems} />
      ) : null}

      {location ? (
        <Section tone={galleryItems.length ? 'soft' : 'white'}>
          <div className="grid items-start gap-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-12">
            <SectionHeading
              eyebrow={vi ? 'CƠ SỞ HIỆN TẠI' : 'CURRENT FACILITY'}
              title={vi ? 'Thông tin đang được công bố.' : 'Currently published facility details.'}
              description={vi
                ? 'Xem địa chỉ, các loại kho đang hiển thị và gửi yêu cầu xem kho theo đúng cơ sở.'
                : 'Review the published address and unit types, then request a viewing with the location context preserved.'}
            />
            <LocationCard location={location} locale={rawLocale} />
          </div>
        </Section>
      ) : (
        <Section>
          <div
            className="rounded-3xl border border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] p-6 sm:p-8"
            role="status"
          >
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--nupsbox-blue)]">
              {vi ? 'CHƯA CÔNG BỐ' : 'NOT YET PUBLISHED'}
            </p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.03em] text-[var(--nupsbox-navy)]">
              {vi ? 'Thông tin cơ sở đang được cập nhật.' : 'Facility information is being updated.'}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--nupsbox-slate)]">
              {vi
                ? 'Website chưa công bố địa chỉ hoặc thông tin cơ sở chưa được xác nhận. Bạn vẫn có thể gửi nhu cầu để NupsBox liên hệ tư vấn.'
                : 'No verified facility address is currently published. You can still send your requirements and ask NupsBox to contact you.'}
            </p>
            <Link
              href="/lien-he"
              className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[var(--nupsbox-blue)] px-5 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nupsbox-blue)] focus-visible:ring-offset-2"
            >
              {vi ? 'Liên hệ NupsBox' : 'Contact NupsBox'}
            </Link>
          </div>
        </Section>
      )}
    </main>
  );
}
