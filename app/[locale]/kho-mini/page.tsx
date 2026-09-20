import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {PageIntro} from '@/components/ui/page-intro';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
import {UnitCompare} from '@/components/units/unit-compare';
import {FinalCta} from '@/components/marketing/final-cta';
import {EmptyCatalogConversion} from '@/components/marketing/empty-catalog-conversion';
import {getMarketingUnits} from '@/features/catalog/public-catalog';
import {isSupportedLocale} from '@/i18n/routing';
import {createStaticPageMetadata} from '@/features/seo/static-page';

export function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  return createStaticPageMetadata(params, 'units', {
    vi: {
      title: 'Các loại kho mini',
      description: 'So sánh diện tích, mục đích sử dụng, giá đã được xác nhận và tình trạng đang hiển thị của các loại kho NupsBox.'
    },
    en: {
      title: 'Mini storage unit types',
      description: 'Compare area, use guidance, confirmed pricing and the currently displayed status of NupsBox storage unit types.'
    }
  });
}

export default async function StorageIndexPage({params}: {params: Promise<{locale: string}>}) {
  const {locale: rawLocale} = await params;
  if (!isSupportedLocale(rawLocale)) notFound();
  setRequestLocale(rawLocale);
  const units = await getMarketingUnits(rawLocale);
  const vi = rawLocale === 'vi';

  return (
    <main>
      <PageIntro
        tone="navy"
        eyebrow="MINI STORAGE"
        title={vi ? 'Chọn loại kho theo nhu cầu thực tế.' : 'Choose storage around what you actually need.'}
        description={vi
          ? 'So sánh diện tích, mục đích sử dụng, giá đang được xác nhận và tình trạng hiển thị. Nếu chưa chắc, Storage Finder sẽ gợi ý điểm bắt đầu phù hợp.'
          : 'Compare area, suitable use cases, confirmed pricing and listed status. If you are unsure, Storage Finder can suggest a practical starting point.'}
      />

      <Section tone="soft">
        {units.length ? (
          <>
            <SectionHeading
              eyebrow={vi ? 'CHỌN & SO SÁNH' : 'SELECT & COMPARE'}
              title={vi ? 'Hiểu nhanh trước khi liên hệ.' : 'Understand the options before you enquire.'}
              description={vi
                ? 'Mỗi thẻ chỉ hiển thị dữ liệu đang có trong hệ thống. Bạn có thể chọn tối đa 3 loại kho để đặt cạnh nhau.'
                : 'Each card shows only information currently available in the system. Select up to 3 unit types to compare side by side.'}
            />
            <div className="mt-8">
              <UnitCompare units={units} locale={rawLocale} />
            </div>
          </>
        ) : (
          <EmptyCatalogConversion locale={rawLocale} context="units" />
        )}
      </Section>

      <FinalCta locale={rawLocale} />
    </main>
  );
}
