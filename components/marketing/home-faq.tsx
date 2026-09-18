import {Link} from '@/i18n/navigation';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
import type {MarketingFaq} from '@/features/home/content';

export function HomeFaq({items, locale}: {items: MarketingFaq[]; locale: 'vi' | 'en'}) {
  if (!items.length) return null;

  return (
    <Section size="compact">
      <div className="grid gap-7 lg:grid-cols-[.72fr_1.28fr] lg:gap-10">
        <div>
          <SectionHeading
            eyebrow="FAQ"
            title={locale === 'vi' ? 'Những điều khách thuê thường cần biết.' : 'What renters usually need to know.'}
          />
          <Link
            href="/cau-hoi-thuong-gap"
            className="mt-5 inline-flex min-h-11 items-center font-bold text-[var(--nupsbox-blue)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nupsbox-blue)] focus-visible:ring-offset-2"
          >
            {locale === 'vi' ? 'Xem tất cả câu hỏi →' : 'View all FAQs →'}
          </Link>
        </div>
        <div className="divide-y divide-[var(--nupsbox-border)] border-y border-[var(--nupsbox-border)]">
          {items.slice(0, 5).map((item) => (
            <details key={item.id} className="group py-3.5">
              <summary className="cursor-pointer list-none pr-8 text-base font-bold text-[var(--nupsbox-navy)] sm:text-lg">
                {item.question}
              </summary>
              <p className="mt-2.5 max-w-3xl text-sm leading-6 text-[var(--nupsbox-slate)]">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}
