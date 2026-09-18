'use client';

import {useMemo, useState} from 'react';
import {useLocale} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {trackEvent} from '@/features/analytics/events';
import {recommendStorage} from '@/features/storage-finder/recommend';
import type {StorageCatalogItem, StorageNeed, StorageVolume} from '@/features/storage-finder/types';
import {StorageResult} from './storage-result';

type FinderUnit = StorageCatalogItem & {name: string};

type StorageFinderProps = {
  units: FinderUnit[];
};

const needOptions: Array<{value: StorageNeed; vi: string; en: string}> = [
  {value: 'shop_online', vi: 'Shop online', en: 'Online shop'},
  {value: 'business', vi: 'Doanh nghiệp', en: 'Business'},
  {value: 'inventory', vi: 'Hàng tồn', en: 'Inventory'},
  {value: 'personal', vi: 'Cá nhân', en: 'Personal'}
];

const volumeOptions: Array<{value: StorageVolume; vi: string; en: string}> = [
  {value: 'under_20', vi: '≤ 20 thùng', en: '≤ 20 boxes'},
  {value: '20_50', vi: '20–50 thùng', en: '20–50 boxes'},
  {value: 'over_50', vi: '50+ thùng', en: '50+ boxes'},
  {value: 'unknown', vi: 'Tôi chưa biết', en: 'Not sure yet'}
];

