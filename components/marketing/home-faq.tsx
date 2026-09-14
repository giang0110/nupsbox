import {Link} from '@/i18n/navigation';
import {Container} from '@/components/ui/container';
import type {MarketingFaq} from '@/features/home/content';

export function HomeFaq({items, locale}: {items: MarketingFaq[]; locale: 'vi' | 'en'}) {
  if (!items.length) return null;

  return (
    <section className="py-20 sm:py-24">
      <Container className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
        <div>
          <p className="text-xs font-black tracking-[0.16em] text-[var(--nupsbox-blue)]">FAQ</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.045em] text-[var(--nupsbox-navy)] sm:text-5xl">{locale === 'vi' ? 'Những điều khách thuê thường cần biết.' : 'What renters usually need to know.'}</h2>
          <Link href="/cau-hoi-thuong-gap" className="mt-6 inline-flex font-bold text-[var(--nupsbox-blue)] hover:underline">{locale === 'vi' ? 'Xem tất cả câu hỏi →' : 'View all FAQs →'}</Link>
        </div>
        <div className="divide-y divide-[var(--nupsbox-border)] border-y border-[var(--nupsbox-border)]">
          {items.slice(0, 5).map((item) => (
            <details key={item.id} className="group py-5">
              <summary className="cursor-pointer list-none pr-8 text-lg font-black text-[var(--nupsbox-navy)]">{item.question}</summary>
              <p className="mt-3 max-w-3xl leading-7 text-[var(--nupsbox-slate)]">{item.answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
