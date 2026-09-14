import {MapPin} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import type {PublicLocation} from '@/features/catalog/types';

export function LocationCard({location, locale}: {location: PublicLocation; locale: 'vi' | 'en'}) {
  return (
    <article className="rounded-[2rem] border border-[var(--nupsbox-border)] bg-white p-7 shadow-[var(--nupsbox-shadow)]">
      <div className="grid size-12 place-items-center rounded-2xl bg-[var(--nupsbox-yellow)] text-[var(--nupsbox-navy)]"><MapPin aria-hidden="true" /></div>
      <h2 className="mt-6 text-2xl font-black tracking-[-0.035em] text-[var(--nupsbox-navy)]">{location.name}</h2>
      <p className="mt-3 text-sm leading-6 text-[var(--nupsbox-slate)]">{location.address}</p>
      <p className="mt-5 text-sm font-semibold text-[var(--nupsbox-blue)]">{location.unitTypes.length} {locale === 'vi' ? 'loại kho đang hiển thị' : 'unit sizes listed'}</p>
      <Link href={{pathname: '/dia-diem/[slug]', params: {slug: location.slug}}} className="mt-6 inline-flex font-bold text-[var(--nupsbox-blue)] hover:underline">{locale === 'vi' ? 'Xem cơ sở →' : 'View location →'}</Link>
    </article>
  );
}
