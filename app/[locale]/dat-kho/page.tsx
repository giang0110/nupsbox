import {Suspense} from 'react';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {Section} from '@/components/ui/section';
import {LeadForm} from '@/components/forms/lead-form';
import {getMarketingLocationBySlug, getMarketingUnitBySlug} from '@/features/catalog/public-catalog';
import {getPublicSiteSettings} from '@/features/content/site-settings';
import {isSupportedLocale} from '@/i18n/routing';
import {normalizeLeadNeed, normalizeLeadVolume} from '@/features/leads/intake';

export const metadata: Metadata = {robots: {index: false, follow: true}};

export default async function Page({
  params,
  searchParams
}: {
  params: Promise<{locale: string}>;
  searchParams: Promise<{unit?: string; location?: string; need?: string; volume?: string}>;
}) {
  const {locale} = await params;
  if (!isSupportedLocale(locale)) notFound();
  setRequestLocale(locale);
  const query = await searchParams;
  const intakeNeed = normalizeLeadNeed(query.need);
  const intakeVolume = normalizeLeadVolume(query.volume);

  const [requestedLocation, requestedUnit, settings] = await Promise.all([
    query.location ? getMarketingLocationBySlug(query.location, locale) : Promise.resolve(null),
    query.unit ? getMarketingUnitBySlug(query.unit, locale) : Promise.resolve(null),
    getPublicSiteSettings().catch(() => ({phone: null, zaloUrl: null, email: null, openingHours: {}}))
  ]);

  const vi = locale === 'vi';

  return (
    <main>
      <Section tone="soft" size="compact">
        <div className="grid gap-8 lg:grid-cols-[.84fr_1.16fr] lg:items-start lg:gap-12">
          <div className="lg:sticky lg:top-24">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--nupsbox-blue)]">LIGHT BOOKING</p>
            <h1 className="mt-3 max-w-3xl text-[clamp(2.65rem,4.6vw,4.2rem)] font-extrabold leading-[1.02] tracking-[-0.045em] text-[var(--nupsbox-navy)]">
              {vi ? 'Đề xuất lịch xem kho' : 'Request a storage viewing'}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--nupsbox-slate)] sm:text-lg">
              {vi
                ? 'Gửi nhu cầu thuê kho và, nếu muốn, đề xuất một thời gian xem kho. Lựa chọn loại kho/địa điểm từ bước trước sẽ được giữ làm ngữ cảnh.'
                : 'Send your storage requirements and optionally propose a viewing time. Any unit/location selected earlier stays attached as context.'}
            </p>
            <div className="mt-6 rounded-2xl border border-[var(--nupsbox-border)] bg-white p-5 text-sm leading-6 text-[var(--nupsbox-slate)] shadow-[var(--nupsbox-shadow-sm)]">
              <p className="font-extrabold text-[var(--nupsbox-navy)]">{vi ? 'Lưu ý' : 'Important'}</p>
              <p className="mt-2">
                {vi
                  ? 'Đây là yêu cầu đặt lịch xem kho, không phải đặt cọc, thanh toán hay giữ chỗ kho theo thời gian thực.'
                  : 'This is a viewing request, not a deposit, payment, or real-time storage reservation.'}
              </p>
            </div>
          </div>

          <Suspense fallback={<div className="min-h-[34rem] rounded-3xl bg-white" aria-hidden="true" />}>
            <LeadForm
              locale={locale}
              fallbackPhone={settings.phone}
              fallbackZalo={settings.zaloUrl}
              unitTypeId={requestedUnit?.id}
              unitName={requestedUnit?.name}
              locationId={requestedLocation?.id}
              locationName={requestedLocation?.name}
              needType={intakeNeed}
              estimatedVolume={intakeVolume}
              appointmentMode
            />
          </Suspense>
        </div>
      </Section>
    </main>
  );
}
