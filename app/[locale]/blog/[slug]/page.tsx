import type {Metadata} from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {ArrowRight, Clock3, ExternalLink} from 'lucide-react';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {BlogBody} from '@/components/marketing/blog-body';
import {FinalCta} from '@/components/marketing/final-cta';
import {JsonLd} from '@/components/seo/json-ld';
import {Container} from '@/components/ui/container';
import {estimateBlogReadingMinutes, getPublishedBlogBySlug, getPublishedBlogCards} from '@/features/content/blog';
import {createLocalizedMetadata} from '@/features/seo/metadata';
import {absoluteUrl, blogSeoRoute, getStaticSeoRoute} from '@/features/seo/routes';
import {isSupportedLocale} from '@/i18n/routing';

const dateFormatVi = new Intl.DateTimeFormat('vi-VN', {dateStyle: 'long'});
const dateFormatEn = new Intl.DateTimeFormat('en-US', {dateStyle: 'long'});

type Params = Promise<{locale: string; slug: string}>;

export async function generateMetadata({params}: {params: Params}): Promise<Metadata> {
  const {locale: rawLocale, slug} = await params;
  const locale = rawLocale === 'en' ? 'en' : 'vi';
  const article = await getPublishedBlogBySlug(slug, locale);

  if (!article) {
    return {robots: {index: false, follow: false}};
  }

  return createLocalizedMetadata({
    route: blogSeoRoute(slug),
    locale,
    title: article.seoTitle ?? article.title,
    description: article.seoDescription ?? article.excerpt ?? article.title
  });
}

