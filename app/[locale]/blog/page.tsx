import type {Metadata} from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {ArrowRight, BookOpenText, ExternalLink} from 'lucide-react';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {FinalCta} from '@/components/marketing/final-cta';
import {PageIntro} from '@/components/ui/page-intro';
import {Section} from '@/components/ui/section';
import {isSupportedLocale} from '@/i18n/routing';
import {getPublishedBlogCards, type PublicBlogCard} from '@/features/content/blog';
import {createStaticPageMetadata} from '@/features/seo/static-page';

const dateFormatVi = new Intl.DateTimeFormat('vi-VN', {dateStyle: 'medium'});
const dateFormatEn = new Intl.DateTimeFormat('en-US', {dateStyle: 'medium'});

function topicFor(slug: string, vi: boolean) {
  if (slug.includes('shop-online')) return vi ? 'SHOP ONLINE' : 'ONLINE SELLERS';
  if (slug.includes('dien-tich')) return vi ? 'CHỌN DIỆN TÍCH' : 'SIZE PLANNING';
  if (slug.includes('van-phong')) return vi ? 'DOANH NGHIỆP NHỎ' : 'SMALL BUSINESS';
  if (slug.includes('hang-ton')) return vi ? 'HÀNG TỒN' : 'INVENTORY';
  if (slug.includes('ca-nhan')) return vi ? 'CÁ NHÂN' : 'PERSONAL';
  return vi ? 'VẬN HÀNH KHO' : 'STORAGE OPERATIONS';
}

function ArticleVisual({post, featured = false}: {post: PublicBlogCard; featured?: boolean}) {
  if (post.coverUrl) {
    return (
      <div className={'relative overflow-hidden ' + (featured ? 'min-h-[280px] lg:min-h-full' : 'aspect-[16/9]')}>
        <Image
          src={post.coverUrl}
          alt={post.coverAlt ?? ''}
          fill
          sizes={featured ? '(max-width: 1024px) 100vw, 46vw' : '(max-width: 768px) 100vw, 50vw'}
          className="object-cover transition duration-500 group-hover:scale-[1.02]"
        />
      </div>
    );
  }

  return (
    <div className={'relative overflow-hidden bg-[var(--nupsbox-navy)] ' + (featured ? 'min-h-[280px] lg:min-h-full' : 'aspect-[16/9]')}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(255,211,26,.22),transparent_25%),linear-gradient(145deg,transparent,#0c326d)]" />
      <div className="absolute inset-x-6 bottom-6">
        <p className="text-[0.7rem] font-black uppercase tracking-[0.16em] text-[var(--nupsbox-yellow)]">NUPSBOX INSIGHTS</p>
      </div>
    </div>
  );
}

export function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  return createStaticPageMetadata(params, 'blog', {
    vi: {
      title: 'Phân tích kho mini, hàng tồn & vận hành',
      description: 'Phân tích chuyên sâu của NupsBox về chọn diện tích, tổ chức hàng hóa, shop online, doanh nghiệp nhỏ và lưu trữ cá nhân.'
    },
    en: {
      title: 'Storage, inventory & operations analysis',
      description: 'In-depth NupsBox analysis on sizing, stock organization, online selling, small-business storage and personal storage.'
    }
  });
}

