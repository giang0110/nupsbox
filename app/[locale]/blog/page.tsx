import type {Metadata} from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {ArrowRight, ExternalLink} from 'lucide-react';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {FinalCta} from '@/components/marketing/final-cta';
import {PageIntro} from '@/components/ui/page-intro';
import {Section} from '@/components/ui/section';
import {isSupportedLocale} from '@/i18n/routing';
import {getPublishedBlogCards} from '@/features/content/blog';
import {createStaticPageMetadata} from '@/features/seo/static-page';

const dateFormatVi = new Intl.DateTimeFormat('vi-VN', {dateStyle: 'medium'});
const dateFormatEn = new Intl.DateTimeFormat('en-US', {dateStyle: 'medium'});

export function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  return createStaticPageMetadata(params, 'blog', {
    vi: {
      title: 'Phân tích kho mini, tồn kho & vận hành',
      description: 'Thư viện phân tích chuyên sâu của NupsBox về kho mini, tồn kho, tổ chức stockroom và lựa chọn không gian lưu trữ.'
    },
    en: {
      title: 'Mini storage, inventory & operations analysis',
      description: 'NupsBox in-depth analysis on mini storage, inventory, stockroom organization and choosing storage space.'
    }
  });
}

export default async function Page({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!isSupportedLocale(locale)) notFound();
  setRequestLocale(locale);

  const vi = locale === 'vi';
  const posts = await getPublishedBlogCards(locale);
  const [featured, ...rest] = posts;
  const hrefFor = (slug: string) => vi ? '/blog/' + slug : '/en/blog/' + slug;
  const formatter = vi ? dateFormatVi : dateFormatEn;

  return (
    <main>
      <PageIntro
        eyebrow="NUPSBOX INSIGHTS"
        title={vi ? 'Phân tích để dùng không gian tốt hơn.' : 'Analysis for better use of space.'}
        description={vi
          ? 'Không chỉ giới thiệu dịch vụ. NupsBox phân tích cách tổ chức hàng hóa, chọn diện tích, kiểm soát tồn kho và những quyết định nên làm trước khi thuê.'
          : 'Not just service promotion. NupsBox analyzes inventory organization, space sizing, stock control and the decisions to make before renting.'}
      />

      {featured ? (
        <Section size="compact">
          <div className="grid overflow-hidden rounded-[2rem] bg-[var(--nupsbox-navy)] text-white lg:grid-cols-[.95fr_1.05fr]">
            <div className="relative min-h-[300px] lg:min-h-[440px]">
              {featured.coverUrl ? (
                <Image
                  src={featured.coverUrl}
                  alt={featured.coverAlt ?? ''}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 48vw"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(255,211,26,.22),transparent_30%),linear-gradient(145deg,#0d2d62,#071a38_70%)]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(7,26,56,.55)] to-transparent" />
              <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/20 px-3 py-2 text-[0.68rem] font-black uppercase tracking-[0.14em] text-[var(--nupsbox-yellow)] backdrop-blur">
                {vi ? 'BÀI PHÂN TÍCH NỔI BẬT' : 'FEATURED ANALYSIS'}
              </div>
            </div>

            <article className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
              <p className="text-xs font-bold text-white/50">
                {featured.publishedAt ? formatter.format(new Date(featured.publishedAt)) : ''}
              </p>
              <h2 className="mt-3 text-[clamp(2rem,3.8vw,3.5rem)] font-extrabold leading-[1.04] tracking-[-0.045em]">
                {featured.title}
              </h2>
              {featured.excerpt ? (
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/68">{featured.excerpt}</p>
              ) : null}
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <Link
                  href={hrefFor(featured.slug)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--nupsbox-yellow)] px-5 text-sm font-black text-[var(--nupsbox-navy)]"
                >
                  {vi ? 'Đọc phân tích' : 'Read analysis'}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                {featured.sourceUrl ? (
                  <a
                    href={featured.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-white/68 hover:text-white hover:underline"
                  >
                    {vi ? 'Nguồn tham khảo' : 'Reference'}
                    <ExternalLink size={15} aria-hidden="true" />
                  </a>
                ) : null}
              </div>
            </article>
          </div>
        </Section>
      ) : null}

      <Section tone="soft" size="compact">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-3xl">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.15em] text-[var(--nupsbox-blue)]">
              {vi ? 'THƯ VIỆN CHUYÊN SÂU' : 'DEEP-DIVE LIBRARY'}
            </p>
            <h2 className="mt-3 text-[clamp(2rem,3.5vw,3.25rem)] font-extrabold leading-[1.04] tracking-[-0.04em] text-[var(--nupsbox-navy)]">
              {vi ? 'Từ bài toán không gian đến cách vận hành.' : 'From space constraints to operating discipline.'}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--nupsbox-slate)]">
              {vi
                ? 'Các bài tập trung vào quyết định có thể áp dụng: bố trí SKU, hàng chậm luân chuyển, kiểm kê, mở rộng văn phòng hay thuê kho, và cách chọn diện tích mà không thuê dư.'
                : 'Articles focus on actionable decisions: SKU layout, slow movers, stock checks, office expansion versus storage, and choosing space without over-renting.'}
            </p>
          </div>
          <p className="text-sm font-bold text-[var(--nupsbox-slate)]">
            {posts.length} {vi ? 'bài đã xuất bản' : 'published articles'}
          </p>
        </div>

        {rest.length ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rest.map((post, index) => (
              <article
                key={post.id}
                className="group flex min-h-[300px] flex-col rounded-[1.75rem] border border-[var(--nupsbox-border)] bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-[0_20px_54px_rgba(7,26,56,.08)]"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-black text-[var(--nupsbox-blue)]">0{index + 2}</span>
                  <span className="text-xs font-bold text-[var(--nupsbox-muted)]">
                    {post.publishedAt ? formatter.format(new Date(post.publishedAt)) : ''}
                  </span>
                </div>
                <h3 className="mt-8 text-xl font-extrabold leading-snug tracking-[-0.03em] text-[var(--nupsbox-navy)]">
                  <Link href={hrefFor(post.slug)} className="hover:text-[var(--nupsbox-blue)]">{post.title}</Link>
                </h3>
                {post.excerpt ? (
                  <p className="mt-3 line-clamp-4 text-sm leading-6 text-[var(--nupsbox-slate)]">{post.excerpt}</p>
                ) : null}
                <div className="mt-auto pt-6">
                  <Link href={hrefFor(post.slug)} className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[var(--nupsbox-blue)] hover:underline">
                    {vi ? 'Đọc bài' : 'Read article'}
                    <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : featured ? null : (
          <div className="mt-8 rounded-[1.75rem] border border-[var(--nupsbox-border)] bg-white p-7 text-[var(--nupsbox-slate)]">
            <p className="font-extrabold text-[var(--nupsbox-navy)]">
              {vi ? 'Thư viện đang được xây dựng.' : 'The library is being built.'}
            </p>
          </div>
        )}
      </Section>

      <FinalCta locale={locale} />
    </main>
  );
}
