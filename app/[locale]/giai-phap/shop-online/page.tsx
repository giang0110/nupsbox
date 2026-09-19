import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {SolutionPage} from '@/components/marketing/solution-page';
import {createStaticPageMetadata} from '@/features/seo/static-page';
import {isSupportedLocale} from '@/i18n/routing';

export function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  return createStaticPageMetadata(params, 'solution:shop-online', {
    vi: {title: 'Kho mini cho shop online', description: 'Tách hàng hóa khỏi nhà ở và vận hành shop từ một điểm lưu trữ gọn tại TP.HCM.'},
    en: {title: 'Mini storage for online sellers', description: 'Keep inventory out of your living space and run your online shop from a compact storage base in Ho Chi Minh City.'}
  });
}

export default async function Page({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!isSupportedLocale(locale)) notFound();
  setRequestLocale(locale);

  return (
    <SolutionPage
      locale={locale}
      titleVi="Kho mini cho shop online"
      titleEn="Mini storage for online sellers"
      bodyVi="Tách hàng hóa khỏi nhà ở và vận hành shop từ một điểm lưu trữ gọn tại TP.HCM."
      bodyEn="Keep inventory out of your living space and run your online shop from a compact storage base in Ho Chi Minh City."
    />
  );
}
