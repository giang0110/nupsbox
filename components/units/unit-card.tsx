import {Link} from '@/i18n/navigation';
import {formatMonthlyPrice} from '@/features/catalog/price';
import type {PublicUnitType} from '@/features/catalog/types';

export function UnitCard({unit, locale}: {unit: PublicUnitType; locale: 'vi' | 'en'}) {
  const price = formatMonthlyPrice(unit.promoPrice ?? unit.monthlyPrice, locale);
  return (
    <article className="overflow-hidden rounded-[2rem] border border-[var(--nupsbox-border)] bg-white">
      <div className="bg-[var(--nupsbox-navy)] p-7 text-white">
        <p className="text-xs font-black tracking-[0.15em] text-[var(--nupsbox-yellow)]">MINI STORAGE</p>
        <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">{unit.name}</h2>
        <p className="mt-1 text-lg text-white/70">{unit.areaM2.toFixed(2)} m²</p>
      </div>
      <div className="p-7">
        <p className="min-h-12 text-sm leading-6 text-[var(--nupsbox-slate)]">{unit.recommendedFor}</p>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.12em] text-[var(--nupsbox-slate)]">{locale === 'vi' ? 'Giá thuê' : 'Monthly price'}</p>
        <p className="mt-1 text-xl font-black text-[var(--nupsbox-navy)]">{price ?? (locale === 'vi' ? 'Liên hệ báo giá' : 'Contact for pricing')}</p>
        <Link href={{pathname: '/kho-mini/[slug]', params: {slug: unit.slug}}} className="mt-6 inline-flex font-bold text-[var(--nupsbox-blue)] hover:underline">{locale === 'vi' ? 'Xem chi tiết →' : 'View details →'}</Link>
      </div>
    </article>
  );
}
