import type {Metadata} from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {ExternalLink} from 'lucide-react';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {FinalCta} from '@/components/marketing/final-cta';
import {PageIntro} from '@/components/ui/page-intro';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
import {isSupportedLocale} from '@/i18n/routing';
import {getPublishedBlogCards} from '@/features/content/blog';
import {createStaticPageMetadata} from '@/features/seo/static-page';

const dateFormatVi = new Intl.DateTimeFormat('vi-VN', {dateStyle: 'medium'});
const dateFormatEn = new Intl.DateTimeFormat('en-US', {dateStyle: 'medium'});

export function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  return createStaticPageMetadata(params, 'blog', {
    vi: {
      title: 'Kinh nghiệm thuê kho & vận hành',
      description: 'Bài viết NupsBox về kho mini, vận hành, lưu trữ và cách chuẩn bị trước khi thuê.'
    },
    en: {
      title: 'Storage & operations guides',
      description: 'NupsBox guides about mini storage, operations, storage planning and preparing before you rent.'
    }
  });
}

export default async function Page({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!isSupportedLocale(locale)) notFound();
  setRequestLocale(locale);

  const vi = locale === 'vi';
  const posts = await getPublishedBlogCards(locale);

  return (
    <main>
      <PageIntro
        eyebrow="NUPSBOX BLOG"
        title={vi ? 'Kinh nghiệm thuê kho & vận hành' : 'Storage & operations guides'}
        description={vi
          ? 'Nội dung được xuất bản từ CMS NupsBox. Mỗi bài có URL riêng và nguồn tham khảo bên ngoài được ghi rõ khi có.'
          : 'Content is published from the NupsBox CMS. Each article has its own URL, with external references clearly identified when available.'}
      />

      <Section>
        <SectionHeading
          eyebrow={vi ? 'BÀI VIẾT MỚI' : 'LATEST ARTICLES'}
          title={vi ? 'Đọc nhanh. Quyết định rõ hơn.' : 'Read quickly. Decide with more clarity.'}
          description={vi
            ? 'Tập trung vào thông tin thực tế về lưu trữ, lựa chọn diện tích và quy trình thuê.'
            : 'Practical guidance on storage, choosing a size and understanding the rental process.'}
        />

        {posts.length ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => {
              const articleHref = vi ? `/blog/${post.slug}` : `/en/blog/${post.slug}`;
              return (
                <article
                  key={post.id}
                  className="group overflow-hidden rounded-[1.75rem] border border-[var(--nupsbox-border)] bg-white shadow-[0_14px_40px_rgba(7,26,56,.06)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_54px_rgba(7,26,56,.10)]"
                >
                  {post.coverUrl ? (
                    <Link href={articleHref} className="relative block aspect-[16/10] overflow-hidden">
                      <Image
                        src={post.coverUrl}
                        alt={post.coverAlt ?? ''}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition duration-300 group-hover:scale-[1.015]"
                      />
                    </Link>
                  ) : (
                    <div className="grid aspect-[16/10] place-items-end bg-[linear-gradient(145deg,var(--nupsbox-navy),#0c326d)] p-5">
                      <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.15em] text-[var(--nupsbox-yellow)]">NUPSBOX JOURNAL</span>
                    </div>
                  )}

                  <div className="p-5 sm:p-6">
                    <p className="text-xs font-bold text-[var(--nupsbox-muted)]">
                      {post.publishedAt
                        ? (vi ? dateFormatVi : dateFormatEn).format(new Date(post.publishedAt))
                        : ''}
                    </p>
                    <h2 className="mt-2 text-xl font-extrabold leading-snug tracking-[-0.03em] text-[var(--nupsbox-navy)]">
                      <Link href={articleHref} className="hover:text-[var(--nupsbox-blue)]">{post.title}</Link>
                    </h2>
                    {post.excerpt ? (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--nupsbox-slate)]">{post.excerpt}</p>
                    ) : null}
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <Link
                        href={articleHref}
                        className="inline-flex min-h-11 items-center rounded-full bg-[var(--nupsbox-navy)] px-4 text-sm font-bold text-white"
                      >
                        {vi ? 'Đọc bài' : 'Read article'}
                      </Link>
                      {post.sourceUrl ? (
                        <a
                          href={post.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[var(--nupsbox-blue)] hover:underline"
                        >
                          {vi ? 'Nguồn' : 'Source'}
                          <ExternalLink size={15} aria-hidden="true" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 rounded-[1.75rem] border border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] p-7 text-[var(--nupsbox-slate)]">
            <p className="font-extrabold text-[var(--nupsbox-navy)]">
              {vi ? 'Chưa có bài viết được xuất bản.' : 'No articles are published yet.'}
            </p>
            <p className="mt-2 text-sm leading-6">
              {vi
                ? 'Các bài draft trong Admin sẽ không xuất hiện tại đây cho đến khi được xuất bản.'
                : 'Drafts in Admin stay hidden until they are published.'}
            </p>
          </div>
        )}
      </Section>

      <FinalCta locale={locale} />
    </main>
  );
}
