import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {HowItWorks} from '@/components/marketing/how-it-works';
import {FinalCta} from '@/components/marketing/final-cta';
import {PageIntro} from '@/components/ui/page-intro';
import {isSupportedLocale} from '@/i18n/routing';

export default async function Page({params}: {params: Promise<{locale:string}>}) {
  const {locale} = await params;
  if (!isSupportedLocale(locale)) notFound();
  setRequestLocale(locale);
  const vi = locale === 'vi';

  return (
    <main>
      <PageIntro
        tone="navy"
        eyebrow={vi ? 'CÁCH BẮT ĐẦU' : 'HOW TO START'}
        title={vi ? 'Cách thuê kho NupsBox' : 'How to rent at NupsBox'}
        description={vi
          ? 'Bắt đầu bằng việc hiểu nhu cầu, nhận gợi ý phù hợp rồi chọn báo giá hoặc lịch xem kho. Website không xem yêu cầu này là đặt chỗ tức thời.'
          : 'Start by understanding your need, review a recommendation, then choose a quote or viewing request. The website does not treat this as an instant reservation.'}
      />
      <HowItWorks locale={locale}/>
      <FinalCta locale={locale}/>
    </main>
  );
}
