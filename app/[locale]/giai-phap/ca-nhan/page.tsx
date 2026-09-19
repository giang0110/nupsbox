import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {SolutionPage} from '@/components/marketing/solution-page';
import {createStaticPageMetadata} from '@/features/seo/static-page';
import {isSupportedLocale} from '@/i18n/routing';

export function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  return createStaticPageMetadata(params, 'solution:personal', {
    vi: {title: 'Kho mini cho cá nhân', description: 'Giải phóng không gian sống bằng một kho riêng cho những vật dụng bạn vẫn muốn giữ.'},
    en: {title: 'Mini storage for personal use', description: 'Free up room at home with a private unit for belongings you still want to keep.'}
  });
}

export default async function Page({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!isSupportedLocale(locale)) notFound();
  setRequestLocale(locale);

  return (
    <SolutionPage
      locale={locale}
      titleVi="Kho mini cho cá nhân"
      titleEn="Mini storage for personal use"
      bodyVi="Giải phóng không gian sống bằng một kho riêng cho những vật dụng bạn vẫn muốn giữ."
      bodyEn="Free up room at home with a private unit for belongings you still want to keep."
    />
  );
}
