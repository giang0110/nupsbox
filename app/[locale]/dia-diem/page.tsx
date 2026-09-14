import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {Container} from '@/components/ui/container';
import {LocationCard} from '@/components/locations/location-card';
import {getMarketingFeaturedLocation} from '@/features/catalog/public-catalog';
import {isSupportedLocale} from '@/i18n/routing';

export default async function LocationsPage({params}: {params: Promise<{locale: string}>}) {
  const {locale: rawLocale} = await params;
  if (!isSupportedLocale(rawLocale)) notFound();
  setRequestLocale(rawLocale);
  const location = await getMarketingFeaturedLocation(rawLocale);
  const vi = rawLocale === 'vi';
  return <main><section className="py-20"><Container><h1 className="text-5xl font-black tracking-[-0.055em] text-[var(--nupsbox-navy)] sm:text-6xl">{vi ? 'Địa điểm NupsBox' : 'NupsBox locations'}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--nupsbox-slate)]">{vi ? 'Website đã sẵn sàng cho nhiều chi nhánh. Hiện cơ sở được hiển thị là NupsBox Tân Phú.' : 'The website is ready for multiple locations. NupsBox Tan Phu is the location currently listed.'}</p><div className="mt-10 max-w-xl"><LocationCard location={location} locale={rawLocale} /></div></Container></section></main>;
}
