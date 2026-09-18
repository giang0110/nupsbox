import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
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
      <Section tone="soft" size="compact">
        <div className="max-w-3xl py-4 sm:py-6">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--nupsbox-blue)]">{vi ? 'ĐỊA ĐIỂM' : 'LOCATION'}</p>
          <h1 className="mt-4 text-5xl font-black tracking-[-0.045em] text-[var(--nupsbox-navy)] sm:text-6xl">{vi ? 'Địa điểm NupsBox' : 'NupsBox location'}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--nupsbox-slate)]">
            {vi
              ? 'NupsBox hiện giới thiệu một cơ sở đang hoạt động trên website. Trải nghiệm được thiết kế sẵn để mở rộng nhiều địa điểm khi có dữ liệu thực tế.'
              : 'NupsBox currently presents one operating location on the website. The experience is ready to expand when additional real locations exist.'}
          </p>
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow={vi ? 'CƠ SỞ HIỆN TẠI' : 'CURRENT FACILITY'}
          title={vi ? 'Một địa điểm, đầy đủ thông tin cần để ra quyết định.' : 'One location with the information you need to decide.'}
          description={vi
            ? 'Xem địa chỉ, các loại kho đang hiển thị và gửi yêu cầu xem kho theo đúng cơ sở.'
            : 'Review the address, listed unit types and request a viewing with the location context preserved.'}
        />
        <div className="mt-10 max-w-2xl"><LocationCard location={location} locale={rawLocale} /></div>
      </Section>
    </main>
  );
}