export default async function BlogArticlePage({params}: {params: Params}) {
  const {locale, slug} = await params;
  if (!isSupportedLocale(locale)) notFound();
  setRequestLocale(locale);

  const [article, cards] = await Promise.all([
    getPublishedBlogBySlug(slug, locale),
    getPublishedBlogCards(locale)
  ]);
  if (!article) notFound();

  const vi = locale === 'vi';
  const blogHref = vi ? '/blog' : '/en/blog';
  const hrefFor = (articleSlug: string) => vi ? '/blog/' + articleSlug : '/en/blog/' + articleSlug;
  const related = cards.filter(card => card.slug !== slug).slice(0, 2);
  const readingMinutes = estimateBlogReadingMinutes(article.body);
  const homeRoute = getStaticSeoRoute('home');
  const blogRoute = getStaticSeoRoute('blog');
  const articleRoute = blogSeoRoute(slug);

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {'@type': 'ListItem', position: 1, name: vi ? 'Trang chủ' : 'Home', item: absoluteUrl(homeRoute[locale])},
      {'@type': 'ListItem', position: 2, name: 'Blog', item: absoluteUrl(blogRoute[locale])},
      {'@type': 'ListItem', position: 3, name: article.title, item: absoluteUrl(articleRoute[locale])}
    ]
  };

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.seoDescription ?? article.excerpt ?? article.title,
    datePublished: article.publishedAt ?? undefined,
    mainEntityOfPage: absoluteUrl(articleRoute[locale]),
    publisher: {
      '@type': 'Organization',
      name: 'NupsBox'
    }
  };

  return (
    <main>
      <JsonLd data={breadcrumb} />
      <JsonLd data={articleJsonLd} />
      <article className="py-12 sm:py-16">
        <Container>
          <div className="mx-auto max-w-4xl">
            <Link href={blogHref} className="text-sm font-bold text-[var(--nupsbox-blue)] hover:underline">
              ← {vi ? 'Tất cả bài viết' : 'All insights'}
            </Link>

            <header className="mt-6">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--nupsbox-blue)]">
                NUPSBOX INSIGHTS
              </p>
              <h1 className="mt-3 text-[clamp(2.5rem,5vw,4.25rem)] font-extrabold leading-[1.02] tracking-[-0.05em] text-[var(--nupsbox-navy)] text-balance">
                {article.title}
              </h1>
              {article.excerpt ? (
                <p className="mt-5 text-lg leading-8 text-[var(--nupsbox-slate)]">{article.excerpt}</p>
              ) : null}
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-[var(--nupsbox-slate)]">
                {article.publishedAt ? (
                  <time dateTime={article.publishedAt}>
                    {vi
                      ? dateFormatVi.format(new Date(article.publishedAt))
                      : dateFormatEn.format(new Date(article.publishedAt))}
                  </time>
                ) : null}
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 size={15} aria-hidden="true" />
                  {vi ? readingMinutes + ' phút đọc' : readingMinutes + ' min read'}
                </span>
              </div>
            </header>

            {article.coverUrl ? (
              <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-3xl border border-[var(--nupsbox-border)]">
                <Image
                  src={article.coverUrl}
                  alt={article.coverAlt ?? ''}
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 900px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="relative mt-8 min-h-48 overflow-hidden rounded-3xl bg-[var(--nupsbox-navy)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(255,211,26,.22),transparent_28%),linear-gradient(145deg,transparent,#0c326d)]" />
                <p className="absolute bottom-6 left-6 text-[0.7rem] font-black uppercase tracking-[0.16em] text-[var(--nupsbox-yellow)]">NUPSBOX EDITORIAL</p>
              </div>
            )}

            <div className="mt-9 rounded-[1.75rem] border border-[var(--nupsbox-border)] bg-white p-6 shadow-[0_16px_44px_rgba(7,26,56,.06)] sm:p-9">
              <BlogBody body={article.body} fallback={article.excerpt} />
            </div>

            {article.sourceUrl ? (
              <aside className="mt-6 rounded-2xl border border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] p-5">
                <p className="text-sm font-bold text-[var(--nupsbox-navy)]">
                  {vi ? 'Nguồn tham khảo cho một số nguyên tắc trong bài' : 'Reference for selected principles in this article'}
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--nupsbox-slate)]">
                  {vi ? 'Bài viết là nội dung biên tập của NupsBox; liên kết dưới đây là nguồn ngoài được dùng để đối chiếu một số thực hành vận hành.' : 'This is NupsBox editorial content; the external link below supports selected operating practices referenced in the article.'}
                </p>
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--nupsbox-border)] bg-white px-4 text-sm font-bold text-[var(--nupsbox-blue)]"
                >
                  {vi ? 'Mở nguồn tham khảo' : 'Open reference'}
                  <ExternalLink size={16} aria-hidden="true" />
                </a>
              </aside>
            ) : null}

            {related.length ? (
              <aside className="mt-10 border-t border-[var(--nupsbox-border)] pt-8">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-[var(--nupsbox-blue)]">
                      {vi ? 'ĐỌC TIẾP' : 'CONTINUE READING'}
                    </p>
                    <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.035em] text-[var(--nupsbox-navy)]">
                      {vi ? 'Hai góc nhìn liên quan.' : 'Two related perspectives.'}
                    </h2>
                  </div>
                  <Link href={blogHref} className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[var(--nupsbox-blue)] hover:underline">
                    {vi ? 'Toàn bộ thư viện' : 'Full library'}
                    <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {related.map(item => (
                    <Link
                      key={item.id}
                      href={hrefFor(item.slug)}
                      className="group rounded-[1.5rem] border border-[var(--nupsbox-border)] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_14px_38px_rgba(7,26,56,.07)]"
                    >
                      <h3 className="text-lg font-extrabold leading-snug tracking-[-0.025em] text-[var(--nupsbox-navy)] group-hover:text-[var(--nupsbox-blue)]">{item.title}</h3>
                      {item.excerpt ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--nupsbox-slate)]">{item.excerpt}</p> : null}
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--nupsbox-blue)]">
                        {vi ? 'Đọc bài' : 'Read article'}
                        <ArrowRight size={15} aria-hidden="true" />
                      </span>
                    </Link>
                  ))}
                </div>
              </aside>
            ) : null}
          </div>
        </Container>
      </article>

      <FinalCta locale={locale} />
    </main>
  );
}
