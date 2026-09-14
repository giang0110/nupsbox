import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {MapPin} from 'lucide-react';
import {Container} from '@/components/ui/container';
import {UnitCard} from '@/components/units/unit-card';
import {getMarketingLocationBySlug} from '@/features/catalog/public-catalog';
import {isSupportedLocale} from '@/i18n/routing';

export default async function LocationDetailPage({params}: {params: Promise<{locale: string; slug: string}>}) {
  const {locale: rawLocale, slug} = await params;
  if (!isSupportedLocale(rawLocale)) notFound();
  setRequestLocale(rawLocale);
  const location = await getMarketingLocationBySlug(slug, rawLocale);
  if (!location) notFound();
  const vi = rawLocale === 'vi';
  return <main><section className="bg-[var(--nupsbox-navy)] py-20 text-white"><Container><p className="flex items-center gap-2 text-sm text-white/60"><MapPin size={17} aria-hidden="true" />{location.address}</p><h1 className="mt-4 text-5xl font-black tracking-[-0.055em] sm:text-6xl">{location.name}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">{vi ? 'Kho mini dành cho shop online, doanh nghiệp nhỏ và nhu cầu lưu trữ linh hoạt tại Tân Phú.' : 'Flexible mini storage for online sellers, small businesses and personal storage in Tan Phu.'}</p></Container></section><section className="py-20"><Container><h2 className="text-3xl font-black tracking-[-0.04em] text-[var(--nupsbox-navy)]">{vi ? 'Các loại kho tại cơ sở' : 'Storage sizes at this location'}</h2><div className="mt-8 grid gap-5 md:grid-cols-2">{location.unitTypes.map((unit) => <UnitCard key={unit.id} unit={unit} locale={rawLocale} />)}</div></Container></section></main>;
}
