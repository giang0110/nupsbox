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
    setNeed(value);
  }

  function chooseVolume(value: StorageVolume) {
    setVolume(value);
    if (need) trackEvent('storage_finder_complete', {need, volume: value});
  }

  return (
    <section aria-labelledby="storage-finder-title" className="rounded-[2rem] border border-[var(--nupsbox-border)] bg-white p-5 shadow-[var(--nupsbox-shadow)] sm:p-8 lg:p-10">
      <div className="max-w-2xl">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--nupsbox-blue)]">Storage Finder</p>
        <h2 id="storage-finder-title" className="mt-2 text-3xl font-black tracking-[-0.045em] text-[var(--nupsbox-navy)] sm:text-4xl">
          {locale === 'vi' ? 'Kho nào phù hợp với bạn?' : 'Which storage size fits you?'}
        </h2>
      </div>

      <fieldset className="mt-8">
        <legend className="text-sm font-bold text-[var(--nupsbox-navy)]">
          1. {locale === 'vi' ? 'Bạn cần kho cho?' : 'What do you need storage for?'}
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {needOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={need === option.value}
              onClick={() => chooseNeed(option.value)}
              className={`min-h-11 rounded-full border px-4 text-sm font-semibold transition ${
                need === option.value
                  ? 'border-[var(--nupsbox-blue)] bg-[var(--nupsbox-blue)] text-white'
                  : 'border-[var(--nupsbox-border)] bg-white text-[var(--nupsbox-navy)] hover:border-[var(--nupsbox-blue)]'
              }`}
            >
              {option[locale]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6" disabled={!need}>
        <legend className="text-sm font-bold text-[var(--nupsbox-navy)]">
          2. {locale === 'vi' ? 'Bạn có khoảng bao nhiêu hàng?' : 'Roughly how much do you store?'}
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {volumeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={volume === option.value}
              onClick={() => chooseVolume(option.value)}
              className={`min-h-11 rounded-full border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${
                volume === option.value
                  ? 'border-[var(--nupsbox-yellow-warm)] bg-[var(--nupsbox-yellow)] text-[var(--nupsbox-navy)]'
                  : 'border-[var(--nupsbox-border)] bg-white text-[var(--nupsbox-navy)] hover:border-[var(--nupsbox-blue)]'
              }`}
            >
              {option[locale]}
            </button>
          ))}
        </div>
      </fieldset>

      {recommendation ? <div className="mt-8"><StorageResult recommendation={recommendation} locale={locale} /></div> : null}
    </section>
  );
}
