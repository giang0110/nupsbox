import Image from 'next/image';
import {BadgeCheck, ChevronDown, MapPin, MessageCircleMore, Ruler} from 'lucide-react';
import {ConversionCta} from '@/components/marketing/conversion-cta';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
import type {PublicLocation, PublicUnitType} from '@/features/catalog/types';

const facilityImage =
  'https://siaodieqxzlarnvfppox.supabase.co/storage/v1/object/public/onboarding-photos/nupsbox-tan-phu/corridor-1.jpg';

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
  const minArea = units.length ? Math.min(...units.map((unit) => unit.areaM2) ) : null;
  const maxArea = units.length ? Math.max(...units.map((unit) => unit.areaM2) ) : null;

  const locationBody = location
    ? (vi
        ? `${location.district}, ${location.city} — theo thông tin cơ sở đang được công bố.`
        : `${location.district}, ${location.city} — based on the currently published facility record.`)
    : (vi
        ? 'Địa điểm chỉ xuất hiện khi có bản ghi cơ sở đã được công bố.'
        : 'A location appears only when a published facility record is available.');

  const unitBody = units.length && minArea !== null && maxArea !== null
    ? (vi
        ? `${units.length} loại kho đang hiển thị, từ ${minArea.toFixed(2)} đến ${maxArea.toFixed(2)} m².`
        : `${units.length} published unit types, from ${minArea.toFixed(2)} to ${maxArea.toFixed(2)} m².`)
    : (vi
        ? 'Diện tích và loại kho chỉ hiển thị sau khi dữ liệu được xác nhận.'
        : 'Unit sizes and types appear only after the data has been verified.');

  const benefits = [
    [MapPin, location ? location.name : (vi ? 'Địa điểm công bố' : 'Published location'), locationBody],
    [Ruler, vi ? 'Kích thước cụ thể' : 'Specific unit sizes', unitBody],
    [BadgeCheck, vi ? 'Dữ liệu có nguồn' : 'Source-backed data', vi ? 'Giá, tình trạng và thông tin catalog chỉ hiển thị từ dữ liệu NupsBox đang duy trì.' : 'Pricing, status and catalog details are shown only from data maintained by NupsBox.'],
    [MessageCircleMore, vi ? 'Xác nhận trước khi thuê' : 'Confirm before renting', vi ? 'Báo giá, tình trạng và lịch xem được xác nhận lại qua luồng tư vấn.' : 'Pricing, status and viewing details are reconfirmed through the enquiry flow.']
  ] as const;

  const comparisonRows = vi
    ? [
        ['Diện tích phải thuê', 'Có thể lớn hơn nhu cầu lưu trữ thực tế', 'Chọn theo loại kho đang được NupsBox niêm yết'],
        ['Chi phí vận hành', 'Có thể gồm nhiều hạng mục ngoài lưu trữ', 'Tập trung vào nhu cầu kho và dịch vụ liên quan'],
        ['Khả năng thay đổi', 'Phụ thuộc điều kiện mặt bằng/hợp đồng', 'Trao đổi lại khi nhu cầu lưu trữ thay đổi']
      ]
    : [
        ['Space commitment', 'May exceed the actual storage need', 'Choose from storage units currently listed by NupsBox'],
        ['Operating overhead', 'May include costs unrelated to storage', 'Focus on storage needs and related service'],
        ['Changing needs', 'Depends on lease/property conditions', 'Discuss a different unit when storage needs change']
      ];

  return (
    <Section size="compact">
      <SectionHeading
        eyebrow={vi ? 'VÌ SAO NUPSBOX' : 'WHY NUPSBOX'}
        title={vi ? 'Thông tin chính trong một góc nhìn.' : 'The essentials in one view.'}
        description={vi
          ? 'Trang chủ ưu tiên dữ liệu đã công bố, cách sử dụng không gian và bước xác nhận tiếp theo — không tự bổ sung facility facts khi chưa có nguồn.'
          : 'The homepage prioritizes published data, space-use guidance and the next confirmation step without inventing facility facts.'}
      />

      <div className="mt-7 grid gap-4 lg:grid-cols-12">
        {location ? (
          <figure className="overflow-hidden rounded-3xl border border-[var(--nupsbox-border)] bg-white shadow-[var(--nupsbox-shadow-sm)] lg:col-span-7">
            <div className="relative min-h-[280px] sm:min-h-[340px] lg:h-full">
              <Image
                src={facilityImage}
                alt={vi ? `Hình ảnh cơ sở ${location.name}` : `Facility image for ${location.name}`}
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(7,26,56,.78)] via-transparent to-transparent" />
              <figcaption className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/12 bg-[rgba(7,26,56,.72)] p-4 text-white backdrop-blur-md">
                <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[var(--nupsbox-yellow)]">
                  {location.name}
                </p>
                <p className="mt-1.5 text-sm leading-6 text-white/76">
                  {vi
                    ? 'Hình ảnh cơ sở chỉ xuất hiện cùng một địa điểm đang được công bố.'
                    : 'Facility imagery is shown only alongside a currently published location.'}
                </p>
              </figcaption>
            </div>
          </figure>
        ) : (
          <div className="relative grid min-h-[280px] overflow-hidden rounded-3xl border border-[var(--nupsbox-border)] bg-[var(--nupsbox-navy)] p-6 text-white shadow-[var(--nupsbox-shadow-sm)] sm:min-h-[340px] lg:col-span-7">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(255,211,26,.16),transparent_26%),radial-gradient(circle_at_28%_78%,rgba(8,70,168,.28),transparent_34%)]" />
            <div className="relative z-10 self-end">
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[var(--nupsbox-yellow)]">
                {vi ? 'FACT-SAFE BY DEFAULT' : 'FACT-SAFE BY DEFAULT'}
              </p>
              <h3 className="mt-2 max-w-xl text-2xl font-extrabold tracking-[-0.03em]">
                {vi ? 'Chưa có cơ sở được công bố thì không hiển thị facility facts.' : 'No published facility means no facility facts are shown.'}
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/68">
                {vi
                  ? 'Địa chỉ, diện tích, hình ảnh và tiện ích cụ thể không được suy đoán để lấp khoảng trống dữ liệu.'
                  : 'Address, unit area, imagery and facility features are not guessed to fill missing data.'}
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5">
          {benefits.map(([Icon, title, body]) => (
            <article
              key={title}
              className="rounded-2xl border border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] p-5"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-white text-[var(--nupsbox-blue)] shadow-[var(--nupsbox-shadow-sm)]">
                <Icon size={19} aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-extrabold text-[var(--nupsbox-navy)]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--nupsbox-slate)]">{body}</p>
            </article>
          ))}
        </div>
      </div>

      <details className="group mt-4 overflow-hidden rounded-2xl border border-[var(--nupsbox-border)] bg-[var(--nupsbox-navy)] text-white">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--nupsbox-yellow)]">
          <div>
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[var(--nupsbox-yellow)]">
              {vi ? 'TỐI ƯU KHÔNG GIAN' : 'RIGHT-SIZE YOUR SPACE'}
            </p>
            <p className="mt-1 text-sm font-bold sm:text-base">
              {vi ? 'Xem so sánh cách sử dụng không gian' : 'Compare how the space is used'}
            </p>
          </div>
          <ChevronDown className="shrink-0 transition group-open:rotate-180" size={20} aria-hidden="true" />
        </summary>

        <div className="border-t border-white/10 px-5 py-5">
          <p className="max-w-3xl text-sm leading-6 text-white/68">
            {vi
              ? 'Chi phí thực tế phụ thuộc loại kho và mức giá được xác nhận tại thời điểm liên hệ. NupsBox không dùng giả định phần trăm tiết kiệm hoặc con số không có nguồn.'
              : 'Actual cost depends on the unit and confirmed pricing at enquiry time. NupsBox does not use unsupported savings percentages or invented numbers.'}
          </p>

          <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
            <div className="grid min-w-[660px] grid-cols-[1fr_1.1fr_1.1fr] border-b border-white/10 text-sm font-bold">
              <div className="p-3.5 text-white/55">{vi ? 'Tiêu chí' : 'Criteria'}</div>
              <div className="p-3.5 text-white/65">{vi ? 'Mặt bằng lớn' : 'Larger premises'}</div>
              <div className="p-3.5 text-[var(--nupsbox-yellow)]">NUPSBOX</div>
            </div>
            {comparisonRows.map(([criterion, traditional, nupsbox]) => (
              <div key={criterion} className="grid min-w-[660px] grid-cols-[1fr_1.1fr_1.1fr] border-b border-white/10 text-sm last:border-b-0">
                <div className="p-3.5 font-bold text-white/80">{criterion}</div>
                <div className="p-3.5 leading-6 text-white/58">{traditional}</div>
                <div className="p-3.5 leading-6 text-white/80">{nupsbox}</div>
              </div>
            ))}
          </div>

          <ConversionCta locale={locale} intent="finder" placement="home-proof-bento" size="md" className="mt-5">
            {vi ? 'Tìm kho phù hợp' : 'Find suitable storage'}
          </ConversionCta>
        </div>
      </details>
    </Section>
  );
}
