import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {SolutionPage} from '@/components/marketing/solution-page';
import {createStaticPageMetadata} from '@/features/seo/static-page';
import {isSupportedLocale} from '@/i18n/routing';

export function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  return createStaticPageMetadata(params, 'solution:inventory', {
    vi: {title: 'Kho chứa hàng linh hoạt', description: 'Bổ sung không gian cho lượng hàng bạn chưa cần đặt tại cửa hàng hoặc văn phòng.'},
    en: {title: 'Flexible inventory storage', description: 'Add flexible space for inventory that does not need to sit inside your shop or office.'}
  });
}

export default async function Page({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!isSupportedLocale(locale)) notFound();
  setRequestLocale(locale);

  return (
    <SolutionPage
      locale={locale}
      titleVi="Kho chứa hàng linh hoạt"
      titleEn="Flexible inventory storage"
      bodyVi="Bổ sung không gian cho lượng hàng bạn chưa cần đặt tại cửa hàng hoặc văn phòng."
      bodyEn="Add flexible space for inventory that does not need to sit inside your shop or office."
    />
  );
}
