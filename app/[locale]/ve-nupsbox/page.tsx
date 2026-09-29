import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {WarehouseGallery} from '@/components/marketing/warehouse-gallery';
import {FinalCta} from '@/components/marketing/final-cta';
import {PageIntro} from '@/components/ui/page-intro';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
import {isSupportedLocale} from '@/i18n/routing';
import {getMarketingFeaturedLocation} from '@/features/catalog/public-catalog';
import {getPublicLocationGallery} from '@/features/content/public-media';
import {getPublicSiteSettings} from '@/features/content/site-settings';
import {getCommercialContent, getCommercialFallback} from '@/features/content/commercial-content';
import {createLocalizedMetadata} from '@/features/seo/metadata';
import {getStaticSeoRoute} from '@/features/seo/routes';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale: rawLocale} = await params;
  const locale = rawLocale === 'en' ? 'en' : 'vi';
  const commercial = await getCommercialContent(locale).catch(() => getCommercialFallback(locale));
  const seo = commercial.pageSeo.about;
  return createLocalizedMetadata({
    route: getStaticSeoRoute('about'),
    locale,
    title: seo.title,
    description: seo.description
  });
}

export default async function Page({params}: {params: Promise<{locale:string}>}) {
  const {locale} = await params;
  if (!isSupportedLocale(locale)) notFound();
  setRequestLocale(locale);
  const vi = locale === 'vi';
  const [location, settings, commercial] = await Promise.all([
    getMarketingFeaturedLocation(locale),
    getPublicSiteSettings().catch(() => ({phone: null, zaloUrl: null, email: null, facebookUrl: null, openingHours: {}})),
    getCommercialContent(locale).catch(() => getCommercialFallback(locale))
  ]);
  const galleryItems = location ? await getPublicLocationGallery(location.id, locale) : [];

  return (
    <main>
      <PageIntro
        tone="navy"
        eyebrow={commercial.companyProfile.eyebrow ?? 'NUPSBOX'}
        title={commercial.companyProfile.title}
        description={commercial.companyProfile.description}
      />

      <Section>
        <SectionHeading
          eyebrow={commercial.capabilities.eyebrow ?? (vi ? 'CƠ SỞ & NĂNG LỰC' : 'FACILITIES & CAPABILITY')}
          title={commercial.capabilities.title}
          description={commercial.capabilities.description}
        />
      </Section>

      <WarehouseGallery locale={locale} items={galleryItems} />

      {settings.facebookUrl ? (
        <Section tone="soft" size="compact">
          <div className="flex flex-col gap-4 rounded-[1.75rem] border border-[var(--nupsbox-border)] bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div>
              <p className="text-[0.68rem] font-black uppercase tracking-[0.15em] text-[var(--nupsbox-blue)]">FACEBOOK</p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--nupsbox-slate)]">
                {vi
                  ? 'Theo dõi nguồn Facebook công khai đang được NupsBox liên kết để xem thêm nội dung và cập nhật.'
                  : 'Follow the public Facebook source linked by NupsBox for additional content and updates.'}
              </p>
            </div>
            <a
              href={settings.facebookUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-[var(--nupsbox-navy)] px-5 text-sm font-black text-white"
            >
              {vi ? 'Mở Facebook ↗' : 'Open Facebook ↗'}
            </a>
          </div>
        </Section>
      ) : null}

      <FinalCta locale={locale} content={commercial.cta}/>
    </main>
  );
}
