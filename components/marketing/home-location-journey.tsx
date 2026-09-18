import {Boxes, MapPin, MessageCircleMore} from 'lucide-react';
import {LocationCard} from '@/components/locations/location-card';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
import type {PublicLocation} from '@/features/catalog/types';

export function HomeLocationJourney({
  location,
  locale
}: {
  location: PublicLocation | null;
  locale: 'vi' | 'en';
}) {
  const vi = locale === 'vi';

  const steps = vi
    ? [
        ['01', 'Tìm lựa chọn phù hợp', 'Dùng Finder, xem loại kho hoặc bắt đầu từ nhu cầu của bạn.'],
        ['02', 'Nhận báo giá hoặc đề xuất lịch xem', 'Chọn bước tiếp theo mà không phải điền nhiều hơn mức cần thiết.'],
        ['03', 'NupsBox xác nhận', 'Giá, tình trạng và lịch xem được xác nhận trước khi bạn quyết định thuê.']
      ]
    : [
        ['01', 'Find a suitable option', 'Use Finder, browse unit types or start from your specific need.'],
        ['02', 'Request a quote or viewing', 'Choose the next step without unnecessary form friction.'],
        ['03', 'NupsBox confirms', 'Pricing, status and viewing time are confirmed before you decide to rent.']
      ];

  const proof = vi
    ? [
        [MapPin, 'Địa điểm rõ ràng', 'Chỉ hiển thị thông tin cơ sở đã được công bố.'],
        [Boxes, 'Kích thước cụ thể', 'Diện tích và gợi ý sử dụng theo dữ liệu đang có.'],
        [MessageCircleMore, 'Xác nhận trước khi thuê', 'Giá và tình trạng được xác nhận qua kênh tư vấn.']
      ] as const
    : [
        [MapPin, 'Clear location data', 'Only published facility information is displayed.'],
        [Boxes, 'Specific unit sizes', 'Area and use guidance reflect the data currently available.'],
        [MessageCircleMore, 'Confirm before renting', 'Pricing and status are reconfirmed through the enquiry channel.']
      ] as const;

  return (
    <Section tone="soft" size="compact">
      <div className="grid gap-7 lg:grid-cols-[.88fr_1.12fr] lg:items-start">
        <div>
          <SectionHeading
            eyebrow={vi ? 'TỪ NHU CẦU ĐẾN BƯỚC TIẾP THEO' : 'FROM NEED TO NEXT STEP'}
            title={vi ? 'Ba bước rõ ràng, không tạo cảm giác đặt chỗ tức thời.' : 'Three clear steps without pretending it is an instant reservation.'}
            description={vi
              ? 'Bạn hiểu loại kho trước, sau đó mới chuyển sang báo giá hoặc xem kho.'
              : 'Understand the storage option first, then move into quote or viewing intent.'}
          />

          {location ? (
            <div className="mt-6">
              <LocationCard location={location} locale={locale} />
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-[var(--nupsbox-border)] bg-white p-5 text-sm leading-6 text-[var(--nupsbox-slate)]" role="status">
              <p className="font-extrabold text-[var(--nupsbox-navy)]">
                {vi ? 'Thông tin cơ sở đang được cập nhật.' : 'Facility information is being updated.'}
              </p>
              <p className="mt-1">
                {vi
                  ? 'Địa chỉ chỉ xuất hiện sau khi được NupsBox xác nhận và công bố.'
                  : 'An address appears only after NupsBox has verified and published it.'}
              </p>
            </div>
          )}
        </div>

        <div>
          <ol className="grid gap-3">
            {steps.map(([number, title, body]) => (
              <li
                key={number}
                className="grid grid-cols-[auto_1fr] gap-4 rounded-2xl border border-[var(--nupsbox-border)] bg-white p-4 sm:p-5"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-[var(--nupsbox-navy)] text-sm font-extrabold text-[var(--nupsbox-yellow)]">
                  {number}
                </span>
                <div>
                  <h3 className="font-extrabold text-[var(--nupsbox-navy)]">{title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-[var(--nupsbox-slate)]">{body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {proof.map(([Icon, title, body]) => (
              <article key={title} className="rounded-2xl bg-[var(--nupsbox-navy)] p-4 text-white">
                <Icon size={19} className="text-[var(--nupsbox-yellow)]" aria-hidden="true" />
                <h3 className="mt-3 text-sm font-extrabold">{title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-white/64">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
