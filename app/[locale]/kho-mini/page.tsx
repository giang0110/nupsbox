import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
import {UnitCompare} from '@/components/units/unit-compare';
import {FinalCta} from '@/components/marketing/final-cta';
import {getMarketingUnits} from '@/features/catalog/public-catalog';
import {isSupportedLocale} from '@/i18n/routing';

export default async function StorageIndexPage({params}: {params: Promise<{locale: string}>}) {
  const {locale: rawLocale} = await params;
  if (!isSupportedLocale(rawLocale)) notFound();
  setRequestLocale(rawLocale);
  const units = await getMarketingUnits(rawLocale);
  const vi = rawLocale === 'vi';

  return (
    <main>
      <Section tone="navy" size="compact">
        <div className="max-w-3xl py-4 sm:py-6">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--nupsbox-yellow)]">MINI STORAGE</p>
          <h1 className="mt-4 text-5xl font-black tracking-[-0.045em] text-white sm:text-6xl">
            {vi ? 'Chọn loại kho theo nhu cầu thực tế.' : 'Choose storage around what you actually need.'}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/72">
            {vi
              ? 'So sánh diện tích, mục đích sử dụng, giá đang được xác nhận và tình trạng hiển thị. Nếu chưa chắc, Storage Finder sẽ gợi ý điểm bắt đầu phù hợp.'
              : 'Compare area, suitable use cases, confirmed pricing and listed status. If you are unsure, Storage Finder can suggest a practical starting point.'}
          </p>
        </div>
      </Section>

      <Section tone="soft">
        <SectionHeading
          eyebrow={vi ? 'CHỌN & SO SÁNH' : 'SELECT & COMPARE'}
          title={vi ? 'Hiểu nhanh trước khi liên hệ.' : 'Understand the options before you enquire.'}
          description={vi
            ? 'Mỗi thẻ chỉ hiển thị dữ liệu đang có trong hệ thống. Bạn có thể chọn tối đa 3 loại kho để đặt cạnh nhau.'
            : 'Each card shows only information currently available in the system. Select up to 3 unit types to compare side by side.'}
        />
        <div className="mt-10">
          <UnitCompare units={units} locale={rawLocale} />
        </div>
      </Section>

      <FinalCta locale={rawLocale} />
    </main>
  );
}
