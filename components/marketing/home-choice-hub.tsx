'use client';

import {useState, type KeyboardEvent} from 'react';
import dynamic from 'next/dynamic';
import {ArrowRight} from 'lucide-react';
import {StorageFinder} from '@/components/storage-finder/storage-finder';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
import type {PublicUnitType} from '@/features/catalog/types';

type ChoiceTab = 'finder' | 'units' | 'use-cases';

type FinderUnit = Pick<PublicUnitType, 'id' | 'slug' | 'name' | 'areaM2' | 'sortOrder'>;

function LazyPanelPlaceholder() {
  return (
    <div
      className="grid min-h-48 place-items-center rounded-2xl border border-[var(--nupsbox-border)] bg-white p-6 text-sm text-[var(--nupsbox-slate)]"
      role="status"
      aria-live="polite"
    >
      <span className="inline-flex items-center gap-3">
        <span className="size-4 animate-pulse rounded-full bg-[var(--nupsbox-yellow)]" aria-hidden="true" />
        Đang tải / Loading…
      </span>
    </div>
  );
}

const HomeUnitOptionsPanel = dynamic(
  () => import('./home-unit-options-panel').then((module) => module.HomeUnitOptionsPanel),
  {loading: () => <LazyPanelPlaceholder />}
);

const HomeUseCasesPanel = dynamic(
  () => import('./home-use-cases-panel').then((module) => module.HomeUseCasesPanel),
  {loading: () => <LazyPanelPlaceholder />}
);

export function HomeChoiceHub({
  units,
  finderUnits,
  locale
}: {
  units: PublicUnitType[];
  finderUnits: FinderUnit[];
  locale: 'vi' | 'en';
}) {
  const vi = locale === 'vi';
  const [activeTab, setActiveTab] = useState<ChoiceTab>('finder');

  const tabs: Array<{id: ChoiceTab; label: string; index: string}> = [
    {id: 'finder', label: vi ? 'Tìm nhanh' : 'Quick finder', index: '01'},
    {id: 'units', label: vi ? 'Loại kho' : 'Unit types', index: '02'},
    {id: 'use-cases', label: vi ? 'Theo nhu cầu' : 'By need', index: '03'}
  ];

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentId: ChoiceTab) {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(event.key)) return;

    event.preventDefault();
    const currentIndex = tabs.findIndex((tab) => tab.id === currentId);
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? tabs.length - 1
        : event.key === 'ArrowRight'
          ? (currentIndex + 1) % tabs.length
          : (currentIndex - 1 + tabs.length) % tabs.length;
    const nextId = tabs[nextIndex].id;

    setActiveTab(nextId);
    document.getElementById(`choice-tab-${nextId}`)?.focus();
  }

  return (
    <Section tone="soft" size="compact">
      <div id="storage-finder" className="scroll-mt-24">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow={vi ? 'CHỌN KHO PHÙ HỢP' : 'CHOOSE WHAT FITS'}
            title={vi ? 'Bắt đầu từ điều bạn biết.' : 'Start with what you know.'}
            description={vi
              ? 'Dùng gợi ý nhanh, xem loại kho hoặc bắt đầu từ tình huống gần với nhu cầu của bạn.'
              : 'Use the quick finder, browse unit types, or start from the situation closest to your needs.'}
          />

          <div
            role="tablist"
            aria-label={vi ? 'Cách chọn kho' : 'Ways to choose storage'}
            className="grid w-full grid-cols-3 border-y border-[var(--nupsbox-border)] bg-transparent lg:w-auto lg:min-w-[31rem]"
          >
            {tabs.map(({id, label, index}) => (
              <button
                key={id}
                id={`choice-tab-${id}`}
                type="button"
                role="tab"
                aria-selected={activeTab === id}
                aria-controls={`choice-panel-${id}`}
                tabIndex={activeTab === id ? 0 : -1}
                onClick={() => setActiveTab(id)}
                onKeyDown={(event) => handleTabKeyDown(event, id)}
                className={`group inline-flex min-h-14 items-center justify-center gap-2 border-b-2 px-3 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nupsbox-blue)] focus-visible:ring-offset-2 ${
                  activeTab === id
                    ? 'border-[var(--nupsbox-navy)] text-[var(--nupsbox-navy)]'
                    : 'border-transparent text-[var(--nupsbox-slate)] hover:text-[var(--nupsbox-navy)]'
                }`}
              >
                <span aria-hidden="true" className="text-[0.64rem] tracking-[0.12em] text-[var(--nupsbox-muted)]">{index}</span>
                {label}
                {activeTab === id ? <ArrowRight size={14} aria-hidden="true" /> : null}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-7">
          <div
            id="choice-panel-finder"
            role="tabpanel"
            aria-labelledby="choice-tab-finder"
            hidden={activeTab !== 'finder'}
          >
            <StorageFinder units={finderUnits} />
          </div>

          <div
            id="choice-panel-units"
            role="tabpanel"
            aria-labelledby="choice-tab-units"
            hidden={activeTab !== 'units'}
          >
            {activeTab === 'units' ? (
              <HomeUnitOptionsPanel units={units} locale={locale} />
            ) : null}
          </div>

          <div
            id="choice-panel-use-cases"
            role="tabpanel"
            aria-labelledby="choice-tab-use-cases"
            hidden={activeTab !== 'use-cases'}
          >
            {activeTab === 'use-cases' ? (
              <HomeUseCasesPanel locale={locale} />
            ) : null}
          </div>
        </div>
      </div>
    </Section>
  );
}
