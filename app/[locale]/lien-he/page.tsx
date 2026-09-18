import {Suspense} from 'react';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {MapPin} from 'lucide-react';
import {Section} from '@/components/ui/section';
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

  return (
    <main>
      <Section tone="soft" size="compact">
        <div className="grid gap-8 lg:grid-cols-[.84fr_1.16fr] lg:items-start lg:gap-12">
          <div className="lg:sticky lg:top-24">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--nupsbox-blue)]">
              {vi ? 'BÁO GIÁ & TƯ VẤN' : 'QUOTE & ADVICE'}
            </p>
            <h1 className="mt-3 max-w-3xl text-[clamp(2.65rem,4.6vw,4.2rem)] font-extrabold leading-[1.02] tracking-[-0.045em] text-[var(--nupsbox-navy)]">
              {vi ? 'Nhận tư vấn kho phù hợp' : 'Get help choosing the right storage'}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--nupsbox-slate)] sm:text-lg">
              {vi
                ? 'Cho NupsBox biết nhu cầu của bạn. Nếu bạn đến từ Storage Finder hoặc một loại kho cụ thể, lựa chọn đó sẽ được giữ làm ngữ cảnh cho yêu cầu.'
                : 'Tell NupsBox what you need. If you arrived from Storage Finder or a specific unit, that selection stays attached as context for your enquiry.'}
            </p>

            {location ? (
              <aside className="mt-6 rounded-2xl border border-[var(--nupsbox-border)] bg-white p-5 shadow-[var(--nupsbox-shadow-sm)]">
                <span className="grid size-10 place-items-center rounded-xl bg-[var(--nupsbox-yellow)] text-[var(--nupsbox-navy)]">
                  <MapPin size={19} aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-xl font-extrabold tracking-[-0.025em] text-[var(--nupsbox-navy)]">{location.name}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--nupsbox-slate)]">{location.address}</p>
              </aside>
            ) : (
              <aside
                className="mt-6 rounded-2xl border border-[var(--nupsbox-border)] bg-white p-5 text-sm leading-6 text-[var(--nupsbox-slate)] shadow-[var(--nupsbox-shadow-sm)]"
                role="status"
              >
                <p className="font-extrabold text-[var(--nupsbox-navy)]">
                  {vi ? 'Thông tin cơ sở chưa được công bố.' : 'Facility details are not currently published.'}
                </p>
                <p className="mt-2">
                  {vi
                    ? 'Bạn vẫn có thể gửi nhu cầu; NupsBox sẽ xác nhận địa điểm phù hợp khi liên hệ.'
                    : 'You can still send your requirements; NupsBox will confirm a suitable location when contacting you.'}
                </p>
              </aside>
            )}
          </div>

          <div id="lead-request">
            <div className="mb-4">
              <h2 className="text-xl font-extrabold tracking-[-0.025em] text-[var(--nupsbox-navy)]">
                {vi ? 'Không cần tự đoán diện tích.' : 'You do not need to guess the size.'}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--nupsbox-slate)]">
                {vi
                  ? 'Gửi thông tin tối thiểu cần thiết. NupsBox sẽ xác nhận nhu cầu, loại kho và mức giá hiện hành trước bước tiếp theo.'
                  : 'Send only the information needed. NupsBox will confirm your needs, suitable unit and current quote before the next step.'}
              </p>
            </div>
            <Suspense fallback={<div className="min-h-[26rem] rounded-3xl bg-white" aria-hidden="true" />}>
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
          </div>
        </div>
      </Section>
    </main>
  );
}
