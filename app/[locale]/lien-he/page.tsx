import {Suspense} from 'react';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {MapPin} from 'lucide-react';
import {Container} from '@/components/ui/container';
import {LeadForm} from '@/components/forms/lead-form';
import {getMarketingFeaturedLocation, getMarketingLocationBySlug, getMarketingUnitBySlug} from '@/features/catalog/public-catalog';
import {getPublicSiteSettings} from '@/features/content/site-settings';
import {isSupportedLocale} from '@/i18n/routing';

export default async function Page({
  params,
  searchParams
}: {
  params: Promise<{locale: string}>;
  searchParams: Promise<{unit?: string; location?: string}>;
}) {
  const {locale} = await params;
  if (!isSupportedLocale(locale)) notFound();
  setRequestLocale(locale);
  const query = await searchParams;
  const [featuredLocation, requestedLocation, requestedUnit, settings] = await Promise.all([
    getMarketingFeaturedLocation(locale),
    query.location ? getMarketingLocationBySlug(query.location, locale) : Promise.resolve(null),
    query.unit ? getMarketingUnitBySlug(query.unit, locale) : Promise.resolve(null),
    getPublicSiteSettings().catch(() => ({phone: null, zaloUrl: null, email: null, openingHours: {}}))
  ]);
  const location = requestedLocation ?? featuredLocation;
  const vi = locale === 'vi';

  return <main>
    <section className="py-20">
      <Container className="grid gap-10 lg:grid-cols-[1fr_.8fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--nupsbox-blue)]">{vi ? 'BÁO GIÁ & TƯ VẤN' : 'QUOTE & ADVICE'}</p>
          <h1 className="mt-3 text-5xl font-black tracking-[-0.05em] text-[var(--nupsbox-navy)] sm:text-6xl">{vi ? 'Nhận tư vấn kho phù hợp' : 'Get help choosing the right storage'}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--nupsbox-slate)]">{vi ? 'Cho NupsBox biết nhu cầu của bạn. Nếu bạn đến từ Storage Finder hoặc một loại kho cụ thể, lựa chọn đó sẽ được giữ làm ngữ cảnh cho yêu cầu.' : 'Tell NupsBox what you need. If you arrived from Storage Finder or a specific unit, that selection stays attached as context for your enquiry.'}</p>
        </div>
        <aside className="rounded-[1.75rem] bg-[var(--nupsbox-surface)] p-7">
          <MapPin className="text-[var(--nupsbox-blue)]" />
          <h2 className="mt-5 text-2xl font-black text-[var(--nupsbox-navy)]">{location.name}</h2>
          <p className="mt-3 leading-7 text-[var(--nupsbox-slate)]">{location.address}</p>
        </aside>
      </Container>
    </section>
    <section id="lead-request" className="bg-[var(--nupsbox-navy)] py-16 text-white">
      <Container className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
        <div><h2 className="text-3xl font-black tracking-[-0.04em]">{vi ? 'Không cần tự đoán diện tích.' : 'You do not need to guess the size.'}</h2><p className="mt-4 text-white/70">{vi ? 'Hãy gửi thông tin tối thiểu cần thiết. NupsBox sẽ xác nhận nhu cầu, loại kho và mức giá hiện hành trước bước tiếp theo.' : 'Send only the information needed. NupsBox will confirm your needs, suitable unit and current quote before the next step.'}</p></div>
        <Suspense fallback={<div className="min-h-[28rem] rounded-[2rem] bg-white/10" aria-hidden="true" />}>
          <LeadForm
            locale={locale}
            fallbackPhone={settings.phone}
            fallbackZalo={settings.zaloUrl}
            unitTypeId={requestedUnit?.id}
            unitName={requestedUnit?.name}
            locationId={requestedLocation?.id}
            locationName={requestedLocation?.name}
          />
        </Suspense>
      </Container>
    </section>
  </main>;
}
