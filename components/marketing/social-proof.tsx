import {Boxes, MapPin, MessageCircleMore} from 'lucide-react';
import {Container} from '@/components/ui/container';

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
    <section className="bg-[var(--nupsbox-navy)] py-20 text-white sm:py-24">
      <Container>
        <div className="max-w-2xl">
          <p className="text-xs font-black tracking-[0.16em] text-[var(--nupsbox-yellow)]">{locale === 'vi' ? 'MINH BẠCH TRƯỚC KHI THUÊ' : 'CLARITY BEFORE YOU RENT'}</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.045em] sm:text-5xl">{locale === 'vi' ? 'Thông tin đủ để bạn kiểm tra trước khi quyết định.' : 'Information you can check before deciding.'}</h2>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {items.map(({icon: Icon, title, body}) => (
            <article key={title} className="rounded-[1.75rem] border border-white/15 bg-white/5 p-7">
              <Icon className="text-[var(--nupsbox-yellow)]" aria-hidden="true" />
              <h3 className="mt-5 text-xl font-black">{title}</h3>
              <p className="mt-3 leading-7 text-white/70">{body}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
