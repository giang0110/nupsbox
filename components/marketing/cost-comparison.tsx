import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
import {ConversionCta} from './conversion-cta';

export function CostComparison({locale}: {locale: 'vi' | 'en'}) {
  const vi = locale === 'vi';
  const rows = vi
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
    <Section tone="navy">
      <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
        <div>
          <SectionHeading
            eyebrow={vi ? 'TỐI ƯU KHÔNG GIAN' : 'RIGHT-SIZE YOUR SPACE'}
            title={vi ? 'So sánh cách sử dụng không gian, không hứa một con số tiết kiệm.' : 'Compare how space is used, not a promised savings percentage.'}
            description={vi
              ? 'Chi phí thực tế phụ thuộc loại kho và mức giá được xác nhận tại thời điểm liên hệ. NupsBox không dùng giả định phần trăm tiết kiệm hoặc con số không có nguồn.'
              : 'Actual cost depends on the unit and confirmed pricing at enquiry time. NupsBox does not use unsupported savings percentages or invented numbers.'}
            tone="dark"
          />
          <ConversionCta locale={locale} intent="finder" placement="cost-comparison" size="lg" className="mt-8">
            {vi ? 'Tìm kho phù hợp' : 'Find suitable storage'}
          </ConversionCta>
        </div>

        <div className="overflow-hidden rounded-[1.75rem] border border-white/12 bg-white/5">
          <div className="grid grid-cols-[1fr_1.1fr_1.1fr] border-b border-white/10 text-sm font-bold">
            <div className="p-4 text-white/60">{vi ? 'Tiêu chí' : 'Criteria'}</div>
            <div className="p-4 text-white/70">{vi ? 'Mặt bằng lớn' : 'Larger premises'}</div>
            <div className="p-4 text-[var(--nupsbox-yellow)]">NUPSBOX</div>
          </div>
          {rows.map(([criterion, traditional, nupsbox]) => (
            <div key={criterion} className="grid grid-cols-[1fr_1.1fr_1.1fr] border-b border-white/10 text-sm last:border-b-0">
              <div className="p-4 font-bold text-white/80">{criterion}</div>
              <div className="p-4 leading-6 text-white/60">{traditional}</div>
              <div className="p-4 leading-6 text-white/80">{nupsbox}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
