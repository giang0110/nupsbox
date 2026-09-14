import type {Metadata} from 'next';
import type {ReactNode} from 'react';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {isSupportedLocale, locales} from '@/i18n/routing';
import '../globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://nupsbox.vn'),
  title: {
    default: 'NupsBox | Kho mini cho kinh doanh tại TP.HCM',
    template: '%s | NupsBox'
  },
  description: 'Kho mini linh hoạt cho shop online, SME và cá nhân tại TP.HCM.'
};

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

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
