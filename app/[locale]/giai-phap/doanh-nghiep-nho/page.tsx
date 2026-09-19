import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {SolutionPage} from '@/components/marketing/solution-page';
import {createStaticPageMetadata} from '@/features/seo/static-page';
import {isSupportedLocale} from '@/i18n/routing';

export function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  return createStaticPageMetadata(params, 'solution:small-business', {
    vi: {title: 'Kho cho doanh nghiệp nhỏ', description: 'Có thêm chỗ cho hàng mẫu, thiết bị và tồn kho mà không cần thuê thêm một văn phòng lớn.'},
    en: {title: 'Storage for small businesses', description: 'Create room for samples, equipment and inventory without taking on another large office lease.'}
  });
}

export default async function Page({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!isSupportedLocale(locale)) notFound();
  setRequestLocale(locale);

  return (
    <SolutionPage
      locale={locale}
      titleVi="Kho cho doanh nghiệp nhỏ"
      titleEn="Storage for small businesses"
      bodyVi="Có thêm chỗ cho hàng mẫu, thiết bị và tồn kho mà không cần thuê thêm một văn phòng lớn."
      bodyEn="Create room for samples, equipment and inventory without taking on another large office lease."
    />
  );
}
