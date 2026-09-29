import {ArrowRight, Boxes, BriefcaseBusiness, House, MapPin, PackageSearch, Store} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {Section} from '@/components/ui/section';
import type {PublicLocation, PublicUnitType} from '@/features/catalog/types';
import type {CommercialContent} from '@/features/content/commercial-content';

export function HomeDecisionHub({
  locale,
  location,
  units,
  commercial
}: {
  locale: 'vi' | 'en';
  location: PublicLocation | null;
  units: PublicUnitType[];
  commercial: CommercialContent;
}) {
  const vi = locale === 'vi';
  const minArea = units.length ? Math.min(...units.map(unit => unit.areaM2)) : null;
  const maxArea = units.length ? Math.max(...units.map(unit => unit.areaM2)) : null;

  const useCases = [
    {href: '/giai-phap/shop-online' as const, icon: Store, copy: commercial.serviceGroups.shopOnline},
    {href: '/giai-phap/doanh-nghiep-nho' as const, icon: BriefcaseBusiness, copy: commercial.serviceGroups.smallBusiness},
    {href: '/giai-phap/chua-hang' as const, icon: Boxes, copy: commercial.serviceGroups.inventory},
    {href: '/giai-phap/ca-nhan' as const, icon: House, copy: commercial.serviceGroups.personal}
  ];

  return (
    <Section size="compact">
      <div className="grid overflow-hidden rounded-[2rem] border border-[var(--nupsbox-border)] bg-white shadow-[0_20px_60px_rgba(7,26,56,.07)] lg:grid-cols-[1.25fr_.75fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <p className="text-[0.7rem] font-black uppercase tracking-[0.16em] text-[var(--nupsbox-blue)]">
            {vi ? 'CHỌN THEO TÌNH HUỐNG' : 'CHOOSE BY SITUATION'}
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <h2 className="max-w-2xl text-[clamp(2rem,4vw,3.35rem)] font-extrabold leading-[1.02] tracking-[-0.045em] text-[var(--nupsbox-navy)]">
              {vi ? 'Bạn đang cần giải quyết bài toán nào?' : 'What problem are you trying to solve?'}
            </h2>
            <Link href="/giai-phap" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[var(--nupsbox-blue)] hover:underline">
              {vi ? 'Xem tất cả giải pháp' : 'View all solutions'}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-7 grid border-t border-[var(--nupsbox-border)] sm:grid-cols-2">
            {useCases.map(({href, icon: Icon, copy}, index) => (
              <Link
                key={href}
                href={href}
                className={
                  'group grid grid-cols-[auto_1fr_auto] gap-3 border-b border-[var(--nupsbox-border)] py-5 transition hover:bg-[var(--nupsbox-surface)] sm:px-5 ' +
                  (index % 2 === 0 ? 'sm:border-r sm:pl-0' : 'sm:pr-0')
                }
              >
                <span className="mt-0.5 grid size-10 place-items-center rounded-full bg-[var(--nupsbox-surface)] text-[var(--nupsbox-blue)] group-hover:bg-white">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-extrabold text-[var(--nupsbox-navy)]">{copy.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--nupsbox-slate)]">{copy.description}</p>
                </div>
                <ArrowRight size={16} aria-hidden="true" className="mt-3 text-[var(--nupsbox-muted)] transition group-hover:translate-x-1 group-hover:text-[var(--nupsbox-blue)]" />
              </Link>
            ))}
          </div>
        </div>

        <aside className="relative overflow-hidden bg-[var(--nupsbox-navy)] p-6 text-white sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_12%,rgba(255,211,26,.17),transparent_30%)]" />
          <div className="relative">
            <p className="text-[0.7rem] font-black uppercase tracking-[0.16em] text-[var(--nupsbox-yellow)]">
              {vi ? 'KIỂM TRA TRƯỚC KHI LIÊN HỆ' : 'CHECK BEFORE YOU ENQUIRE'}
            </p>
            <h3 className="mt-3 text-2xl font-extrabold tracking-[-0.035em]">
              {vi ? 'Ba dữ liệu giúp bạn quyết định nhanh hơn.' : 'Three facts that make the decision easier.'}
            </h3>

            <dl className="mt-7 divide-y divide-white/12 border-y border-white/12">
              <div className="grid grid-cols-[auto_1fr] gap-3 py-4">
                <MapPin size={18} className="mt-0.5 text-[var(--nupsbox-yellow)]" aria-hidden="true" />
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.12em] text-white/50">{vi ? 'Cơ sở' : 'Facility'}</dt>
                  <dd className="mt-1 text-sm font-bold">{location ? location.district + ', ' + location.city : (vi ? 'Đang cập nhật' : 'Being updated')}</dd>
                </div>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-3 py-4">
                <PackageSearch size={18} className="mt-0.5 text-[var(--nupsbox-yellow)]" aria-hidden="true" />
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.12em] text-white/50">{vi ? 'Khoảng diện tích đang hiển thị' : 'Published size range'}</dt>
                  <dd className="mt-1 text-sm font-bold">
                    {minArea !== null && maxArea !== null
                      ? minArea.toFixed(2) + '–' + maxArea.toFixed(2) + ' m²'
                      : (vi ? 'Theo catalog hiện tại' : 'Based on current catalog')}
                  </dd>
                </div>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-3 py-4">
                <Boxes size={18} className="mt-0.5 text-[var(--nupsbox-yellow)]" aria-hidden="true" />
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.12em] text-white/50">{vi ? 'Nguyên tắc' : 'Principle'}</dt>
                  <dd className="mt-1 text-sm font-bold">{vi ? 'Giá & tình trạng luôn xác nhận lại' : 'Pricing & availability are reconfirmed'}</dd>
                </div>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
              <Link href="/dia-diem" className="text-sm font-bold text-white hover:underline">
                {vi ? 'Xem cơ sở →' : 'View facilities →'}
              </Link>
              <Link href="/cau-hoi-thuong-gap" className="text-sm font-bold text-white/70 hover:text-white hover:underline">
                {vi ? 'Câu hỏi thường gặp →' : 'FAQs →'}
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </Section>
  );
}
