import {MapPin} from 'lucide-react';
import type {AdminLocation} from '@/features/admin/locations';

export function LocationPreview({location}: {location: AdminLocation}) {
  const rows = [
    {locale: 'VI', name: location.nameVi, address: location.addressVi},
    {locale: 'EN', name: location.nameEn, address: location.addressEn}
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {rows.map(row => (
        <article
          key={row.locale}
          className="rounded-2xl border border-[var(--nupsbox-border)] bg-white p-5 shadow-sm"
        >
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[var(--nupsbox-blue)]">
            Preview {row.locale}
          </p>
          <h3 className="mt-2 text-xl font-extrabold tracking-[-0.03em] text-[var(--nupsbox-navy)]">
            {row.name}
          </h3>
          <p className="mt-3 flex gap-2 text-sm leading-6 text-[var(--nupsbox-slate)]">
            <MapPin size={16} className="mt-1 shrink-0" aria-hidden="true" />
            <span>{row.address}</span>
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-[var(--nupsbox-slate)]">
            <span className="rounded-full bg-[var(--nupsbox-surface)] px-3 py-1">{location.district}</span>
            <span className="rounded-full bg-[var(--nupsbox-surface)] px-3 py-1">{location.city}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
