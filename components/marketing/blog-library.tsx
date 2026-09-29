'use client';

import Image from 'next/image';
import Link from 'next/link';
import {ArrowRight, Filter} from 'lucide-react';
import {useMemo, useState} from 'react';
import {EditorialCover} from '@/components/marketing/editorial-cover';
import type {PublicBlogCard} from '@/features/content/blog';
import {
  getEditorialProfile,
  getEditorialTopicLabel,
  getEditorialTopicOptions,
  type EditorialTopicId
} from '@/features/content/editorial-taxonomy';

const dateFormatVi = new Intl.DateTimeFormat('vi-VN', {dateStyle: 'medium'});
const dateFormatEn = new Intl.DateTimeFormat('en-US', {dateStyle: 'medium'});

export function BlogLibrary({
  cards,
  locale
}: {
  cards: PublicBlogCard[];
  locale: 'vi' | 'en';
}) {
  const [activeTopic, setActiveTopic] = useState<'all' | EditorialTopicId>('all');
  const vi = locale === 'vi';
  const formatter = vi ? dateFormatVi : dateFormatEn;
  const hrefFor = (slug: string) => vi ? '/blog/' + slug : '/en/blog/' + slug;

  const topics = useMemo(
    () => getEditorialTopicOptions(locale).filter(option =>
      cards.some(card => getEditorialProfile(card.slug).topic === option.id)
    ),
    [cards, locale]
  );

  const visible = activeTopic === 'all'
    ? cards
    : cards.filter(card => getEditorialProfile(card.slug).topic === activeTopic);

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-2" aria-label={vi ? 'Lọc bài viết theo chủ đề' : 'Filter articles by topic'}>
        <span className="mr-1 inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[var(--nupsbox-slate)]">
          <Filter size={15} aria-hidden="true" />
          {vi ? 'Chủ đề' : 'Topics'}
        </span>
        <button
          type="button"
          aria-pressed={activeTopic === 'all'}
          onClick={() => setActiveTopic('all')}
          className="min-h-10 rounded-full border border-[var(--nupsbox-border)] px-4 text-sm font-bold text-[var(--nupsbox-navy)] transition aria-pressed:border-[var(--nupsbox-navy)] aria-pressed:bg-[var(--nupsbox-navy)] aria-pressed:text-white"
        >
          {vi ? 'Tất cả' : 'All'} · {cards.length}
        </button>
        {topics.map(topic => {
          const count = cards.filter(card => getEditorialProfile(card.slug).topic === topic.id).length;
          return (
            <button
              key={topic.id}
              type="button"
              aria-pressed={activeTopic === topic.id}
              onClick={() => setActiveTopic(topic.id)}
              className="min-h-10 rounded-full border border-[var(--nupsbox-border)] px-4 text-sm font-bold text-[var(--nupsbox-navy)] transition aria-pressed:border-[var(--nupsbox-blue)] aria-pressed:bg-[var(--nupsbox-blue)] aria-pressed:text-white"
            >
              {topic.label} · {count}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map(post => {
          const profile = getEditorialProfile(post.slug);
          return (
            <article
              key={post.id}
              className="group overflow-hidden rounded-[1.75rem] border border-[var(--nupsbox-border)] bg-white transition hover:-translate-y-0.5 hover:shadow-[0_20px_54px_rgba(7,26,56,.08)]"
            >
              <Link href={hrefFor(post.slug)} className="relative block aspect-[16/9] overflow-hidden">
                {post.coverUrl ? (
                  <Image
                    src={post.coverUrl}
                    alt={post.coverAlt ?? ''}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.02]"
                  />
                ) : (
                  <EditorialCover slug={post.slug} locale={locale} className="absolute inset-0" />
                )}
              </Link>

              <div className="flex min-h-[250px] flex-col p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-full bg-[var(--nupsbox-surface)] px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.11em] text-[var(--nupsbox-blue)]">
                    {getEditorialTopicLabel(profile.topic, locale)}
                  </span>
                  <span className="text-xs font-bold text-[var(--nupsbox-muted)]">
                    {post.publishedAt ? formatter.format(new Date(post.publishedAt)) : ''}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-extrabold leading-snug tracking-[-0.03em] text-[var(--nupsbox-navy)]">
                  <Link href={hrefFor(post.slug)} className="hover:text-[var(--nupsbox-blue)]">
                    {post.title}
                  </Link>
                </h3>
                {post.excerpt ? (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--nupsbox-slate)]">{post.excerpt}</p>
                ) : null}

                <Link
                  href={hrefFor(post.slug)}
                  className="mt-auto inline-flex min-h-10 items-center gap-2 pt-5 text-sm font-bold text-[var(--nupsbox-blue)] hover:underline"
                >
                  {vi ? 'Đọc phân tích' : 'Read analysis'}
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
