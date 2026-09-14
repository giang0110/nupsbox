import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {MapPin} from 'lucide-react';
import {Container} from '@/components/ui/container';
import {LeadForm} from '@/components/forms/lead-form';
import {getMarketingFeaturedLocation} from '@/features/catalog/public-catalog';
import {getPublicSiteSettings} from '@/features/content/site-settings';
import {isSupportedLocale} from '@/i18n/routing';

export default async function Page({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!isSupportedLocale(locale)) notFound();
  setRequestLocale(locale);
  const [location, settings] = await Promise.all([
    getMarketingFeaturedLocation(locale),
    getPublicSiteSettings().catch(() => ({phone: null, zaloUrl: null, email: null, openingHours: {}}))
  ]);
  const vi = locale === 'vi';

  return <main>
    <section className="py-20">
      <Container className="grid gap-10 lg:grid-cols-[1fr_.8fr]">
        <div>
          <h1 className="text-5xl font-black tracking-[-0.055em] text-[var(--nupsbox-navy)] sm:text-6xl">{vi ? 'Liên hệ NupsBox' : 'Contact NupsBox'}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--nupsbox-slate)]">{vi ? 'Cho NupsBox biết loại hàng, lượng hàng và khu vực bạn cần. Thông tin được gửi qua kênh server bảo mật và lưu trong CRM nội bộ.' : 'Tell NupsBox what you store, roughly how much, and where you need it. Your enquiry is submitted through a secure server-side channel into the internal CRM.'}</p>
        </div>
        <aside className="rounded-[2rem] bg-[var(--nupsbox-surface)] p-7">
          <MapPin className="text-[var(--nupsbox-blue)]" />
          <h2 className="mt-5 text-2xl font-black text-[var(--nupsbox-navy)]">{location.name}</h2>
          <p className="mt-3 leading-7 text-[var(--nupsbox-slate)]">{location.address}</p>
        </aside>
      </Container>
    </section>
    <section id="lead-request" className="bg-[var(--nupsbox-navy)] py-16 text-white">
      <Container className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
        <div><h2 className="text-3xl font-black tracking-[-0.04em]">{vi ? 'Nhận tư vấn loại kho phù hợp' : 'Get help choosing the right unit'}</h2><p className="mt-4 text-white/70">{vi ? 'Không cần biết chính xác bao nhiêu m². Hãy mô tả lượng hàng, NupsBox sẽ hỗ trợ xác nhận loại kho và báo giá hiện hành.' : 'You do not need to know the exact square metres. Describe what you store and NupsBox can help confirm a suitable unit and current quote.'}</p></div>
        <LeadForm locale={locale} fallbackPhone={settings.phone} fallbackZalo={settings.zaloUrl} />
      </Container>
    </section>
  </main>;
}
