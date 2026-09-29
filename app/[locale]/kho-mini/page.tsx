import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {PageIntro} from '@/components/ui/page-intro';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
import {UnitCompare} from '@/components/units/unit-compare';
import {StorageFinder} from '@/components/storage-finder/storage-finder';
import {FinalCta} from '@/components/marketing/final-cta';
import {EmptyCatalogConversion} from '@/components/marketing/empty-catalog-conversion';
import {getMarketingUnits} from '@/features/catalog/public-catalog';
import {isSupportedLocale} from '@/i18n/routing';
import {createStaticPageMetadata} from '@/features/seo/static-page';

export function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  return createStaticPageMetadata(params, 'units', {
    vi: {
      title: 'Các loại kho mini',
      description: 'Thông tin tham khảo về loại kho, diện tích, mục đích sử dụng, giá đã được xác nhận và tình trạng đang hiển thị của NupsBox.'
    },
    en: {
      title: 'Mini storage unit types',
      description: 'Reference information about NupsBox unit types, area, use guidance, confirmed pricing and currently displayed status.'
    }
  });
}

export default async function StorageIndexPage({params}: {params: Promise<{locale: string}>}) {
  const {locale: rawLocale} = await params;
  if (!isSupportedLocale(rawLocale)) notFound();
  setRequestLocale(rawLocale);
  const units = await getMarketingUnits(rawLocale);
  const vi = rawLocale === 'vi';
  const finderUnits = units.map(({id, slug, name, areaM2, sortOrder}) => ({
    id,
    slug,
    name,
    areaM2,
    sortOrder
  }));

  return (
    <main>
      <PageIntro
        tone="navy"
        eyebrow="MINI STORAGE"
        title={vi ? 'Thông tin các loại kho NupsBox.' : 'NupsBox storage unit information.'}
        description={vi
          ? 'Trang tham khảo chi tiết về diện tích, mục đích sử dụng, giá đang được xác nhận và tình trạng hiển thị. Công cụ gợi ý bên dưới chỉ là tiện ích hỗ trợ, không thay thế xác nhận trực tiếp.'
          : 'A detailed reference for area, suitable use cases, confirmed pricing and listed status. The finder below is a supporting tool and does not replace direct confirmation.'}
      />

      {units.length ? (
        <>
          <Section tone="soft" size="compact">
            <div id="storage-finder" className="scroll-mt-24">
              <SectionHeading
                eyebrow={vi ? 'CÔNG CỤ THAM KHẢO' : 'REFERENCE TOOL'}
                title={vi ? 'Gợi ý nhanh theo nhu cầu.' : 'Quick guidance based on your needs.'}
                description={vi
                  ? 'Storage Finder được giữ như một tiện ích phụ trên trang thông tin loại kho; homepage không còn dùng công cụ này làm luồng chính.'
                  : 'Storage Finder remains as a supporting utility on the unit-information page; it is no longer the homepage primary flow.'}
              />
              <div className="mt-7">
                <StorageFinder units={finderUnits} />
              </div>
            </div>
          </Section>

          <Section>
            <SectionHeading
              eyebrow={vi ? 'CHỌN & SO SÁNH' : 'SELECT & COMPARE'}
              title={vi ? 'Đối chiếu thông tin đã công bố.' : 'Compare published information.'}
              description={vi
                ? 'Mỗi thẻ chỉ hiển thị dữ liệu đang có trong hệ thống. Bạn có thể chọn tối đa 3 loại kho để đặt cạnh nhau.'
                : 'Each card shows only information currently available in the system. Select up to 3 unit types to compare side by side.'}
            />
            <div className="mt-8">
              <UnitCompare units={units} locale={rawLocale} />
            </div>
          </Section>
        </>
      ) : (
        <Section tone="soft">
          <EmptyCatalogConversion locale={rawLocale} context="units" />
        </Section>
      )}

      <FinalCta locale={rawLocale} />
    </main>
  );
}
