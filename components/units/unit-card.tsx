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
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--nupsbox-border)] bg-white shadow-[var(--nupsbox-shadow-sm)] transition duration-200 hover:-translate-y-px hover:shadow-[var(--nupsbox-shadow)]">
      <div className="relative bg-[linear-gradient(145deg,var(--nupsbox-navy),#0c326d)] p-5 text-white sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.68rem] font-extrabold tracking-[0.14em] text-[var(--nupsbox-yellow)]">MINI STORAGE</p>
            <h2 className="mt-2.5 text-2xl font-extrabold tracking-[-0.03em] sm:text-[1.75rem]">{unit.name}</h2>
            <p className="mt-1 text-base text-white/68">{unit.areaM2.toFixed(2)} m²</p>
          </div>
          <span className="max-w-36 rounded-full border border-white/12 bg-white/8 px-3 py-1 text-right text-[0.7rem] font-semibold leading-4 text-white/76">
            {availabilityLabel(unit.availabilityStatus, locale)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-sm leading-6 text-[var(--nupsbox-slate)]">{unit.recommendedFor}</p>

        <div className="mt-5 border-t border-[var(--nupsbox-border)] pt-4">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.11em] text-[var(--nupsbox-muted)]">
            {vi ? 'Giá thuê tháng' : 'Monthly price'}
          </p>
          <p className="mt-1 text-lg font-extrabold text-[var(--nupsbox-navy)]">
            {price ?? (vi ? 'Liên hệ báo giá' : 'Contact for pricing')}
          </p>
        </div>

        {onCompareToggle ? (
          <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] px-4 text-sm font-semibold text-[var(--nupsbox-navy)] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--nupsbox-blue)] has-[:focus-visible]:ring-offset-2 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
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

        <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-5">
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
            className="inline-flex min-h-11 items-center rounded-full px-2 text-sm font-bold text-[var(--nupsbox-blue)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nupsbox-blue)] focus-visible:ring-offset-2"
          >
            {vi ? 'Xem chi tiết →' : 'View details →'}
          </Link>
        </div>
      </div>
    </article>
  );
}
