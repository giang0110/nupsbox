import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {ArrowLeft, Ruler} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {ConversionCta} from '@/components/marketing/conversion-cta';
import {FinalCta} from '@/components/marketing/final-cta';
import {JsonLd} from '@/components/seo/json-ld';
import {PageIntro} from '@/components/ui/page-intro';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
import {formatMonthlyPrice} from '@/features/catalog/price';
import {getMarketingUnitBySlug} from '@/features/catalog/public-catalog';
import {createLocalizedMetadata} from '@/features/seo/metadata';
import {absoluteUrl, getStaticSeoRoute, unitSeoRoute} from '@/features/seo/routes';
import {isSupportedLocale} from '@/i18n/routing';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string; slug: string}>;
}): Promise<Metadata> {
  const {locale: rawLocale, slug} = await params;
  if (!isSupportedLocale(rawLocale)) notFound();
  const unit = await getMarketingUnitBySlug(slug, rawLocale);
  if (!unit) notFound();
  const vi = rawLocale === 'vi';
  const area = unit.areaM2.toLocaleString(vi ? 'vi-VN' : 'en-US', {maximumFractionDigits: 2});
  const description = unit.recommendedFor || (vi
    ? `Kho mini ${unit.name} diện tích ${area} m² tại NupsBox TP.HCM. Liên hệ để xác nhận giá và tình trạng phù hợp.`
    : `${unit.name} mini storage with ${area} m² at NupsBox Ho Chi Minh City. Enquire to confirm current pricing and suitability.`);

  return createLocalizedMetadata({
    route: unitSeoRoute(slug),
    locale: rawLocale,
    title: `${unit.name} · ${area} m²`,
    description
  });
}

function availabilityLabel(status: 'available' | 'limited' | 'sold_out' | 'contact', vi: boolean) {
  if (status === 'available') return vi ? 'Có thể trao đổi ngay' : 'Available to discuss';
  if (status === 'limited') return vi ? 'Số lượng hạn chế' : 'Limited availability';
  if (status === 'sold_out') return vi ? 'Hiện chưa có chỗ' : 'Currently unavailable';
  return vi ? 'Liên hệ xác nhận' : 'Contact to confirm';
}

export default async function StorageDetailPage({params}: {params: Promise<{locale: string; slug: string}>}) {
  const {locale: rawLocale, slug} = await params;
  if (!isSupportedLocale(rawLocale)) notFound();
  setRequestLocale(rawLocale);
  const unit = await getMarketingUnitBySlug(slug, rawLocale);
  if (!unit) notFound();

  const vi = rawLocale === 'vi';
  const price = formatMonthlyPrice(unit.promoPrice ?? unit.monthlyPrice, rawLocale);
  const homeRoute = getStaticSeoRoute('home');
  const unitsRoute = getStaticSeoRoute('units');
  const detailRoute = unitSeoRoute(slug);
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {'@type': 'ListItem', position: 1, name: vi ? 'Trang chủ' : 'Home', item: absoluteUrl(homeRoute[rawLocale])},
      {'@type': 'ListItem', position: 2, name: vi ? 'Kho mini' : 'Mini storage', item: absoluteUrl(unitsRoute[rawLocale])},
      {'@type': 'ListItem', position: 3, name: unit.name, item: absoluteUrl(detailRoute[rawLocale])}
    ]
  };

  return (
    <main>
      <JsonLd data={breadcrumb} />

      <PageIntro
        tone="navy"
        eyebrow="MINI STORAGE"
        title={unit.name}
        description={vi
          ? 'Một lựa chọn lưu trữ gọn, được mô tả bằng dữ liệu đang có trong catalog NupsBox.'
          : 'A compact storage option described using the data currently available in the NupsBox catalog.'}
      >
        <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 text-sm font-bold text-white/78">
          <Ruler size={17} aria-hidden="true" />
          {unit.areaM2.toFixed(2)} m²
        </span>
        <ConversionCta
          locale={rawLocale}
          intent="quote"
          context={{unitSlug: unit.slug, unitId: unit.id}}
          placement="unit-detail-hero"
          size="lg"
        >
          {vi ? 'Nhận báo giá' : 'Request quote'}
        </ConversionCta>
      </PageIntro>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
          <div>
            <Link
              href="/kho-mini"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[var(--nupsbox-blue)] hover:underline"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              {vi ? 'Tất cả loại kho' : 'All unit types'}
            </Link>

            <SectionHeading
              eyebrow={vi ? 'PHÙ HỢP VỚI' : 'GOOD FOR'}
              title={vi ? 'Hiểu nhanh trước khi liên hệ.' : 'Understand the fit before you enquire.'}
              description={unit.recommendedFor || (vi
                ? 'Nội dung phù hợp đang được cập nhật. NupsBox sẽ xác nhận nhu cầu thực tế khi tư vấn.'
                : 'Suitability guidance is being updated. NupsBox will confirm your actual needs during consultation.')}
            />

            {unit.capacityNote ? (
              <div className="mt-7 border-l-2 border-[var(--nupsbox-yellow)] pl-5">
                <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[var(--nupsbox-blue)]">
                  {vi ? 'GHI CHÚ SỨC CHỨA' : 'CAPACITY NOTE'}
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--nupsbox-slate)]">{unit.capacityNote}</p>
              </div>
            ) : null}
          </div>

          <aside className="overflow-hidden rounded-[1.75rem] border border-[var(--nupsbox-border)] bg-white shadow-[0_18px_50px_rgba(7,26,56,.08)]">
            <div className="bg-[var(--nupsbox-navy)] p-6 text-white">
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[var(--nupsbox-yellow)]">
                {vi ? 'THÔNG TIN HIỆN TẠI' : 'CURRENT INFORMATION'}
              </p>
              <p className="mt-3 text-4xl font-extrabold tracking-[-0.05em]">{unit.areaM2.toFixed(2)}<span className="ml-1 text-base font-bold tracking-normal text-white/60">m²</span></p>
            </div>
            <div className="grid divide-y divide-[var(--nupsbox-border)]">
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--nupsbox-muted)]">{vi ? 'Giá tháng' : 'Monthly price'}</p>
                <p className="mt-1 text-xl font-extrabold text-[var(--nupsbox-navy)]">{price ?? (vi ? 'Liên hệ báo giá' : 'Contact for pricing')}</p>
              </div>
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--nupsbox-muted)]">{vi ? 'Tình trạng' : 'Status'}</p>
                <p className="mt-1 text-base font-extrabold text-[var(--nupsbox-navy)]">{availabilityLabel(unit.availabilityStatus, vi)}</p>
              </div>
              <div className="p-5 text-sm leading-6 text-[var(--nupsbox-slate)]">
                {vi
                  ? 'Giá và tình trạng được xác nhận lại trước khi đặt lịch hoặc thuê.'
                  : 'Pricing and availability are reconfirmed before a viewing or rental.'}
              </div>
            </div>
          </aside>
        </div>
      </Section>

      <FinalCta locale={rawLocale} />
    </main>
  );
}
