import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {isSupportedLocale} from '@/i18n/routing';
import {notFound} from 'next/navigation';

export default async function HomePage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!isSupportedLocale(locale)) notFound();

  setRequestLocale(locale);
  const t = await getTranslations('home');

  return (
    <main>
      <p>{t('eyebrow')}</p>
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
      <Link href="/kho-mini">{t('primaryCta')}</Link>
      <Link href="/bang-gia">{t('secondaryCta')}</Link>
    </main>
  );
}
