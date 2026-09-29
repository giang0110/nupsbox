import type {Metadata} from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {ArrowRight, ExternalLink} from 'lucide-react';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {BlogLibrary} from '@/components/marketing/blog-library';
import {EditorialCover} from '@/components/marketing/editorial-cover';
import {FinalCta} from '@/components/marketing/final-cta';
import {PageIntro} from '@/components/ui/page-intro';
import {Section} from '@/components/ui/section';
import {isSupportedLocale} from '@/i18n/routing';
import {getPublishedBlogCards} from '@/features/content/blog';
import {getEditorialProfile, getEditorialTopicLabel} from '@/features/content/editorial-taxonomy';
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
  const featuredProfile = featured ? getEditorialProfile(featured.slug) : null;

  return (
    <main>
      <PageIntro
        eyebrow="NUPSBOX INSIGHTS"
        title={vi ? 'Phân tích để dùng không gian tốt hơn.' : 'Analysis for better use of space.'}
        description={vi
          ? 'Không chỉ giới thiệu dịch vụ. NupsBox phân tích cách tổ chức hàng hóa, chọn diện tích, kiểm soát tồn kho và những quyết định nên làm trước khi thuê.'
          : 'Not just service promotion. NupsBox analyzes inventory organization, space sizing, stock control and the decisions to make before renting.'}
      />

      {featured && featuredProfile ? (
        <Section size="compact">
          <div className="grid overflow-hidden rounded-[2rem] bg-[var(--nupsbox-navy)] text-white lg:grid-cols-[.95fr_1.05fr]">
            <div className="relative min-h-[300px] lg:min-h-[420px]">
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
                <EditorialCover slug={featured.slug} locale={locale} className="absolute inset-0" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(7,26,56,.5)] to-transparent" />
              <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/20 px-3 py-2 text-[0.68rem] font-black uppercase tracking-[0.14em] text-[var(--nupsbox-yellow)] backdrop-blur">
                {vi ? 'BÀI PHÂN TÍCH NỔI BẬT' : 'FEATURED ANALYSIS'}
              </div>
            </div>

            <article className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-white/10 px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.12em] text-[var(--nupsbox-yellow)]">
                  {getEditorialTopicLabel(featuredProfile.topic, locale)}
                </span>
                <span className="text-xs font-bold text-white/50">
                  {featured.publishedAt ? formatter.format(new Date(featured.publishedAt)) : ''}
                </span>
              </div>
              <h2 className="mt-4 text-[clamp(2rem,3.8vw,3.5rem)] font-extrabold leading-[1.04] tracking-[-0.045em]">
                {featured.title}
              </h2>
              {featured.excerpt ? (
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/68">{featured.excerpt}</p>
              ) : null}
              <p className="mt-5 max-w-2xl border-l-2 border-[var(--nupsbox-yellow)] pl-4 text-sm leading-6 text-white/72">
                {vi ? featuredProfile.questionVi : featuredProfile.questionEn}
              </p>
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
              {vi ? 'Chọn đúng chủ đề, đi thẳng vào vấn đề.' : 'Choose a topic and go straight to the problem.'}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--nupsbox-slate)]">
              {vi
                ? 'Lọc nhanh theo bài toán: chọn diện tích, shop online, tồn kho, doanh nghiệp hay nhu cầu cá nhân. Mỗi bài tập trung vào một quyết định có thể áp dụng.'
                : 'Filter by the problem you are solving: space sizing, e-commerce, inventory, business or personal storage. Each article focuses on an actionable decision.'}
            </p>
          </div>
          <p className="text-sm font-bold text-[var(--nupsbox-slate)]">
            {posts.length} {vi ? 'bài đã xuất bản' : 'published articles'}
          </p>
        </div>

        {rest.length ? (
          <BlogLibrary cards={rest} locale={locale} />
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
