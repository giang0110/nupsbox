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
    <div className="rounded-[var(--nupsbox-radius-lg)] bg-[var(--nupsbox-navy)] p-6 text-white shadow-[var(--nupsbox-shadow)] sm:p-7">
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--nupsbox-yellow)]">
        {vi ? 'Gợi ý phù hợp' : 'Recommended fit'}
      </p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="text-3xl font-black tracking-[-0.04em]">{recommendation.unit.name}</h3>
          <p className="mt-1 text-white/70">{recommendation.unit.areaM2.toFixed(2)} m²</p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
          {recommendation.needsConsultation
            ? (vi ? 'Nên tư vấn thêm' : 'Consultation advised')
            : (vi ? 'Phù hợp ban đầu' : 'Good starting fit')}
        </span>
      </div>
      <p className="mt-5 max-w-xl text-sm leading-6 text-white/72">
        {recommendation.needsConsultation
          ? (vi
              ? 'Đây là gợi ý theo kích thước kho hiện có. NupsBox sẽ xác nhận nhu cầu thực tế trước khi bạn chọn kho.'
              : 'This is a size-based starting point. NupsBox will confirm your actual storage needs before you choose a unit.')
          : (vi
              ? 'Gợi ý dựa trên nhu cầu và nhóm khối lượng bạn đã chọn, không thay thế khảo sát thực tế.'
              : 'The recommendation uses your selected need and volume band and does not replace an on-site assessment.')}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
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
          className={buttonClassName({variant: 'secondary', size: 'lg', className: 'w-full border-white/20 bg-white/8 text-white hover:bg-white/12 hover:text-white'})}
        >
          <CalendarDays size={18} aria-hidden="true" />
          {vi ? 'Đặt lịch xem kho' : 'Request viewing'}
        </a>
      </div>

      <a href={detailHref} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-white/78 hover:text-white">
        {vi ? `Xem chi tiết ${recommendation.unit.name}` : `View ${recommendation.unit.name} details`}
        <ArrowRight size={16} aria-hidden="true" />
      </a>
    </div>
  );
}
