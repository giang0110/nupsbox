import {ArrowRight, CalendarDays, FileText} from 'lucide-react';
import {buttonClassName} from '@/components/ui/button';
import {trackEvent} from '@/features/analytics/events';
import {buildConversionHref} from '@/features/marketing/conversion';
import {buildFinderConversionContext} from '@/features/storage-finder/handoff';
import type {StorageFinderInput, StorageRecommendation} from '@/features/storage-finder/types';

type DisplayUnit = StorageRecommendation['unit'] & {name: string};

type StorageResultProps = {
  recommendation: Omit<StorageRecommendation, 'unit'> & {unit: DisplayUnit};
  input: StorageFinderInput;
  locale: 'vi' | 'en';
};

export function StorageResult({recommendation, input, locale}: StorageResultProps) {
  const context = buildFinderConversionContext(input, recommendation);
  const detailHref = locale === 'vi'
    ? `/kho-mini/${recommendation.unit.slug}`
    : `/en/mini-storage/${recommendation.unit.slug}`;
  const quoteHref = buildConversionHref(locale, 'quote', context);
  const viewingHref = buildConversionHref(locale, 'viewing', context);
  const vi = locale === 'vi';

  function trackAction(action: 'quote' | 'viewing') {
    trackEvent('storage_recommendation_cta_click', {
      action,
      placement: 'finder-result',
      unitId: recommendation.unit.id,
      locale
    });
  }

  return (
    <div className="rounded-2xl border border-[rgba(8,70,168,.12)] bg-[linear-gradient(145deg,#f7f9fc,#eef4fb)] p-5 text-[var(--nupsbox-ink)] sm:p-6">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--nupsbox-blue)]">
        {vi ? 'Gợi ý phù hợp' : 'Recommended fit'}
      </p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-2xl font-extrabold tracking-[-0.035em] text-[var(--nupsbox-navy)] sm:text-3xl">
            {recommendation.unit.name}
          </h3>
          <p className="mt-1 text-sm text-[var(--nupsbox-slate)]">{recommendation.unit.areaM2.toFixed(2)} m²</p>
        </div>
        <span className="rounded-full border border-[var(--nupsbox-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--nupsbox-slate)]">
          {recommendation.needsConsultation
            ? (vi ? 'Nên tư vấn thêm' : 'Consultation advised')
            : (vi ? 'Phù hợp ban đầu' : 'Good starting fit')}
        </span>
      </div>
      <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--nupsbox-slate)]">
        {recommendation.needsConsultation
          ? (vi
              ? 'Đây là gợi ý theo kích thước kho hiện có. NupsBox sẽ xác nhận nhu cầu thực tế trước khi bạn chọn kho.'
              : 'This is a size-based starting point. NupsBox will confirm your actual storage needs before you choose a unit.')
          : (vi
              ? 'Gợi ý dựa trên nhu cầu và nhóm khối lượng bạn đã chọn, không thay thế khảo sát thực tế.'
              : 'The recommendation uses your selected need and volume band and does not replace an on-site assessment.')}
      </p>

      <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
        <a
          href={quoteHref}
          onClick={() => trackAction('quote')}
          className={buttonClassName({size: 'lg', className: 'w-full'})}
        >
          <FileText size={18} aria-hidden="true" />
          {vi ? 'Nhận báo giá' : 'Request quote'}
        </a>
        <a
          href={viewingHref}
          onClick={() => trackAction('viewing')}
          className={buttonClassName({variant: 'secondary', size: 'lg', className: 'w-full'})}
        >
          <CalendarDays size={18} aria-hidden="true" />
          {vi ? 'Đặt lịch xem kho' : 'Request viewing'}
        </a>
      </div>

      <a
        href={detailHref}
        className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[var(--nupsbox-blue)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nupsbox-blue)] focus-visible:ring-offset-2"
      >
        {vi ? `Xem chi tiết ${recommendation.unit.name}` : `View ${recommendation.unit.name} details`}
        <ArrowRight size={16} aria-hidden="true" />
      </a>
    </div>
  );
}
