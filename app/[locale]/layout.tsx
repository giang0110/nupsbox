import type {Metadata} from 'next';
import type {ReactNode} from 'react';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {isSupportedLocale, locales} from '@/i18n/routing';
import {SiteHeader} from '@/components/marketing/site-header';
import {SiteFooter} from '@/components/marketing/site-footer';
import {MobileActionBar} from '@/components/marketing/mobile-action-bar';
import {JsonLd} from '@/components/seo/json-ld';
import {WebVitalsReporter} from '@/components/analytics/web-vitals-reporter';
import {getMarketingFeaturedLocation} from '@/features/catalog/public-catalog';
import {buildPublicBusinessEntity} from '@/features/seo/business-entity';
import {getPublicSiteSettings} from '@/features/content/site-settings';
import {SITE_ORIGIN} from '@/features/seo/routes';
import '../globals.css';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  const vi = locale !== 'en';
  return {
    metadataBase: new URL(SITE_ORIGIN),
    applicationName: 'NupsBox',
    title: {
      default: vi ? 'NupsBox | Kho mini cho kinh doanh tại TP.HCM' : 'NupsBox | Mini storage for business in Ho Chi Minh City',
      template: '%s | NupsBox'
    },
    description: vi
      ? 'Kho mini linh hoạt cho shop online, doanh nghiệp nhỏ và cá nhân tại TP.HCM.'
      : 'Flexible mini storage for online sellers, small businesses and individuals in Ho Chi Minh City.'
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: ReactNode;
  params: Promise<{locale: string}>;
}>) {
  const {locale} = await params;
  if (!isSupportedLocale(locale)) notFound();

  setRequestLocale(locale);
  const [messages, location, settings] = await Promise.all([
    getMessages(),
    getMarketingFeaturedLocation(locale),
    getPublicSiteSettings().catch(() => ({phone: null, zaloUrl: null, email: null, openingHours: {}}))
  ]);
  const businessEntity = buildPublicBusinessEntity({
    origin: SITE_ORIGIN,
    locale,
    location,
    settings
  });

  return (
    <html lang={locale}>
      <body>
        <a
          href="#main-content"
          className="sr-only z-[100] rounded-full bg-[var(--nupsbox-yellow)] px-4 py-3 text-sm font-extrabold text-[var(--nupsbox-navy)] shadow-lg focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:outline-none focus:ring-2 focus:ring-white"
        >
          {locale === 'vi' ? 'Bỏ qua điều hướng' : 'Skip to main content'}
        </a>
        <WebVitalsReporter />
        <JsonLd data={businessEntity} />
        <NextIntlClientProvider messages={messages}>
          <SiteHeader />
          <div id="main-content" tabIndex={-1}>
            {children}
          </div>
          <SiteFooter phone={settings.phone} email={settings.email} zaloUrl={settings.zaloUrl} />
          <MobileActionBar
            phoneUrl={settings.phone ? `tel:${settings.phone}` : null}
            zaloUrl={settings.zaloUrl ?? null}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
