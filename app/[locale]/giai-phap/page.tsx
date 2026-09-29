import type {Metadata} from 'next';
import Image from 'next/image';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {PageIntro} from '@/components/ui/page-intro';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
import {FinalCta} from '@/components/marketing/final-cta';
import {isSupportedLocale} from '@/i18n/routing';
import {createLocalizedMetadata} from '@/features/seo/metadata';
import {getStaticSeoRoute} from '@/features/seo/routes';
import {getCommercialContent, getCommercialFallback} from '@/features/content/commercial-content';
import {getPublicEditorialMediaForContexts} from '@/features/content/editorial-media';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale: rawLocale} = await params;
  const locale = rawLocale === 'en' ? 'en' : 'vi';
  const commercial = await getCommercialContent(locale).catch(() => getCommercialFallback(locale));
  return createLocalizedMetadata({
    route: getStaticSeoRoute('solutions'),
    locale,
    title: commercial.pageSeo.solutions.title,
    description: commercial.pageSeo.solutions.description
  });
}

export default async function SolutionsPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!isSupportedLocale(locale)) notFound();
  setRequestLocale(locale);
  const vi = locale === 'vi';
  const commercial = await getCommercialContent(locale).catch(() => getCommercialFallback(locale));
  const items = [
    {href: '/giai-phap/shop-online' as const, key: 'shop-online', content: commercial.serviceGroups.shopOnline},
    {href: '/giai-phap/doanh-nghiep-nho' as const, key: 'small-business', content: commercial.serviceGroups.smallBusiness},
    {href: '/giai-phap/chua-hang' as const, key: 'inventory', content: commercial.serviceGroups.inventory},
    {href: '/giai-phap/ca-nhan' as const, key: 'personal', content: commercial.serviceGroups.personal}
  ] as const;
  const solutionVisuals = await getPublicEditorialMediaForContexts('solution', items.map(item => item.key), locale, 1);

  return (
    <main>
      <PageIntro
        eyebrow={commercial.services.eyebrow ?? (vi ? 'DỊCH VỤ' : 'SERVICES')}
        title={commercial.services.title}
        description={commercial.services.description}
      />

      <Section>
        <SectionHeading
          eyebrow={vi ? 'NHÓM DỊCH VỤ' : 'SERVICE GROUPS'}
          title={vi ? 'Thông tin dịch vụ theo từng nhu cầu sử dụng.' : 'Service information organized by use case.'}
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {items.map(({href, key, content}, index) => {
            const visual = solutionVisuals[key]?.[0];
            return (
              <Link
                key={href}
                href={href}
                className="group overflow-hidden rounded-[1.75rem] border border-[var(--nupsbox-border)] bg-white transition hover:-translate-y-0.5 hover:border-[rgba(8,70,168,.28)] hover:shadow-[0_18px_46px_rgba(7,26,56,.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nupsbox-blue)] focus-visible:ring-offset-2"
              >
                {visual ? (
                  <div className="relative aspect-[16/7] overflow-hidden bg-[var(--nupsbox-surface)]">
                    <Image
                      src={visual.url}
                      alt={visual.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(7,26,56,.55)] via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-4 rounded-full bg-black/40 px-2.5 py-1 text-[0.58rem] font-black uppercase tracking-[0.11em] text-white/90 backdrop-blur">
                      {vi ? 'ẢNH CƠ SỞ NUPSBOX' : 'REAL NUPSBOX IMAGERY'}
                    </span>
                  </div>
                ) : null}
                <div className="p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-xl font-extrabold tracking-[-0.025em] text-[var(--nupsbox-navy)] sm:text-2xl">{content.title}</h2>
                    <span className="text-4xl font-black tracking-[-0.08em] text-[var(--nupsbox-navy)]/[0.06]">0{index + 1}</span>
                  </div>
                  <p className="mt-2.5 text-sm leading-6 text-[var(--nupsbox-slate)]">{content.description}</p>
                  <span className="mt-5 inline-flex text-sm font-black text-[var(--nupsbox-blue)]">
                    {vi ? 'Xem giải pháp →' : 'View solution →'}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </Section>

      <FinalCta locale={locale} content={commercial.cta} />
    </main>
  );
}