export function StorageFinder({units}: StorageFinderProps) {
  const locale = (useLocale() === 'en' ? 'en' : 'vi') as 'vi' | 'en';
  const [need, setNeed] = useState<StorageNeed | null>(null);
  const [volume, setVolume] = useState<StorageVolume | null>(null);

  const recommendation = useMemo(() => {
    if (!need || !volume || units.length === 0) return null;
    const base = recommendStorage({need, volume}, units);
    const displayUnit = units.find((unit) => unit.id === base.unit.id) ?? units[0];
    return {...base, unit: displayUnit};
  }, [need, volume, units]);

  if (units.length === 0) {
    return (
      <section
        aria-labelledby="storage-finder-title"
        className="overflow-hidden rounded-3xl border border-[var(--nupsbox-border)] bg-white shadow-[var(--nupsbox-shadow-sm)]"
      >
        <div className="grid lg:grid-cols-[.7fr_1.3fr]">
          <div className="bg-[linear-gradient(145deg,var(--nupsbox-navy),#0c326d)] p-6 text-white sm:p-7 lg:p-8">
            <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.15em] text-[var(--nupsbox-yellow)]">
              Storage Finder
            </p>
            <h2
              id="storage-finder-title"
              className="mt-3 max-w-lg text-[clamp(2rem,3vw,2.8rem)] font-extrabold leading-[1.06] tracking-[-0.035em]"
            >
              {locale === 'vi' ? 'Thông tin loại kho đang được cập nhật.' : 'Storage options are being updated.'}
            </h2>
          </div>
          <div className="p-5 sm:p-7 lg:p-8">
            <p className="max-w-xl text-sm leading-6 text-[var(--nupsbox-slate)] sm:text-base">
              {locale === 'vi'
                ? 'Website chưa có loại kho đã được xác nhận để đưa ra gợi ý. Bạn vẫn có thể gửi nhu cầu để NupsBox tư vấn trực tiếp.'
                : 'There are no verified unit types available for an automated recommendation yet. You can still send your requirements for direct advice.'}
            </p>
            <Link
              href="/lien-he"
              className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[var(--nupsbox-blue)] px-5 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nupsbox-blue)] focus-visible:ring-offset-2"
            >
              {locale === 'vi' ? 'Gửi nhu cầu' : 'Send your requirements'}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  function chooseNeed(value: StorageNeed) {
    if (!need) trackEvent('storage_finder_start', {need: value});
    if (need !== value) setVolume(null);
    setNeed(value);
  }

  function chooseVolume(value: StorageVolume) {
    setVolume(value);
    if (need) trackEvent('storage_finder_complete', {need, volume: value});
  }

  return (
    <section
      aria-labelledby="storage-finder-title"
      className="overflow-hidden rounded-3xl border border-[var(--nupsbox-border)] bg-white shadow-[var(--nupsbox-shadow-sm)]"
    >
      <div className="grid lg:grid-cols-[.7fr_1.3fr]">
        <div className="bg-[linear-gradient(145deg,var(--nupsbox-navy),#0c326d)] p-6 text-white sm:p-7 lg:p-8">
          <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.15em] text-[var(--nupsbox-yellow)]">
            Storage Finder
          </p>
          <h2
            id="storage-finder-title"
            className="mt-3 max-w-lg text-[clamp(2rem,3vw,2.8rem)] font-extrabold leading-[1.06] tracking-[-0.035em]"
          >
            {locale === 'vi' ? 'Kho nào phù hợp với bạn?' : 'Which storage size fits you?'}
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/68 sm:text-base">
            {locale === 'vi'
              ? 'Trả lời hai câu hỏi ngắn. Bạn sẽ thấy gợi ý trước khi cần để lại thông tin.'
              : 'Answer two quick questions. You will see a recommendation before sharing contact details.'}
          </p>

          <div
            className="mt-6 flex items-center gap-2.5 text-xs font-bold text-white/56"
            aria-label={locale === 'vi' ? 'Tiến trình tìm kho' : 'Storage finder progress'}
          >
            <span className={`grid size-8 place-items-center rounded-full border ${need ? 'border-[var(--nupsbox-yellow)] bg-[var(--nupsbox-yellow)] text-[var(--nupsbox-navy)]' : 'border-white/20'}`}>1</span>
            <span className="h-px flex-1 bg-white/14" />
            <span className={`grid size-8 place-items-center rounded-full border ${volume ? 'border-[var(--nupsbox-yellow)] bg-[var(--nupsbox-yellow)] text-[var(--nupsbox-navy)]' : 'border-white/20'}`}>2</span>
            <span className="h-px flex-1 bg-white/14" />
            <span className={`grid size-8 place-items-center rounded-full border ${recommendation ? 'border-[var(--nupsbox-yellow)] bg-[var(--nupsbox-yellow)] text-[var(--nupsbox-navy)]' : 'border-white/20'}`}>✓</span>
          </div>
        </div>

        <div className="p-5 sm:p-7 lg:p-8">
          <fieldset>
            <legend className="text-xs font-extrabold uppercase tracking-[0.11em] text-[var(--nupsbox-blue)] sm:text-sm">
              {locale === 'vi' ? 'Bước 1 · Bạn cần kho cho?' : 'Step 1 · What do you need storage for?'}
            </legend>
            <div className="mt-3.5 grid gap-2 sm:grid-cols-2">
              {needOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={need === option.value}
                  onClick={() => chooseNeed(option.value)}
                  className={`min-h-12 rounded-xl border px-4 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nupsbox-blue)] focus-visible:ring-offset-2 ${
                    need === option.value
                      ? 'border-[var(--nupsbox-blue)] bg-[var(--nupsbox-blue)] text-white shadow-sm'
                      : 'border-[var(--nupsbox-border)] bg-white text-[var(--nupsbox-navy)] hover:border-[var(--nupsbox-blue)] hover:bg-[var(--nupsbox-surface)]'
                  }`}
                >
                  {option[locale]}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-6" disabled={!need}>
            <legend className="text-xs font-extrabold uppercase tracking-[0.11em] text-[var(--nupsbox-blue)] sm:text-sm">
              {locale === 'vi' ? 'Bước 2 · Bạn có khoảng bao nhiêu hàng?' : 'Step 2 · Roughly how much do you store?'}
            </legend>
            <div className="mt-3.5 grid gap-2 sm:grid-cols-2">
              {volumeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={volume === option.value}
                  onClick={() => chooseVolume(option.value)}
                  className={`min-h-12 rounded-xl border px-4 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nupsbox-blue)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${
                    volume === option.value
                      ? 'border-[var(--nupsbox-yellow-warm)] bg-[var(--nupsbox-yellow)] text-[var(--nupsbox-navy)]'
                      : 'border-[var(--nupsbox-border)] bg-white text-[var(--nupsbox-navy)] hover:border-[var(--nupsbox-blue)] hover:bg-[var(--nupsbox-surface)]'
                  }`}
                >
                  {option[locale]}
                </button>
              ))}
            </div>
          </fieldset>

          {recommendation && need && volume ? (
            <div className="mt-6 border-t border-[var(--nupsbox-border)] pt-6">
              <StorageResult recommendation={recommendation} input={{need, volume}} locale={locale} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
