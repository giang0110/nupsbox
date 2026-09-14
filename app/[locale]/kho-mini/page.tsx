import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {Container} from '@/components/ui/container';
import {UnitCard} from '@/components/units/unit-card';
import {FinalCta} from '@/components/marketing/final-cta';
import {getMarketingUnits} from '@/features/catalog/public-catalog';
import {isSupportedLocale} from '@/i18n/routing';

export default async function StorageIndexPage({params}: {params: Promise<{locale: string}>}) {
  const {locale: rawLocale} = await params;
  if (!isSupportedLocale(rawLocale)) notFound();
  setRequestLocale(rawLocale);
  const units = await getMarketingUnits(rawLocale);
  const vi = rawLocale === 'vi';
  return <main><section className="bg-[var(--nupsbox-navy)] py-20 text-white"><Container><h1 className="text-5xl font-black tracking-[-0.055em] sm:text-6xl">{vi ? 'Kho mini NupsBox' : 'NupsBox mini storage'}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">{vi ? 'Chọn diện tích phù hợp với nhu cầu hiện tại. Giá và tình trạng thực tế được NupsBox xác nhận trước khi thuê.' : 'Choose a unit size that fits your current needs. NupsBox confirms current pricing and status before rental.'}</p></Container></section><section className="py-20"><Container><div className="grid gap-5 md:grid-cols-2">{units.map((unit) => <UnitCard key={unit.id} unit={unit} locale={rawLocale} />)}</div></Container></section><FinalCta locale={rawLocale} /></main>;
}
