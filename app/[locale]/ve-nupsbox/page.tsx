import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {WarehouseGallery} from '@/components/marketing/warehouse-gallery';
import {FinalCta} from '@/components/marketing/final-cta';
import {PageIntro} from '@/components/ui/page-intro';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
import {isSupportedLocale} from '@/i18n/routing';
import {getMarketingFeaturedLocation} from '@/features/catalog/public-catalog';
import {getPublicLocationGallery} from '@/features/content/public-media';
import {getPublicSiteSettings} from '@/features/content/site-settings';
import {createStaticPageMetadata} from '@/features/seo/static-page';

export function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  return createStaticPageMetadata(params, 'about', {
    vi: {
      title: 'Về NupsBox',
      description: 'Tìm hiểu NupsBox, định hướng dịch vụ lưu trữ và cách website công bố thông tin thương mại, cơ sở và kênh liên hệ.'
    },
    en: {
      title: 'About NupsBox',
      description: 'Learn about NupsBox, its storage-service focus and how the website publishes commercial, facility and contact information.'
    }
  });
}

export default async function Page({params}: {params: Promise<{locale:string}>}) {
  const {locale} = await params;
  if (!isSupportedLocale(locale)) notFound();
  setRequestLocale(locale);
  const vi = locale === 'vi';
  const [location, settings] = await Promise.all([
    getMarketingFeaturedLocation(locale),
    getPublicSiteSettings().catch(() => ({phone: null, zaloUrl: null, email: null, facebookUrl: null, openingHours: {}}))
  ]);
  const galleryItems = location ? await getPublicLocationGallery(location.id, locale) : [];

  return (
    <main>
      <PageIntro
        tone="navy"
        eyebrow="SAVE SPACE. LIVE LARGE."
        title={vi ? 'NupsBox — dịch vụ lưu trữ với thông tin rõ ràng.' : 'NupsBox — storage services with clear information.'}
        description={vi
          ? 'NupsBox cung cấp thông tin về giải pháp lưu trữ, cơ sở và kênh liên hệ cho khách hàng có nhu cầu tại TP.HCM.'
          : 'NupsBox publishes information about storage solutions, facilities and contact channels for customers in Ho Chi Minh City.'}
      />

      <Section>
        <SectionHeading
          eyebrow={vi ? 'CÁCH NUPSBOX CÔNG BỐ THÔNG TIN' : 'HOW NUPSBOX PUBLISHES INFORMATION'}
          title={vi ? 'Thông tin trước, trao đổi sau.' : 'Information first, conversation next.'}
          description={vi
            ? 'Website chỉ hiển thị loại kho, giá và thông tin vận hành khi có dữ liệu tương ứng; những gì cần xác nhận sẽ được ghi rõ là cần xác nhận.'
            : 'The website displays unit, pricing and operational details only when the corresponding data exists; anything requiring confirmation is labeled accordingly.'}
        />
      </Section>

      <WarehouseGallery locale={locale} items={galleryItems} />

      {settings.facebookUrl ? (
        <Section tone="soft" size="compact">
          <div className="flex flex-col gap-4 rounded-[1.75rem] border border-[var(--nupsbox-border)] bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div>
              <p className="text-[0.68rem] font-black uppercase tracking-[0.15em] text-[var(--nupsbox-blue)]">FACEBOOK</p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--nupsbox-slate)]">
                {vi
                  ? 'Theo dõi nguồn Facebook công khai đang được NupsBox liên kết để xem thêm nội dung và cập nhật.'
                  : 'Follow the public Facebook source linked by NupsBox for additional content and updates.'}
              </p>
            </div>
            <a
              href={settings.facebookUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-[var(--nupsbox-navy)] px-5 text-sm font-black text-white"
            >
              {vi ? 'Mở Facebook ↗' : 'Open Facebook ↗'}
            </a>
          </div>
        </Section>
      ) : null}

      <FinalCta locale={locale}/>
    </main>
  );
}
