import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {Gallery} from '@/components/marketing/gallery';
import {FinalCta} from '@/components/marketing/final-cta';
import {PageIntro} from '@/components/ui/page-intro';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
import {isSupportedLocale} from '@/i18n/routing';
import {createStaticPageMetadata} from '@/features/seo/static-page';

export function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  return createStaticPageMetadata(params, 'about', {
    vi: {
      title: 'Về NupsBox',
      description: 'Tìm hiểu cách NupsBox xây dựng trải nghiệm kho mini với thông tin minh bạch trước khi thuê.'
    },
    en: {
      title: 'About NupsBox',
      description: 'Learn how NupsBox approaches mini storage with clear information before you rent.'
    }
  });
}

export default async function Page({params}: {params: Promise<{locale:string}>}) {
  const {locale} = await params;
  if (!isSupportedLocale(locale)) notFound();
  setRequestLocale(locale);
  const vi = locale === 'vi';

  return (
    <main>
      <PageIntro
        tone="navy"
        eyebrow="SAVE SPACE. LIVE LARGE."
        title={vi ? 'NupsBox — kho mini cho nhu cầu đang tăng.' : 'NupsBox — mini storage for needs that are growing.'}
        description={vi
          ? 'NupsBox tập trung vào kho mini linh hoạt cho shop online, doanh nghiệp nhỏ và nhu cầu lưu trữ tại TP.HCM.'
          : 'NupsBox focuses on flexible mini storage for online sellers, small businesses and storage needs in Ho Chi Minh City.'}
      />

      <Section>
        <SectionHeading
          eyebrow={vi ? 'CÁCH CHÚNG TÔI THIẾT KẾ DỊCH VỤ' : 'HOW THE SERVICE IS DESIGNED'}
          title={vi ? 'Minh bạch trước khi thuê.' : 'Clarity before you rent.'}
          description={vi
            ? 'Website chỉ hiển thị loại kho, giá và thông tin vận hành khi có dữ liệu tương ứng; những gì cần xác nhận sẽ được ghi rõ là cần xác nhận.'
            : 'The website displays unit, pricing and operational details only when the corresponding data exists; anything requiring confirmation is labeled accordingly.'}
        />
      </Section>

      <Gallery locale={locale}/>
      <FinalCta locale={locale}/>
    </main>
  );
}
