import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {PageIntro} from '@/components/ui/page-intro';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
import {LocationCard} from '@/components/locations/location-card';
import {getMarketingFeaturedLocation} from '@/features/catalog/public-catalog';
import {isSupportedLocale} from '@/i18n/routing';

export default async function LocationsPage({params}: {params: Promise<{locale: string}>}) {
  const {locale: rawLocale} = await params;
  if (!isSupportedLocale(rawLocale)) notFound();
  setRequestLocale(rawLocale);
  const location = await getMarketingFeaturedLocation(rawLocale);
  const vi = rawLocale === 'vi';

  return (
    <main>
      <PageIntro
        eyebrow={vi ? 'ĐỊA ĐIỂM' : 'LOCATION'}
        title={vi ? 'Địa điểm NupsBox' : 'NupsBox location'}
        description={vi
          ? 'NupsBox hiện giới thiệu một cơ sở đang hoạt động trên website. Trải nghiệm được thiết kế sẵn để mở rộng nhiều địa điểm khi có dữ liệu thực tế.'
          : 'NupsBox currently presents one operating location on the website. The experience is ready to expand when additional real locations exist.'}
      />

      <Section>
        <div className="grid items-start gap-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-12">
          <SectionHeading
            eyebrow={vi ? 'CƠ SỞ HIỆN TẠI' : 'CURRENT FACILITY'}
            title={vi ? 'Một địa điểm, đầy đủ thông tin cần để ra quyết định.' : 'One location with the information you need to decide.'}
            description={vi
              ? 'Xem địa chỉ, các loại kho đang hiển thị và gửi yêu cầu xem kho theo đúng cơ sở.'
              : 'Review the address, listed unit types and request a viewing with the location context preserved.'}
          />
          <LocationCard location={location} locale={rawLocale} />
        </div>
      </Section>
    </main>
  );
}
