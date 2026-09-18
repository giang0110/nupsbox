import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {JsonLd} from '@/components/seo/json-ld';
import {FinalCta} from '@/components/marketing/final-cta';
import {PageIntro} from '@/components/ui/page-intro';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
import {getMarketingFaqs} from '@/features/content/faqs';
import {isSupportedLocale} from '@/i18n/routing';

export default async function Page({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!isSupportedLocale(locale)) notFound();
  setRequestLocale(locale);
  const items = await getMarketingFaqs(locale);
  const vi = locale === 'vi';
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {'@type': 'Answer', text: item.answer}
    }))
  };

  return (
    <main>
      <JsonLd data={schema} />
      <PageIntro
        eyebrow="FAQ"
        title={vi ? 'Câu hỏi thường gặp' : 'Frequently asked questions'}
        description={vi
          ? 'Các câu trả lời dùng chung nguồn nội dung với phần còn lại của website để tránh thông tin mâu thuẫn.'
          : 'Answers use the same content source as the rest of the website to avoid conflicting guidance.'}
      />

      <Section>
        <SectionHeading
          eyebrow={vi ? 'GIẢI ĐÁP NHANH' : 'QUICK ANSWERS'}
          title={vi ? 'Tìm câu trả lời trước khi liên hệ.' : 'Find an answer before you enquire.'}
          description={vi
            ? 'Mở từng câu hỏi để xem câu trả lời; nếu vẫn chưa rõ, Storage Finder là bước tiếp theo phù hợp.'
            : 'Open each question for the answer; if you are still unsure, Storage Finder is the next useful step.'}
        />
        <div className="mt-8 max-w-4xl divide-y divide-[var(--nupsbox-border)] border-y border-[var(--nupsbox-border)]">
          {items.map((item) => (
            <details key={item.id} className="group py-4.5">
              <summary className="cursor-pointer list-none pr-8 text-base font-bold text-[var(--nupsbox-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nupsbox-blue)] focus-visible:ring-offset-2 sm:text-lg">
                {item.question}
              </summary>
              <p className="mt-3 max-w-3xl leading-7 text-[var(--nupsbox-slate)]">{item.answer}</p>
            </details>
          ))}
        </div>
      </Section>

      <FinalCta locale={locale} />
    </main>
  );
}
