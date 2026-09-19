import type {Metadata} from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {ExternalLink} from 'lucide-react';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {BlogBody} from '@/components/marketing/blog-body';
import {FinalCta} from '@/components/marketing/final-cta';
import {JsonLd} from '@/components/seo/json-ld';
import {Container} from '@/components/ui/container';
import {getPublishedBlogBySlug} from '@/features/content/blog';
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

  const article = await getPublishedBlogBySlug(slug, locale);
  if (!article) notFound();

  const vi = locale === 'vi';
  const blogHref = vi ? '/blog' : '/en/blog';
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

  return (
    <main>
      <JsonLd data={breadcrumb} />
      <article className="py-12 sm:py-16">
        <Container>
          <div className="mx-auto max-w-4xl">
            <Link href={blogHref} className="text-sm font-bold text-[var(--nupsbox-blue)] hover:underline">
              ← {vi ? 'Tất cả bài viết' : 'All articles'}
            </Link>

            <header className="mt-6">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--nupsbox-blue)]">
                NUPSBOX BLOG
              </p>
              <h1 className="mt-3 text-[clamp(2.5rem,5vw,4.25rem)] font-extrabold leading-[1.02] tracking-[-0.05em] text-[var(--nupsbox-navy)] text-balance">
                {article.title}
              </h1>
              {article.excerpt ? (
                <p className="mt-5 text-lg leading-8 text-[var(--nupsbox-slate)]">{article.excerpt}</p>
              ) : null}
              {article.publishedAt ? (
                <time
                  className="mt-4 block text-sm font-semibold text-[var(--nupsbox-slate)]"
                  dateTime={article.publishedAt}
                >
                  {vi
                    ? dateFormatVi.format(new Date(article.publishedAt))
                    : dateFormatEn.format(new Date(article.publishedAt))}
                </time>
              ) : null}
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
            ) : null}

            <div className="mt-9 rounded-[1.75rem] border border-[var(--nupsbox-border)] bg-white p-6 shadow-[0_16px_44px_rgba(7,26,56,.06)] sm:p-9">
              <BlogBody body={article.body} fallback={article.excerpt} />
            </div>

            {article.sourceUrl ? (
              <aside className="mt-6 rounded-2xl border border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] p-5">
                <p className="text-sm font-bold text-[var(--nupsbox-navy)]">
                  {vi ? 'Nguồn giới thiệu / tham khảo' : 'Introduction / reference source'}
                </p>
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--nupsbox-border)] bg-white px-4 text-sm font-bold text-[var(--nupsbox-blue)]"
                >
                  {vi ? 'Mở nguồn bên ngoài' : 'Open external source'}
                  <ExternalLink size={16} aria-hidden="true" />
                </a>
              </aside>
            ) : null}
          </div>
        </Container>
      </article>

      <FinalCta locale={locale} />
    </main>
  );
}
