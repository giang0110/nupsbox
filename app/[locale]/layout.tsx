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
import {getMarketingFeaturedLocation} from '@/features/catalog/public-catalog';
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
  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_ORIGIN}/#nupsbox`,
    name: 'NupsBox',
    url: locale === 'vi' ? SITE_ORIGIN : `${SITE_ORIGIN}/en`,
    ...(settings.phone ? {telephone: settings.phone} : {}),
    ...(settings.email ? {email: settings.email} : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: location.address,
      addressLocality: location.district,
      addressRegion: 'Ho Chi Minh City',
      addressCountry: 'VN'
    }
  };

  return (
    <html lang={locale}>
      <body>
        <JsonLd data={localBusiness} />
        <NextIntlClientProvider messages={messages}>
          <SiteHeader />
          {children}
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
