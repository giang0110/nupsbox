import {Camera, KeyRound, Expand, Warehouse} from 'lucide-react';
import {Container} from '@/components/ui/container';

export function SecurityBenefits({locale}: {locale: 'vi' | 'en'}) {
  const vi = locale === 'vi';
  const items = [
    [Camera, 'CCTV', vi ? 'Camera giám sát là một phần tiện ích được ghi nhận tại cơ sở Tân Phú.' : 'CCTV is listed among the facility features at Tan Phu.'],
    [KeyRound, 'Keypad access', vi ? 'Kiểm soát ra vào bằng keypad tại cơ sở.' : 'Keypad-controlled facility access.'],
    [Warehouse, vi ? 'Kho riêng' : 'Private unit', vi ? 'Không gian lưu trữ tách biệt cho hàng hóa và vật dụng của bạn.' : 'A dedicated storage space for your inventory and belongings.'],
    [Expand, vi ? 'Linh hoạt' : 'Flexible', vi ? 'Chọn loại kho phù hợp thay vì trả tiền cho diện tích dư thừa.' : 'Choose a suitable unit instead of paying for unused floor area.']
  ] as const;
  return (
    <section className="py-20 sm:py-24">
      <Container>
        <h2 className="max-w-3xl text-4xl font-black tracking-[-0.045em] text-[var(--nupsbox-navy)] sm:text-5xl">{vi ? 'Một không gian riêng cho việc bạn đang xây dựng.' : 'A dedicated space for what you are building.'}</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(([Icon, title, text]) => <article key={title} className="rounded-3xl bg-[var(--nupsbox-surface)] p-6"><Icon className="text-[var(--nupsbox-blue)]" aria-hidden="true" /><h3 className="mt-5 font-black text-[var(--nupsbox-navy)]">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--nupsbox-slate)]">{text}</p></article>)}
        </div>
      </Container>
    </section>
  );
}
