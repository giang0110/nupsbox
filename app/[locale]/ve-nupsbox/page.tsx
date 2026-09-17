import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {Gallery} from '@/components/marketing/gallery';
import {FinalCta} from '@/components/marketing/final-cta';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
import {isSupportedLocale} from '@/i18n/routing';

export default async function Page({params}: {params: Promise<{locale:string}>}) {
  const {locale} = await params;
  if (!isSupportedLocale(locale)) notFound();
  setRequestLocale(locale);
  const vi = locale === 'vi';
  return (
    <main>
      <Section tone="navy" size="compact">
        <div className="max-w-4xl py-4 sm:py-6">
          <p className="text-xs font-black tracking-[0.16em] text-[var(--nupsbox-yellow)]">SAVE SPACE. LIVE LARGE.</p>
          <h1 className="mt-4 text-5xl font-black tracking-[-0.045em] text-white sm:text-6xl">{vi ? 'NupsBox — kho mini cho nhu cầu đang tăng.' : 'NupsBox — mini storage for needs that are growing.'}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">{vi ? 'NupsBox tập trung vào kho mini linh hoạt cho shop online, doanh nghiệp nhỏ và nhu cầu lưu trữ tại TP.HCM.' : 'NupsBox focuses on flexible mini storage for online sellers, small businesses and storage needs in Ho Chi Minh City.'}</p>
        </div>
      </Section>
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
