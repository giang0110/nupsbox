import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {Container} from '@/components/ui/container';
import {FinalCta} from '@/components/marketing/final-cta';
import {formatMonthlyPrice} from '@/features/catalog/price';
import {getMarketingUnitBySlug} from '@/features/catalog/public-catalog';
import {createLocalizedMetadata} from '@/features/seo/metadata';
import {unitSeoRoute} from '@/features/seo/routes';
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
    title: vi ? `${unit.name} · ${area} m²` : `${unit.name} · ${area} m²`,
    description
  });
}

export default async function StorageDetailPage({params}: {params: Promise<{locale: string; slug: string}>}) {
  const {locale: rawLocale, slug} = await params;
  if (!isSupportedLocale(rawLocale)) notFound();
  setRequestLocale(rawLocale);
  const unit = await getMarketingUnitBySlug(slug, rawLocale);
  if (!unit) notFound();
  const vi = rawLocale === 'vi';
  const price = formatMonthlyPrice(unit.promoPrice ?? unit.monthlyPrice, rawLocale);
  return <main><section className="bg-[var(--nupsbox-navy)] py-20 text-white"><Container><p className="text-xs font-black tracking-[0.16em] text-[var(--nupsbox-yellow)]">MINI STORAGE</p><h1 className="mt-4 text-6xl font-black tracking-[-0.06em]">{unit.name}</h1><p className="mt-3 text-2xl text-white/70">{unit.areaM2.toFixed(2)} m²</p></Container></section><section className="py-20"><Container className="grid gap-8 lg:grid-cols-[1fr_.7fr]"><div><h2 className="text-3xl font-black tracking-[-0.04em] text-[var(--nupsbox-navy)]">{vi ? 'Phù hợp với nhu cầu gọn và linh hoạt.' : 'Built for compact, flexible storage needs.'}</h2><p className="mt-5 max-w-2xl leading-7 text-[var(--nupsbox-slate)]">{unit.recommendedFor}</p></div><aside className="rounded-3xl bg-[var(--nupsbox-surface)] p-7"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--nupsbox-slate)]">{vi ? 'Giá hiện tại' : 'Current price'}</p><p className="mt-2 text-2xl font-black text-[var(--nupsbox-navy)]">{price ?? (vi ? 'Liên hệ báo giá' : 'Contact for pricing')}</p><p className="mt-4 text-sm leading-6 text-[var(--nupsbox-slate)]">{vi ? 'NupsBox sẽ xác nhận giá và tình trạng kho trước khi bạn đặt lịch.' : 'NupsBox will confirm price and current status before you schedule a visit.'}</p></aside></Container></section><FinalCta locale={rawLocale} /></main>;
}
