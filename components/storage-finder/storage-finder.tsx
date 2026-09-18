'use client';

import {useMemo, useState} from 'react';
import {useLocale} from 'next-intl';
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
    <section aria-labelledby="storage-finder-title" className="overflow-hidden rounded-[2rem] border border-[var(--nupsbox-border)] bg-white shadow-[var(--nupsbox-shadow)]">
      <div className="grid gap-0 lg:grid-cols-[.72fr_1.28fr]">
        <div className="bg-[var(--nupsbox-navy)] p-6 text-white sm:p-8 lg:p-10">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--nupsbox-yellow)]">Storage Finder</p>
          <h2 id="storage-finder-title" className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
            {locale === 'vi' ? 'Kho nào phù hợp với bạn?' : 'Which storage size fits you?'}
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-6 text-white/68 sm:text-base">
            {locale === 'vi'
              ? 'Trả lời hai câu hỏi ngắn. Bạn sẽ thấy gợi ý trước khi cần để lại thông tin.'
              : 'Answer two quick questions. You will see a recommendation before sharing contact details.'}
          </p>
          <div className="mt-8 flex items-center gap-3 text-xs font-bold text-white/58" aria-label={locale === 'vi' ? 'Tiến trình tìm kho' : 'Storage finder progress'}>
            <span className={`grid size-8 place-items-center rounded-full border ${need ? 'border-[var(--nupsbox-yellow)] bg-[var(--nupsbox-yellow)] text-[var(--nupsbox-navy)]' : 'border-white/20'}`}>1</span>
            <span className="h-px flex-1 bg-white/15" />
            <span className={`grid size-8 place-items-center rounded-full border ${volume ? 'border-[var(--nupsbox-yellow)] bg-[var(--nupsbox-yellow)] text-[var(--nupsbox-navy)]' : 'border-white/20'}`}>2</span>
            <span className="h-px flex-1 bg-white/15" />
            <span className={`grid size-8 place-items-center rounded-full border ${recommendation ? 'border-[var(--nupsbox-yellow)] bg-[var(--nupsbox-yellow)] text-[var(--nupsbox-navy)]' : 'border-white/20'}`}>✓</span>
          </div>
        </div>

        <div className="p-5 sm:p-8 lg:p-10">
          <fieldset>
            <legend className="text-sm font-black uppercase tracking-[0.12em] text-[var(--nupsbox-blue)]">
              {locale === 'vi' ? 'Bước 1 · Bạn cần kho cho?' : 'Step 1 · What do you need storage for?'}
            </legend>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {needOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={need === option.value}
                  onClick={() => chooseNeed(option.value)}
                  className={`min-h-12 rounded-2xl border px-4 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nupsbox-blue)] focus-visible:ring-offset-2 ${
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

          <fieldset className="mt-7" disabled={!need}>
            <legend className="text-sm font-black uppercase tracking-[0.12em] text-[var(--nupsbox-blue)]">
              {locale === 'vi' ? 'Bước 2 · Bạn có khoảng bao nhiêu hàng?' : 'Step 2 · Roughly how much do you store?'}
            </legend>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {volumeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={volume === option.value}
                  onClick={() => chooseVolume(option.value)}
                  className={`min-h-12 rounded-2xl border px-4 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nupsbox-blue)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${
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
            <div className="mt-8 border-t border-[var(--nupsbox-border)] pt-8">
              <StorageResult recommendation={recommendation} input={{need, volume}} locale={locale} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
