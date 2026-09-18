import {MapPin} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {ConversionCta} from '@/components/marketing/conversion-cta';
import type {PublicLocation} from '@/features/catalog/types';

export function LocationCard({location, locale}: {location: PublicLocation; locale: 'vi' | 'en'}) {
  const vi = locale === 'vi';

  return (
    <article className="rounded-3xl border border-[var(--nupsbox-border)] bg-white p-6 shadow-[var(--nupsbox-shadow-sm)] sm:p-7">
      <div className="grid size-11 place-items-center rounded-xl bg-[var(--nupsbox-yellow)] text-[var(--nupsbox-navy)]">
        <MapPin size={20} aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-2xl font-extrabold tracking-[-0.03em] text-[var(--nupsbox-navy)]">{location.name}</h2>
      <p className="mt-2.5 text-sm leading-6 text-[var(--nupsbox-slate)]">{location.address}</p>
      <p className="mt-4 text-sm font-semibold text-[var(--nupsbox-blue)]">
        {location.unitTypes.length} {vi ? 'loại kho đang hiển thị' : 'unit sizes listed'}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <ConversionCta
          locale={locale}
          intent="viewing"
          context={{locationSlug: location.slug, locationId: location.id}}
          placement="location-card"
        >
          {vi ? 'Đặt lịch xem kho' : 'Request a viewing'}
        </ConversionCta>
        <Link
          href={{pathname: '/dia-diem/[slug]', params: {slug: location.slug}}}
          className="inline-flex min-h-11 items-center rounded-full px-2 text-sm font-bold text-[var(--nupsbox-blue)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nupsbox-blue)] focus-visible:ring-offset-2"
        >
          {vi ? 'Xem cơ sở →' : 'View location →'}
        </Link>
      </div>
    </article>
  );
}
