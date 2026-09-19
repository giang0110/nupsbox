import Image from 'next/image';
import {ExternalLink} from 'lucide-react';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {Container} from '@/components/ui/container';
import {isSupportedLocale} from '@/i18n/routing';
import {getPublishedBlogCards} from '@/features/content/blog';

const dateFormatVi = new Intl.DateTimeFormat('vi-VN', {dateStyle: 'medium'});
const dateFormatEn = new Intl.DateTimeFormat('en-US', {dateStyle: 'medium'});

export default async function Page({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!isSupportedLocale(locale)) notFound();
  setRequestLocale(locale);

  const vi = locale === 'vi';
  const posts = await getPublishedBlogCards(locale);

  return (
    <main>
      <section className="py-14 sm:py-16">
        <Container>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--nupsbox-blue)]">
            NUPSBOX BLOG
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-[-0.05em] text-[var(--nupsbox-navy)] sm:text-5xl">
            {vi ? 'Kinh nghiệm thuê kho & vận hành' : 'Storage & operations guides'}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--nupsbox-slate)]">
            {vi
              ? 'Bài viết đã xuất bản từ Admin CMS, gồm nội dung do NupsBox quản lý và các nguồn giới thiệu bên ngoài đã được gắn link.'
              : 'Published content from Admin CMS, including NupsBox-managed articles and verified external introduction sources.'}
          </p>

          {posts.length ? (
            <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="overflow-hidden rounded-3xl border border-[var(--nupsbox-border)] bg-white shadow-[var(--nupsbox-shadow-sm)]"
                >
                  {post.coverUrl ? (
                    <div className="relative aspect-[16/9]">
                      <Image
                        src={post.coverUrl}
                        alt={post.coverAlt ?? ''}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="p-5">
                    <p className="text-xs font-bold text-[var(--nupsbox-slate)]">
                      {post.publishedAt
                        ? (vi ? dateFormatVi : dateFormatEn).format(new Date(post.publishedAt))
                        : ''}
                    </p>
                    <h2 className="mt-2 text-xl font-black tracking-[-0.025em] text-[var(--nupsbox-navy)]">
                      {post.title}
                    </h2>
                    {post.excerpt ? (
                      <p className="mt-3 text-sm leading-6 text-[var(--nupsbox-slate)]">{post.excerpt}</p>
                    ) : null}
                    {post.sourceUrl ? (
                      <a
                        href={post.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--nupsbox-navy)] px-4 text-sm font-bold text-white"
                      >
                        {vi ? 'Xem bài giới thiệu' : 'Open source article'}
                        <ExternalLink size={16} aria-hidden="true" />
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-9 rounded-3xl border border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] p-7 text-[var(--nupsbox-slate)]">
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
        </Container>
      </section>
    </main>
  );
}
