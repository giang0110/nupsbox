import {Container} from '@/components/ui/container';

export function HowItWorks({locale}: {locale: 'vi' | 'en'}) {
  const vi = locale === 'vi';
  const steps = vi ? [
    ['01', 'Chọn nhu cầu', 'Dùng Storage Finder hoặc xem trực tiếp các kích thước kho.'],
    ['02', 'Nhận tư vấn & báo giá', 'Gửi số điện thoại để NupsBox xác nhận loại kho, giá và tình trạng thực tế.'],
    ['03', 'Xem kho và bắt đầu', 'Đặt lịch tham quan cơ sở trước khi quyết định thuê.']
  ] : [
    ['01', 'Choose your need', 'Use Storage Finder or browse the available unit sizes.'],
    ['02', 'Get advice and a quote', 'Share your contact details so NupsBox can confirm size, price and current status.'],
    ['03', 'Visit and get started', 'Schedule a facility visit before you decide to rent.']
  ];
  return (
    <section className="bg-[var(--nupsbox-surface)] py-20 sm:py-24">
      <Container>
        <h2 className="text-4xl font-black tracking-[-0.045em] text-[var(--nupsbox-navy)] sm:text-5xl">{vi ? 'Thuê kho theo 3 bước.' : 'Get storage in three steps.'}</h2>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {steps.map(([number, title, text]) => <article key={number} className="rounded-3xl border border-[var(--nupsbox-border)] bg-white p-7"><p className="text-4xl font-black text-[var(--nupsbox-yellow-warm)]">{number}</p><h3 className="mt-6 text-xl font-black text-[var(--nupsbox-navy)]">{title}</h3><p className="mt-3 text-sm leading-6 text-[var(--nupsbox-slate)]">{text}</p></article>)}
        </div>
      </Container>
    </section>
  );
}
