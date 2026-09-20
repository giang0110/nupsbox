import {ArrowRight, MessageCircle, Ruler, ShieldCheck} from 'lucide-react';
import {ConversionCta} from '@/components/marketing/conversion-cta';

export function EmptyCatalogConversion({
  locale,
  context = 'units'
}: {
  locale: 'vi' | 'en';
  context?: 'units' | 'pricing';
}) {
  const vi = locale === 'vi';
  const pricing = context === 'pricing';

  const steps = vi
    ? [
        ['01', 'Mô tả nhu cầu', 'Cho biết bạn lưu gì và lượng hàng ước tính.'],
        ['02', 'NupsBox tư vấn', 'Xác nhận loại kho phù hợp dựa trên dữ liệu vận hành thực tế.'],
        ['03', 'Nhận thông tin hiện hành', pricing ? 'Nhận báo giá đã được xác nhận trước khi quyết định.' : 'Nhận lựa chọn phù hợp trước khi đặt lịch xem kho.']
      ]
    : [
        ['01', 'Describe your needs', 'Tell us what you store and roughly how much.'],
        ['02', 'NupsBox advises', 'We confirm a suitable option using current operating data.'],
        ['03', 'Get current information', pricing ? 'Receive confirmed current pricing before deciding.' : 'Receive a suitable option before requesting a viewing.']
      ];

  return (
    <section
      aria-labelledby="empty-catalog-title"
      className="overflow-hidden rounded-3xl border border-[var(--nupsbox-border)] bg-white shadow-[var(--nupsbox-shadow-sm)]"
    >
      <div className="grid lg:grid-cols-[.88fr_1.12fr]">
        <div className="bg-[var(--nupsbox-navy)] p-6 text-white sm:p-8">
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[var(--nupsbox-yellow)]">
            {vi ? 'TƯ VẤN THEO NHU CẦU' : 'NEEDS-BASED ADVICE'}
          </p>
          <h2 id="empty-catalog-title" className="mt-3 text-[clamp(2rem,3vw,2.8rem)] font-extrabold leading-[1.04] tracking-[-0.04em]">
            {pricing
              ? (vi ? 'Bảng giá đang được hoàn thiện bằng dữ liệu đã xác nhận.' : 'Pricing is being completed with verified data.')
              : (vi ? 'Loại kho đang được cập nhật trước khi công bố.' : 'Storage options are being updated before publication.')}
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
            {vi
              ? 'Thay vì hiển thị diện tích hoặc mức giá ước tính, NupsBox giữ website trung thực và tư vấn trực tiếp từ nhu cầu thực tế của bạn.'
              : 'Instead of showing estimated sizes or prices, NupsBox keeps the website factual and advises from your actual storage needs.'}
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <ConversionCta locale={locale} intent="quote" placement={pricing ? 'pricing-empty' : 'units-empty'} size="lg">
              {vi ? 'Gửi nhu cầu để được tư vấn' : 'Send requirements'}
            </ConversionCta>
            <ConversionCta
              locale={locale}
              intent="viewing"
              placement={pricing ? 'pricing-empty' : 'units-empty'}
              variant="secondary"
              size="lg"
            >
              {vi ? 'Đề xuất lịch xem kho' : 'Request a viewing'}
            </ConversionCta>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="grid gap-3">
            {steps.map(([index, title, text]) => (
              <div key={index} className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-[var(--nupsbox-border)] pb-4 last:border-0 last:pb-0">
                <span className="text-xs font-black tracking-[0.12em] text-[var(--nupsbox-blue)]">{index}</span>
                <div>
                  <h3 className="font-extrabold text-[var(--nupsbox-navy)]">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--nupsbox-slate)]">{text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-2.5 text-sm text-[var(--nupsbox-slate)] sm:grid-cols-3">
            <div className="flex items-center gap-2"><Ruler size={16} aria-hidden="true" /><span>{vi ? 'Không cần tự đoán diện tích' : 'No size guessing needed'}</span></div>
            <div className="flex items-center gap-2"><MessageCircle size={16} aria-hidden="true" /><span>{vi ? 'Tư vấn trước khi chọn' : 'Advice before choosing'}</span></div>
            <div className="flex items-center gap-2"><ShieldCheck size={16} aria-hidden="true" /><span>{vi ? 'Không hiển thị dữ liệu giả' : 'No fabricated data'}</span></div>
          </div>

          <a
            href={locale === 'vi' ? '/lien-he' : '/en/contact'}
            className="mt-6 inline-flex min-h-10 items-center gap-2 text-sm font-black text-[var(--nupsbox-blue)] hover:underline"
          >
            {vi ? 'Mở form tư vấn' : 'Open enquiry form'} <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