export default async function Page({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!isSupportedLocale(locale)) notFound();
  setRequestLocale(locale);

  const vi = locale === 'vi';
  const posts = await getPublishedBlogCards(locale);
  const [featured, ...remaining] = posts;
  const hrefFor = (slug: string) => vi ? '/blog/' + slug : '/en/blog/' + slug;

  return (
    <main>
      <PageIntro
        eyebrow="NUPSBOX INSIGHTS"
        title={vi ? 'Không chỉ thuê kho. Hiểu cách dùng không gian tốt hơn.' : 'Not just renting storage. Learn how to use space better.'}
        description={vi
          ? 'Các bài phân tích tập trung vào quyết định thực tế: cần bao nhiêu diện tích, sắp hàng thế nào, khi nào nên tách kho khỏi nhà hoặc văn phòng và cách kiểm soát hàng chậm luân chuyển.'
          : 'Practical analysis on how much space you need, how to organize stock, when to separate storage from home or office, and how to manage slow-moving inventory.'}
      />

      <Section size="compact">
        {featured ? (
          <>
            <article className="group grid overflow-hidden rounded-[2rem] border border-[var(--nupsbox-border)] bg-white shadow-[0_20px_60px_rgba(7,26,56,.08)] lg:grid-cols-[.9fr_1.1fr]">
              <ArticleVisual post={featured} featured />
              <div className="p-6 sm:p-8 lg:p-10">
                <p className="flex items-center gap-2 text-[0.7rem] font-black uppercase tracking-[0.15em] text-[var(--nupsbox-blue)]">
                  <BookOpenText size={15} aria-hidden="true" />
                  {vi ? 'BÀI PHÂN TÍCH NỔI BẬT' : 'FEATURED ANALYSIS'}
                </p>
                <p className="mt-5 text-xs font-bold text-[var(--nupsbox-muted)]">
                  {topicFor(featured.slug, vi)}
                  {featured.publishedAt ? ' · ' + (vi ? dateFormatVi : dateFormatEn).format(new Date(featured.publishedAt)) : ''}
                </p>
                <h2 className="mt-3 text-[clamp(2rem,4vw,3.4rem)] font-extrabold leading-[1.03] tracking-[-0.045em] text-[var(--nupsbox-navy)]">
                  <Link href={hrefFor(featured.slug)} className="hover:text-[var(--nupsbox-blue)]">{featured.title}</Link>
                </h2>
                {featured.excerpt ? <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--nupsbox-slate)]">{featured.excerpt}</p> : null}
                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <Link href={hrefFor(featured.slug)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--nupsbox-navy)] px-5 text-sm font-bold text-white">
                    {vi ? 'Đọc bài chuyên sâu' : 'Read the full analysis'}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                  {featured.sourceUrl ? (
                    <a href={featured.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[var(--nupsbox-blue)] hover:underline">
                      {vi ? 'Nguồn tham khảo' : 'Reference'}
                      <ExternalLink size={15} aria-hidden="true" />
                    </a>
                  ) : null}
                </div>
              </div>
            </article>

            {remaining.length ? (
              <div className="mt-10">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-[0.7rem] font-black uppercase tracking-[0.15em] text-[var(--nupsbox-blue)]">
                      {vi ? 'THƯ VIỆN PHÂN TÍCH' : 'INSIGHT LIBRARY'}
                    </p>
                    <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-[var(--nupsbox-navy)]">
                      {vi ? 'Đọc theo bài toán bạn đang gặp.' : 'Read by the problem you are solving.'}
                    </h2>
                  </div>
                  <p className="max-w-xl text-sm leading-6 text-[var(--nupsbox-slate)]">
                    {vi ? 'Mỗi bài đi sâu vào một quyết định vận hành cụ thể thay vì lặp lại thông tin bán hàng.' : 'Each article goes deep on one operating decision instead of repeating sales copy.'}
                  </p>
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  {remaining.map(post => (
                    <article key={post.id} className="group overflow-hidden rounded-[1.75rem] border border-[var(--nupsbox-border)] bg-white">
                      <ArticleVisual post={post} />
                      <div className="p-6">
                        <p className="text-[0.68rem] font-black uppercase tracking-[0.13em] text-[var(--nupsbox-blue)]">{topicFor(post.slug, vi)}</p>
                        <h3 className="mt-2 text-xl font-extrabold leading-snug tracking-[-0.03em] text-[var(--nupsbox-navy)]">
                          <Link href={hrefFor(post.slug)} className="hover:text-[var(--nupsbox-blue)]">{post.title}</Link>
                        </h3>
                        {post.excerpt ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--nupsbox-slate)]">{post.excerpt}</p> : null}
                        <Link href={hrefFor(post.slug)} className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[var(--nupsbox-blue)] hover:underline">
                          {vi ? 'Đọc phân tích' : 'Read analysis'}
                          <ArrowRight size={15} aria-hidden="true" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="rounded-[1.75rem] border border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] p-7 text-[var(--nupsbox-slate)]">
            <p className="font-extrabold text-[var(--nupsbox-navy)]">
              {vi ? 'Thư viện phân tích đang được cập nhật.' : 'The insight library is being updated.'}
            </p>
          </div>
        )}
      </Section>

      <FinalCta locale={locale} />
    </main>
  );
}
