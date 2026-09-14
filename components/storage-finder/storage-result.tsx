import type {StorageRecommendation} from '@/features/storage-finder/types';

type DisplayUnit = StorageRecommendation['unit'] & {name: string};

type StorageResultProps = {
  recommendation: Omit<StorageRecommendation, 'unit'> & {unit: DisplayUnit};
  locale: 'vi' | 'en';
};

export function StorageResult({recommendation, locale}: StorageResultProps) {
  const href = locale === 'vi'
    ? `/kho-mini/${recommendation.unit.slug}`
    : `/en/mini-storage/${recommendation.unit.slug}`;

  return (
    <div className="rounded-[var(--nupsbox-radius-lg)] bg-[var(--nupsbox-navy)] p-6 text-white shadow-[var(--nupsbox-shadow)] sm:p-8">
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--nupsbox-yellow)]">
        {locale === 'vi' ? 'Gợi ý phù hợp' : 'Recommended fit'}
      </p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <div>
          <h3 className="text-3xl font-black tracking-[-0.04em]">{recommendation.unit.name}</h3>
          <p className="mt-1 text-white/70">{recommendation.unit.areaM2.toFixed(2)} m²</p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
          {recommendation.needsConsultation
            ? (locale === 'vi' ? 'Nên tư vấn thêm' : 'Consultation advised')
            : (locale === 'vi' ? 'Phù hợp ban đầu' : 'Good starting fit')}
        </span>
      </div>
      <p className="mt-5 max-w-xl text-sm leading-6 text-white/72">
        {recommendation.needsConsultation
          ? (locale === 'vi'
              ? 'Đây là gợi ý theo kích thước kho hiện có. NupsBox sẽ xác nhận nhu cầu thực tế trước khi bạn chọn kho.'
              : 'This is a size-based starting point. NupsBox will confirm your actual storage needs before you choose a unit.')
          : (locale === 'vi'
              ? 'Gợi ý dựa trên nhu cầu và nhóm khối lượng bạn đã chọn, không thay thế khảo sát thực tế.'
              : 'The recommendation uses your selected need and volume band and does not replace an on-site assessment.')}
      </p>
      <a
        href={href}
        className="mt-6 inline-flex min-h-11 items-center rounded-full bg-[var(--nupsbox-yellow)] px-5 text-sm font-bold text-[var(--nupsbox-navy)]"
      >
        {locale === 'vi' ? `Xem ${recommendation.unit.name}` : `View ${recommendation.unit.name}`}
      </a>
    </div>
  );
}
