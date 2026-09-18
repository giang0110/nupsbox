'use client';

import {useState, type KeyboardEvent} from 'react';
import {
  Archive,
  Boxes,
  BriefcaseBusiness,
  House,
  Package,
  Sparkles
} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {StorageFinder} from '@/components/storage-finder/storage-finder';
import {UnitCard} from '@/components/units/unit-card';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
import type {PublicUnitType} from '@/features/catalog/types';

type ChoiceTab = 'finder' | 'units' | 'use-cases';

type FinderUnit = Pick<PublicUnitType, 'id' | 'slug' | 'name' | 'areaM2' | 'sortOrder'>;

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

  const tabs: Array<{id: ChoiceTab; label: string; icon: typeof Sparkles}> = [
    {id: 'finder', label: vi ? 'Tìm nhanh' : 'Quick finder', icon: Sparkles},
    {id: 'units', label: vi ? 'Loại kho' : 'Unit types', icon: Boxes},
    {id: 'use-cases', label: vi ? 'Theo nhu cầu' : 'By need', icon: BriefcaseBusiness}
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
    requestAnimationFrame(() => {
      document.getElementById(`choice-tab-${nextId}`)?.focus();
    });
  }

  const useCases = vi
    ? [
        [Package, 'Bán hàng online', 'Tách hàng hóa khỏi không gian sống và có điểm lưu trữ riêng cho vận hành shop.', '/giai-phap/shop-online'],
        [BriefcaseBusiness, 'Doanh nghiệp nhỏ', 'Thêm chỗ cho hàng mẫu, thiết bị và tồn kho mà không cần thuê mặt bằng lớn.', '/giai-phap/doanh-nghiep-nho'],
        [Archive, 'Hàng tồn & hồ sơ', 'Giữ những thứ vẫn cần nhưng không phải nằm ngay tại nơi làm việc.', '/giai-phap/chua-hang'],
        [House, 'Đồ cá nhân', 'Giải phóng diện tích nhà ở với một không gian lưu trữ riêng.', '/giai-phap/ca-nhan']
      ] as const
    : [
        [Package, 'Online selling', 'Separate inventory from your living space with a dedicated operating base.', '/giai-phap/shop-online'],
        [BriefcaseBusiness, 'Small business', 'Add room for samples, equipment and inventory without another large lease.', '/giai-phap/doanh-nghiep-nho'],
        [Archive, 'Inventory & files', 'Keep business items you still need without crowding the workspace.', '/giai-phap/chua-hang'],
        [House, 'Personal storage', 'Free up room at home with a separate storage space.', '/giai-phap/ca-nhan']
      ] as const;

  return (
    <Section tone="soft" size="compact">
      <div id="storage-finder" className="scroll-mt-24">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow={vi ? 'CHỌN KHO PHÙ HỢP' : 'CHOOSE WHAT FITS'}
            title={vi ? 'Một nơi để bắt đầu, ba cách để tìm.' : 'One place to start, three ways to explore.'}
            description={vi
              ? 'Dùng gợi ý nhanh, xem loại kho hoặc bắt đầu từ tình huống gần với nhu cầu của bạn.'
              : 'Use the quick finder, browse unit types, or start from the situation closest to your needs.'}
          />

          <div
            role="tablist"
            aria-label={vi ? 'Cách chọn kho' : 'Ways to choose storage'}
            className="inline-flex w-full gap-1 rounded-2xl border border-[var(--nupsbox-border)] bg-white p-1.5 shadow-[var(--nupsbox-shadow-sm)] lg:w-auto"
          >
            {tabs.map(({id, label, icon: Icon}) => (
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
                className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nupsbox-blue)] focus-visible:ring-offset-2 lg:flex-none ${
                  activeTab === id
                    ? 'bg-[var(--nupsbox-navy)] text-white shadow-sm'
                    : 'text-[var(--nupsbox-slate)] hover:bg-[var(--nupsbox-surface)] hover:text-[var(--nupsbox-navy)]'
                }`}
              >
                <Icon size={17} aria-hidden="true" />
                {label}
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
            {units.length ? (
              <div className="grid gap-4 lg:grid-cols-3">
                {units.map((unit) => <UnitCard key={unit.id} unit={unit} locale={locale} />)}
              </div>
            ) : (
              <div className="rounded-2xl border border-[var(--nupsbox-border)] bg-white p-6 text-sm leading-6 text-[var(--nupsbox-slate)]" role="status">
                <p className="font-bold text-[var(--nupsbox-navy)]">
                  {vi ? 'Chưa có loại kho được công bố.' : 'No storage unit types are currently published.'}
                </p>
                <p className="mt-1">
                  {vi
                    ? 'NupsBox sẽ hiển thị diện tích, giá và tình trạng sau khi dữ liệu được xác nhận.'
                    : 'NupsBox will show area, pricing and status after the data has been verified.'}
                </p>
              </div>
            )}
          </div>

          <div
            id="choice-panel-use-cases"
            role="tabpanel"
            aria-labelledby="choice-tab-use-cases"
            hidden={activeTab !== 'use-cases'}
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {useCases.map(([Icon, title, body, href]) => (
                <Link
                  key={title}
                  href={href}
                  className="group rounded-2xl border border-[var(--nupsbox-border)] bg-white p-5 transition hover:-translate-y-px hover:shadow-[var(--nupsbox-shadow-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nupsbox-blue)] focus-visible:ring-offset-2"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-[var(--nupsbox-yellow)] text-[var(--nupsbox-navy)]">
                    <Icon size={19} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-extrabold tracking-[-0.02em] text-[var(--nupsbox-navy)]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--nupsbox-slate)]">{body}</p>
                  <span className="mt-4 inline-flex text-sm font-bold text-[var(--nupsbox-blue)]">
                    {vi ? 'Xem giải pháp →' : 'View solution →'}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
