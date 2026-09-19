import {ChevronDown} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
import type {MarketingFaq} from '@/features/home/content';

export function HomeFaq({items, locale}: {items: MarketingFaq[]; locale: 'vi' | 'en'}) {
  if (!items.length) return null;

  return (
    <Section size="compact">
      <div className="grid gap-7 lg:grid-cols-[.72fr_1.28fr] lg:gap-10">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <SectionHeading
            eyebrow="FAQ"
            title={locale === 'vi' ? 'Những điều khách thuê thường cần biết.' : 'What renters usually need to know.'}
            description={locale === 'vi'
              ? 'Mở từng câu để xem nhanh; câu đầu tiên được mở sẵn để giảm thao tác trên mobile.'
              : 'Open each question for a quick answer; the first item starts expanded to reduce mobile friction.'}
          />
          <Link
            href="/cau-hoi-thuong-gap"
            className="mt-5 inline-flex min-h-11 items-center font-bold text-[var(--nupsbox-blue)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nupsbox-blue)] focus-visible:ring-offset-2"
          >
            {locale === 'vi' ? 'Xem tất cả câu hỏi →' : 'View all FAQs →'}
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[var(--nupsbox-border)] bg-white">
          {items.slice(0, 5).map((item, index) => (
            <details
              key={item.id}
              open={index === 0}
              className="group border-b border-[var(--nupsbox-border)] last:border-b-0"
            >
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-base font-bold text-[var(--nupsbox-navy)] transition hover:bg-[var(--nupsbox-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--nupsbox-blue)] sm:px-5 sm:text-lg">
                <span>{item.question}</span>
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--nupsbox-surface)] text-[var(--nupsbox-blue)]">
                  <ChevronDown size={17} className="transition group-open:rotate-180" aria-hidden="true" />
                </span>
              </summary>
              <div className="px-4 pb-5 sm:px-5">
                <p className="max-w-3xl text-sm leading-6 text-[var(--nupsbox-slate)]">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}
