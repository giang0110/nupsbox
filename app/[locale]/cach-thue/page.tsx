import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {HowItWorks} from '@/components/marketing/how-it-works';
import {FinalCta} from '@/components/marketing/final-cta';
import {Section} from '@/components/ui/section';
import {isSupportedLocale} from '@/i18n/routing';

export default async function Page({params}: {params: Promise<{locale:string}>}) {
  const {locale} = await params;
  if (!isSupportedLocale(locale)) notFound();
  setRequestLocale(locale);
  const vi = locale === 'vi';
  return (
    <main>
      <Section tone="navy" size="compact">
        <div className="max-w-3xl py-4 sm:py-6">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--nupsbox-yellow)]">{vi ? 'CÁCH BẮT ĐẦU' : 'HOW TO START'}</p>
          <h1 className="mt-4 text-5xl font-black tracking-[-0.045em] text-white sm:text-6xl">{vi ? 'Cách thuê kho NupsBox' : 'How to rent at NupsBox'}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/72">{vi ? 'Bắt đầu bằng việc hiểu nhu cầu, nhận gợi ý phù hợp rồi chọn báo giá hoặc lịch xem kho. Website không xem yêu cầu này là đặt chỗ tức thời.' : 'Start by understanding your need, review a recommendation, then choose a quote or viewing request. The website does not treat this as an instant reservation.'}</p>
        </div>
      </Section>
      <HowItWorks locale={locale}/>
      <FinalCta locale={locale}/>
    </main>
  );
}
