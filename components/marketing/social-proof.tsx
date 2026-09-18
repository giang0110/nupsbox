import {Boxes, MapPin, MessageCircleMore} from 'lucide-react';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';

const proof = {
  vi: [
    {icon: MapPin, title: 'Thông tin địa điểm rõ ràng', body: 'Website công khai địa chỉ cơ sở đang giới thiệu để bạn kiểm tra trước khi liên hệ.'},
    {icon: Boxes, title: 'Kích thước kho cụ thể', body: 'Loại kho hiển thị diện tích và gợi ý nhu cầu; Storage Finder chỉ đưa gợi ý ban đầu, không phóng đại sức chứa.'},
    {icon: MessageCircleMore, title: 'Xác nhận trước khi thuê', body: 'Giá, trạng thái và loại kho phù hợp được xác nhận lại qua kênh tư vấn thay vì giả định tồn kho thời gian thực.'}
  ],
  en: [
    {icon: MapPin, title: 'Clear location information', body: 'The website publishes the address of the facility being presented so you can check it before enquiring.'},
    {icon: Boxes, title: 'Specific unit sizes', body: 'Listed units show area and use guidance; Storage Finder provides a starting suggestion without overstating capacity.'},
    {icon: MessageCircleMore, title: 'Confirm before renting', body: 'Pricing, status and fit are reconfirmed through the enquiry channel rather than presented as real-time inventory.'}
  ]
};

export function SocialProof({locale}: {locale: 'vi' | 'en'}) {
  const items = proof[locale];

  return (
    <Section tone="navy">
      <SectionHeading
        tone="dark"
        eyebrow={locale === 'vi' ? 'MINH BẠCH TRƯỚC KHI THUÊ' : 'CLARITY BEFORE YOU RENT'}
        title={locale === 'vi' ? 'Thông tin đủ để bạn kiểm tra trước khi quyết định.' : 'Information you can check before deciding.'}
      />
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {items.map(({icon: Icon, title, body}) => (
          <article key={title} className="rounded-2xl border border-white/12 bg-white/[0.045] p-6">
            <Icon className="text-[var(--nupsbox-yellow)]" aria-hidden="true" />
            <h3 className="mt-5 text-lg font-bold">{title}</h3>
            <p className="mt-2.5 leading-7 text-white/68">{body}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
