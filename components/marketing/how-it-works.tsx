import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';

export function HowItWorks({locale}: {locale: 'vi' | 'en'}) {
  const vi = locale === 'vi';
  const steps = vi ? [
    ['01', 'Tìm loại kho phù hợp', 'Dùng Storage Finder hoặc xem các loại kho đang được NupsBox hiển thị.'],
    ['02', 'Nhận báo giá hoặc đề xuất lịch xem', 'Chọn bước tiếp theo theo mức độ sẵn sàng của bạn; không cần điền nhiều hơn mức cần thiết.'],
    ['03', 'NupsBox xác nhận bước tiếp theo', 'Giá, tình trạng và lịch xem được xác nhận trước khi bạn quyết định thuê.']
  ] : [
    ['01', 'Find a suitable storage option', 'Use Storage Finder or browse the unit types currently listed by NupsBox.'],
    ['02', 'Request a quote or viewing', 'Choose the next step that matches your intent without extra form friction.'],
    ['03', 'NupsBox confirms what comes next', 'Pricing, status and viewing time are confirmed before you decide to rent.']
  ];

  return (
    <Section tone="soft">
      <SectionHeading
        eyebrow={vi ? '3 BƯỚC RÕ RÀNG' : 'THREE CLEAR STEPS'}
        title={vi ? 'Từ nhu cầu đến bước tiếp theo, không tạo cảm giác “đặt chỗ tức thời”.' : 'From need to next step without pretending it is an instant reservation.'}
        description={vi
          ? 'Luồng được thiết kế để giúp bạn hiểu loại kho trước, rồi mới chuyển sang báo giá hoặc xem kho.'
          : 'The journey helps you understand the unit first, then move into quote or viewing intent.'}
      />
      <ol className="mt-10 grid gap-4 lg:grid-cols-3">
        {steps.map(([number, title, text]) => (
          <li key={number} className="border-t-2 border-[var(--nupsbox-blue)] pt-5">
            <p className="text-sm font-black text-[var(--nupsbox-blue)]">{number}</p>
            <h3 className="mt-4 text-xl font-black text-[var(--nupsbox-navy)]">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--nupsbox-slate)]">{text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
