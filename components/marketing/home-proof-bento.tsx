import Image from 'next/image';
import {Camera, ChevronDown, Expand, KeyRound, Warehouse} from 'lucide-react';
import {ConversionCta} from '@/components/marketing/conversion-cta';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';

const facilityImage =
  'https://siaodieqxzlarnvfppox.supabase.co/storage/v1/object/public/onboarding-photos/nupsbox-tan-phu/corridor-1.jpg';

export function HomeProofBento({locale}: {locale: 'vi' | 'en'}) {
  const vi = locale === 'vi';

  const benefits = [
    [Camera, 'CCTV', vi ? 'Camera giám sát là một phần tiện ích được ghi nhận tại cơ sở.' : 'CCTV is listed among the facility features.'],
    [KeyRound, 'Keypad access', vi ? 'Kiểm soát ra vào bằng keypad tại cơ sở.' : 'Keypad-controlled facility access.'],
    [Warehouse, vi ? 'Kho riêng' : 'Private unit', vi ? 'Không gian lưu trữ tách biệt cho hàng hóa và vật dụng.' : 'A dedicated storage space for inventory and belongings.'],
    [Expand, vi ? 'Linh hoạt' : 'Flexible', vi ? 'Chọn loại kho phù hợp thay vì trả tiền cho diện tích dư thừa.' : 'Choose a suitable unit instead of paying for unused floor area.']
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
          ? 'Hình ảnh thực tế, tiện ích và cách tối ưu không gian được gom lại để bạn kiểm tra nhanh trước khi đi sâu.'
          : 'Real imagery, facility features and space-use guidance are grouped so you can scan the essentials before going deeper.'}
      />

      <div className="mt-7 grid gap-4 lg:grid-cols-12">
        <figure className="overflow-hidden rounded-3xl border border-[var(--nupsbox-border)] bg-white shadow-[var(--nupsbox-shadow-sm)] lg:col-span-7">
          <div className="relative min-h-[280px] sm:min-h-[340px] lg:h-full">
            <Image
              src={facilityImage}
              alt={vi ? 'Hình ảnh thực tế cơ sở NupsBox' : 'Real NupsBox facility image'}
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(7,26,56,.78)] via-transparent to-transparent" />
            <figcaption className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/12 bg-[rgba(7,26,56,.72)] p-4 text-white backdrop-blur-md">
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[var(--nupsbox-yellow)]">
                {vi ? 'HÌNH ẢNH THỰC TẾ' : 'REAL FACILITY'}
              </p>
              <p className="mt-1.5 text-sm leading-6 text-white/76">
                {vi
                  ? 'Website ưu tiên hình ảnh thực tế; thư viện quản trị có thể tiếp tục bổ sung ảnh độ phân giải cao.'
                  : 'The site prioritizes real imagery; higher-resolution originals can continue to be added through the media library.'}
              </p>
            </figcaption>
          </div>
        </figure>

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

          <ConversionCta
            locale={locale}
            intent="finder"
            placement="home-proof-bento"
            size="md"
            className="mt-5"
          >
            {vi ? 'Tìm kho phù hợp' : 'Find suitable storage'}
          </ConversionCta>
        </div>
      </details>
    </Section>
  );
}
