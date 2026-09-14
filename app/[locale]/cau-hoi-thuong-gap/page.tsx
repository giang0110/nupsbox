import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {Container} from '@/components/ui/container';
import {JsonLd} from '@/components/seo/json-ld';
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
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };

  return (
    <main>
      <JsonLd data={schema} />
      <section className="py-20">
        <Container>
          <h1 className="text-5xl font-black tracking-[-0.055em] text-[var(--nupsbox-navy)] sm:text-6xl">
            {vi ? 'Câu hỏi thường gặp' : 'Frequently asked questions'}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--nupsbox-slate)]">
            {vi
              ? 'Thông tin dưới đây được lấy từ cùng nguồn nội dung đang dùng trên website để tránh chênh lệch giữa trang FAQ và các khu vực tư vấn khác.'
              : 'These answers use the same content source as the rest of the website so the FAQ stays consistent with other guidance.'}
          </p>
          <div className="mt-10 max-w-4xl divide-y divide-[var(--nupsbox-border)]">
            {items.map((item) => (
              <details key={item.id} className="group py-5">
                <summary className="cursor-pointer list-none text-lg font-black text-[var(--nupsbox-navy)]">
                  {item.question}
                </summary>
                <p className="mt-3 max-w-3xl leading-7 text-[var(--nupsbox-slate)]">{item.answer}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
