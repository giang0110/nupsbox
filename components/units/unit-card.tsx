import {Link} from '@/i18n/navigation';
import {ConversionCta} from '@/components/marketing/conversion-cta';
import {formatMonthlyPrice} from '@/features/catalog/price';
import type {PublicUnitType} from '@/features/catalog/types';

function availabilityLabel(status: PublicUnitType['availabilityStatus'], locale: 'vi' | 'en') {
  const vi = locale === 'vi';
  switch (status) {
    case 'available':
      return vi ? 'Có thể trao đổi ngay' : 'Available to discuss';
    case 'limited':
      return vi ? 'Số lượng hạn chế' : 'Limited availability';
    case 'sold_out':
      return vi ? 'Hiện chưa có chỗ' : 'Currently unavailable';
    default:
      return vi ? 'Liên hệ xác nhận' : 'Contact to confirm';
  }
}

export function UnitCard({
  unit,
  locale,
  compareSelected = false,
  compareDisabled = false,
  onCompareToggle
}: {
  unit: PublicUnitType;
  locale: 'vi' | 'en';
  compareSelected?: boolean;
  compareDisabled?: boolean;
  onCompareToggle?: () => void;
}) {
  const vi = locale === 'vi';
  const price = formatMonthlyPrice(unit.promoPrice ?? unit.monthlyPrice, locale);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-[var(--nupsbox-border)] bg-white shadow-[var(--nupsbox-shadow-sm)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--nupsbox-shadow-lg)]">
      <div className="relative bg-[var(--nupsbox-navy)] p-6 text-white sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black tracking-[0.15em] text-[var(--nupsbox-yellow)]">MINI STORAGE</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em]">{unit.name}</h2>
            <p className="mt-1 text-lg text-white/70">{unit.areaM2.toFixed(2)} m²</p>
          </div>
          <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-semibold text-white/78">
            {availabilityLabel(unit.availabilityStatus, locale)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <p className="text-sm leading-6 text-[var(--nupsbox-slate)]">{unit.recommendedFor}</p>

        <div className="mt-6 border-t border-[var(--nupsbox-border)] pt-5">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--nupsbox-muted)]">{vi ? 'Giá thuê tháng' : 'Monthly price'}</p>
          <p className="mt-1 text-xl font-black text-[var(--nupsbox-navy)]">
            {price ?? (vi ? 'Liên hệ báo giá' : 'Contact for pricing')}
          </p>
        </div>

        {onCompareToggle ? (
          <label className="mt-5 flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-[var(--nupsbox-border)] px-4 text-sm font-semibold text-[var(--nupsbox-navy)] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--nupsbox-blue)] has-[:focus-visible]:ring-offset-2 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
            <input
              type="checkbox"
              checked={compareSelected}
              disabled={compareDisabled && !compareSelected}
              onChange={onCompareToggle}
              className="size-4 accent-[var(--nupsbox-blue)]"
            />
            {compareSelected ? (vi ? 'Đang so sánh' : 'Selected to compare') : (vi ? 'Thêm vào so sánh' : 'Add to compare')}
          </label>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
          <ConversionCta
            locale={locale}
            intent="quote"
            context={{unitSlug: unit.slug, unitId: unit.id}}
            placement="unit-card"
            size="md"
          >
            {vi ? 'Nhận báo giá' : 'Request quote'}
          </ConversionCta>
          <Link
            href={{pathname: '/kho-mini/[slug]', params: {slug: unit.slug}}}
            className="inline-flex min-h-10 items-center rounded-full px-2 text-sm font-bold text-[var(--nupsbox-blue)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nupsbox-blue)] focus-visible:ring-offset-2"
          >
            {vi ? 'Xem chi tiết →' : 'View details →'}
          </Link>
        </div>
      </div>
    </article>
  );
}
