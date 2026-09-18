import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {PageIntro} from '@/components/ui/page-intro';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
import {UnitCompare} from '@/components/units/unit-compare';
import {ConversionCta} from '@/components/marketing/conversion-cta';
import {getMarketingUnits} from '@/features/catalog/public-catalog';
import {isSupportedLocale} from '@/i18n/routing';
import {createStaticPageMetadata} from '@/features/seo/static-page';

export function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  return createStaticPageMetadata(params, 'pricing', {
    vi: {
      title: 'Bảng giá kho mini',
      description: 'Xem giá kho mini khi dữ liệu đã được NupsBox xác nhận; giá chưa có nguồn được hiển thị dưới dạng liên hệ báo giá.'
    },
    en: {
      title: 'Mini storage pricing',
      description: 'View mini storage pricing when values have been confirmed by NupsBox; unverified prices remain contact-for-pricing.'
    }
  });
}

export default async function PricingPage({params}: {params: Promise<{locale: string}>}) {
  const {locale: rawLocale} = await params;
  if (!isSupportedLocale(rawLocale)) notFound();
  setRequestLocale(rawLocale);
  const units = await getMarketingUnits(rawLocale);
  const vi = rawLocale === 'vi';

  return (
    <main>
      <PageIntro
        eyebrow={vi ? 'GIÁ & LỰA CHỌN' : 'PRICING & OPTIONS'}
        title={vi ? 'Bảng giá kho mini' : 'Mini storage pricing'}
        description={vi
          ? 'Giá chỉ hiển thị khi đã được NupsBox cập nhật trong hệ thống. Nếu chưa có giá xác thực, website sẽ yêu cầu liên hệ thay vì hiển thị số ước tính.'
          : 'Prices are shown only after NupsBox has updated them in the system. Unverified pricing is never estimated.'}
      >
        <ConversionCta locale={rawLocale} intent="finder" placement="pricing-hero" size="lg">
          {vi ? 'Tìm kho phù hợp' : 'Find suitable storage'}
        </ConversionCta>
        <ConversionCta locale={rawLocale} intent="quote" placement="pricing-hero" variant="secondary" size="lg">
          {vi ? 'Nhận báo giá' : 'Request quote'}
        </ConversionCta>
      </PageIntro>

      <Section>
        <SectionHeading
          eyebrow={vi ? 'HIỂU GIÁ TRƯỚC KHI CHỌN' : 'UNDERSTAND PRICE FIRST'}
          title={vi ? 'Yếu tố ảnh hưởng đến giá.' : 'What affects the price.'}
          description={vi
            ? 'Giá phụ thuộc vào loại kho, diện tích và mức giá hiện hành đã được xác nhận. NupsBox không hiển thị phần trăm tiết kiệm hay mức giảm nếu không có dữ liệu nguồn.'
            : 'Price depends on unit type, area and the currently confirmed offer. NupsBox does not show savings percentages or discounts without source data.'}
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {(vi
            ? [['Diện tích', 'Kho lớn hơn có mức giá khác kho nhỏ hơn.'], ['Loại kho', 'Mỗi loại kho có công năng và cấu hình riêng.'], ['Mức giá hiện hành', 'Chỉ dùng giá đã được NupsBox cập nhật trong hệ thống.']]
            : [['Area', 'Larger units may have different pricing from smaller ones.'], ['Unit type', 'Each unit type has its own configuration and use case.'], ['Current confirmed offer', 'Only values maintained by NupsBox are displayed.']]
          ).map(([title, text]) => (
            <article key={title} className="rounded-2xl border border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] p-5">
              <h2 className="text-lg font-bold text-[var(--nupsbox-navy)]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--nupsbox-slate)]">{text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="soft">
        <SectionHeading
          eyebrow={vi ? 'SO SÁNH' : 'COMPARE'}
          title={vi ? 'Đặt tối đa 3 loại kho cạnh nhau.' : 'Compare up to 3 unit types side by side.'}
          description={vi
            ? 'Các thẻ chỉ hiển thị dữ liệu đang có; giá trống sẽ tiếp tục hiển thị “Liên hệ báo giá”.'
            : 'Cards show only current data; missing prices remain “Contact for pricing”.'}
        />
        <div className="mt-8"><UnitCompare units={units} locale={rawLocale} /></div>
      </Section>
    </main>
  );
}
