import Image from 'next/image';
import Link from 'next/link';
import {ArrowRight, BookOpenText} from 'lucide-react';
import {Section} from '@/components/ui/section';
import type {PublicBlogCard} from '@/features/content/blog';

const dateFormatVi = new Intl.DateTimeFormat('vi-VN', {dateStyle: 'medium'});
const dateFormatEn = new Intl.DateTimeFormat('en-US', {dateStyle: 'medium'});

export function HomeInsights({
  locale,
  posts,
  visuals = {}
}: {
  locale: 'vi' | 'en';
  posts: PublicBlogCard[];
  visuals?: Record<string, {url: string; alt: string; source: 'blog' | 'topic'}>;
}) {
  if (!posts.length) return null;
  const vi = locale === 'vi';
  const [featured, ...rest] = posts.slice(0, 3);
  const hrefFor = (slug: string) => vi ? '/blog/' + slug : '/en/blog/' + slug;
  const mappedVisual = visuals[featured.slug];
  const featuredVisual = featured.coverUrl
    ? {url: featured.coverUrl, alt: featured.coverAlt ?? '', mapped: false}
    : mappedVisual
      ? {url: mappedVisual.url, alt: mappedVisual.alt, mapped: true}
      : null;

  return (
    <Section tone="soft" size="compact">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-3xl">
          <p className="flex items-center gap-2 text-[0.7rem] font-black uppercase tracking-[0.16em] text-[var(--nupsbox-blue)]">
            <BookOpenText size={15} aria-hidden="true" />
            {vi ? 'PHÂN TÍCH & HƯỚNG DẪN' : 'ANALYSIS & GUIDES'}
          </p>
          <h2 className="mt-3 text-[clamp(2rem,4vw,3.5rem)] font-extrabold leading-[1.03] tracking-[-0.045em] text-[var(--nupsbox-navy)]">
            {vi ? 'Hiểu cách dùng kho, không chỉ biết có kho.' : 'Understand how to use storage, not just that it exists.'}
          </h2>
        </div>
        <Link href={vi ? '/blog' : '/en/blog'} className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[var(--nupsbox-blue)] hover:underline">
          {vi ? 'Xem thư viện bài viết' : 'Browse all insights'}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-7 grid overflow-hidden rounded-[2rem] border border-[var(--nupsbox-border)] bg-white lg:grid-cols-[1.35fr_.65fr]">
        <article className="group grid gap-6 p-6 sm:grid-cols-[minmax(0,1fr)_170px] sm:items-start sm:p-8 lg:p-10">
          <div>
            <p className="text-xs font-bold text-[var(--nupsbox-muted)]">
              {featured.publishedAt ? (vi ? dateFormatVi : dateFormatEn).format(new Date(featured.publishedAt)) : ''}
            </p>
            <h3 className="mt-3 max-w-3xl text-[clamp(1.75rem,3vw,2.8rem)] font-extrabold leading-[1.06] tracking-[-0.04em] text-[var(--nupsbox-navy)]">
              <Link href={hrefFor(featured.slug)} className="transition hover:text-[var(--nupsbox-blue)]">{featured.title}</Link>
            </h3>
            {featured.excerpt ? (
              <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--nupsbox-slate)]">{featured.excerpt}</p>
            ) : null}
            <Link href={hrefFor(featured.slug)} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--nupsbox-navy)] px-5 text-sm font-bold text-white">
              {vi ? 'Đọc phân tích' : 'Read analysis'}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          {featuredVisual ? (
            <Link
              href={hrefFor(featured.slug)}
              className="relative hidden aspect-square overflow-hidden rounded-[1.35rem] bg-[var(--nupsbox-surface)] sm:block"
              aria-label={featuredVisual.alt}
            >
              <Image
                src={featuredVisual.url}
                alt={featuredVisual.alt}
                fill
                sizes="170px"
                className="object-cover transition duration-500 group-hover:scale-[1.025]"
              />
              {featuredVisual.mapped ? (
                <span className="absolute inset-x-3 bottom-3 rounded-full bg-black/45 px-2.5 py-1 text-center text-[0.55rem] font-black uppercase tracking-[0.1em] text-white/90 backdrop-blur">
                  {vi ? 'Ảnh cơ sở NupsBox' : 'Real NupsBox imagery'}
                </span>
              ) : null}
            </Link>
          ) : null}
        </article>

        <div className="divide-y divide-[var(--nupsbox-border)] border-t border-[var(--nupsbox-border)] lg:border-l lg:border-t-0">
          {rest.map(post => (
            <article key={post.id} className="p-6 sm:p-7">
              <p className="text-xs font-bold text-[var(--nupsbox-muted)]">
                {post.publishedAt ? (vi ? dateFormatVi : dateFormatEn).format(new Date(post.publishedAt)) : ''}
              </p>
              <h3 className="mt-2 text-lg font-extrabold leading-snug tracking-[-0.025em] text-[var(--nupsbox-navy)]">
                <Link href={hrefFor(post.slug)} className="hover:text-[var(--nupsbox-blue)]">{post.title}</Link>
              </h3>
              {post.excerpt ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--nupsbox-slate)]">{post.excerpt}</p> : null}
              <Link href={hrefFor(post.slug)} className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[var(--nupsbox-blue)] hover:underline">
                {vi ? 'Đọc tiếp' : 'Read more'}
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
