import {BadgeCheck, Camera, Ruler, MessageCircleMore} from 'lucide-react';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
import type {PublicLocation, PublicUnitType} from '@/features/catalog/types';

export function HomeProofBento({
  locale,
  location,
  units
}: {
  locale: 'vi' | 'en';
  location: PublicLocation | null;
  units: PublicUnitType[];
}) {
  const vi = locale === 'vi';
  const minArea = units.length ? Math.min(...units.map((unit) => unit.areaM2)) : null;
  const maxArea = units.length ? Math.max(...units.map((unit) => unit.areaM2)) : null;

  const proof = [
    {
      icon: Camera,
      title: vi ? 'Hình ảnh thực tế' : 'Real facility imagery',
      body: vi
        ? 'Ảnh kho được quản lý theo từng cơ sở để bạn hình dung không gian trước khi liên hệ.'
        : 'Facility imagery is managed by location so you can understand the space before contacting us.'
    },
    {
      icon: Ruler,
      title: vi ? 'Diện tích minh bạch' : 'Clear unit sizing',
      body: minArea !== null && maxArea !== null
        ? (vi
            ? `Các loại kho đang hiển thị từ ${minArea.toFixed(2)} đến ${maxArea.toFixed(2)} m².`
            : `Published unit types currently range from ${minArea.toFixed(2)} to ${maxArea.toFixed(2)} m².`)
        : (vi ? 'Kích thước hiển thị theo dữ liệu hiện có.' : 'Unit sizing reflects currently available data.')
    },
    {
      icon: BadgeCheck,
      title: vi ? 'Thông tin rõ ràng' : 'Clear information',
      body: location
        ? (vi ? `Cơ sở đang hiển thị tại ${location.district}, ${location.city}.` : `The current facility is listed in ${location.district}, ${location.city}.`)
        : (vi ? 'Thông tin cơ sở được hiển thị khi đã có dữ liệu.' : 'Facility information appears when data is available.')
    },
    {
      icon: MessageCircleMore,
      title: vi ? 'Xác nhận trước khi thuê' : 'Confirm before renting',
      body: vi
        ? 'Báo giá, tình trạng và lịch xem được xác nhận lại trước khi bạn quyết định.'
        : 'Pricing, availability and viewing details are reconfirmed before you decide.'
    }
  ];

  return (
    <Section size="compact">
      <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-start lg:gap-12">
        <SectionHeading
          eyebrow={vi ? 'VÌ SAO NUPSBOX' : 'WHY NUPSBOX'}
          title={vi ? 'Ít lời hứa. Nhiều thông tin hữu ích hơn.' : 'Fewer promises. More useful information.'}
          description={vi
            ? 'NupsBox tập trung vào những điều bạn cần để ra quyết định: hình ảnh, diện tích, địa điểm và bước xác nhận tiếp theo.'
            : 'NupsBox focuses on what helps you decide: imagery, sizing, location and the next confirmation step.'}
        />

        <div className="divide-y divide-[var(--nupsbox-border)] border-y border-[var(--nupsbox-border)]">
          {proof.map(({icon: Icon, title, body}) => (
            <article key={title} className="grid gap-4 py-5 sm:grid-cols-[auto_1fr] sm:items-start sm:py-6">
              <span className="grid size-11 place-items-center rounded-full bg-[var(--nupsbox-surface)] text-[var(--nupsbox-blue)]">
                <Icon size={19} aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-base font-extrabold text-[var(--nupsbox-navy)] sm:text-lg">{title}</h3>
                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--nupsbox-slate)]">{body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
