import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {Container} from '@/components/ui/container';
import {UnitCard} from '@/components/units/unit-card';
import {getMarketingUnits} from '@/features/catalog/public-catalog';
import {isSupportedLocale} from '@/i18n/routing';

export default async function PricingPage({params}: {params: Promise<{locale: string}>}) {
  const {locale: rawLocale} = await params;
  if (!isSupportedLocale(rawLocale)) notFound();
  setRequestLocale(rawLocale);
  const units = await getMarketingUnits(rawLocale);
  const vi = rawLocale === 'vi';
  return <main><section className="bg-[var(--nupsbox-surface)] py-20"><Container><h1 className="text-5xl font-black tracking-[-0.055em] text-[var(--nupsbox-navy)] sm:text-6xl">{vi ? 'Bảng giá kho mini' : 'Mini storage pricing'}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--nupsbox-slate)]">{vi ? 'Giá chỉ hiển thị khi đã được NupsBox cập nhật trong hệ thống. Nếu chưa có giá xác thực, website sẽ yêu cầu liên hệ thay vì hiển thị số ước tính.' : 'Prices are shown only after NupsBox has updated them in the system. Unverified pricing is never estimated.'}</p><div className="mt-10 grid gap-5 md:grid-cols-2">{units.map((unit) => <UnitCard key={unit.id} unit={unit} locale={rawLocale} />)}</div></Container></section></main>;
}
