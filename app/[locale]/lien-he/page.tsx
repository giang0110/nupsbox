import type {Metadata} from 'next';
import {Suspense} from 'react';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {MapPin} from 'lucide-react';
import {Section} from '@/components/ui/section';
import {TrackedContactLink} from '@/components/marketing/tracked-contact-link';
import {LeadForm} from '@/components/forms/lead-form';
import {getMarketingFeaturedLocation, getMarketingLocationBySlug, getMarketingUnitBySlug} from '@/features/catalog/public-catalog';
import {getPublicSiteSettings} from '@/features/content/site-settings';
import {isSupportedLocale} from '@/i18n/routing';
import {normalizeLeadInquiryType, normalizeLeadNeed, normalizeLeadVolume} from '@/features/leads/intake';
import {createStaticPageMetadata} from '@/features/seo/static-page';

export function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  return createStaticPageMetadata(params, 'contact', {
    vi: {
      title: 'Liên hệ thương mại & tư vấn',
      description: 'Liên hệ NupsBox để hỏi về dịch vụ, cơ sở, mức giá tham khảo, khả năng đáp ứng và các thông tin thương mại liên quan.'
    },
    en: {
      title: 'Commercial enquiries & advice',
      description: 'Contact NupsBox about services, facilities, indicative pricing, availability and related commercial information.'
    }
  });
}

export default async function Page({
  params,
  searchParams
}: {
  params: Promise<{locale: string}>;
  searchParams: Promise<{unit?: string; location?: string; need?: string; volume?: string; inquiry?: string}>;
}) {
  const {locale} = await params;
  if (!isSupportedLocale(locale)) notFound();
  setRequestLocale(locale);
  const query = await searchParams;
  const intakeNeed = normalizeLeadNeed(query.need);
  const intakeVolume = normalizeLeadVolume(query.volume);
  const intakeInquiryType = normalizeLeadInquiryType(query.inquiry);

  const [featuredLocation, requestedLocation, requestedUnit, settings] = await Promise.all([
    getMarketingFeaturedLocation(locale),
    query.location ? getMarketingLocationBySlug(query.location, locale) : Promise.resolve(null),
    query.unit ? getMarketingUnitBySlug(query.unit, locale) : Promise.resolve(null),
    getPublicSiteSettings().catch(() => ({phone: null, zaloUrl: null, email: null, facebookUrl: null, openingHours: {}}))
  ]);

  const location = requestedLocation ?? featuredLocation;
  const vi = locale === 'vi';

  return (
    <main>
      <Section tone="soft" size="compact">
        <div className="grid gap-8 lg:grid-cols-[.84fr_1.16fr] lg:items-start lg:gap-12">
          <div className="lg:sticky lg:top-24">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--nupsbox-blue)]">
              {vi ? 'LIÊN HỆ THƯƠNG MẠI' : 'COMMERCIAL ENQUIRIES'}
            </p>
            <h1 className="mt-3 max-w-3xl text-[clamp(2.65rem,4.6vw,4.2rem)] font-extrabold leading-[1.02] tracking-[-0.045em] text-[var(--nupsbox-navy)]">
              {vi ? 'Trao đổi trực tiếp với NupsBox' : 'Talk directly with NupsBox'}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--nupsbox-slate)] sm:text-lg">
              {vi
                ? 'Gửi nhu cầu hoặc câu hỏi về dịch vụ, cơ sở, mức giá và khả năng đáp ứng. Nếu bạn đến từ một trang dịch vụ hoặc loại kho cụ thể, thông tin đó vẫn được giữ làm ngữ cảnh.'
                : 'Send your requirements or questions about services, facilities, pricing and availability. If you arrived from a specific service or unit page, that context is preserved.'}
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

            {settings.facebookUrl ? (
              <aside className="mt-4 rounded-2xl border border-[var(--nupsbox-border)] bg-white p-5 shadow-[var(--nupsbox-shadow-sm)]">
                <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--nupsbox-blue)]">
                  {vi ? 'KÊNH FACEBOOK' : 'FACEBOOK SOURCE'}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--nupsbox-slate)]">
                  {vi
                    ? 'Mở nguồn Facebook công khai đang được NupsBox liên kết trên website.'
                    : 'Open the public Facebook source currently linked by NupsBox.'}
                </p>
                <TrackedContactLink
                  href={settings.facebookUrl}
                  label={vi ? 'Mở Facebook NupsBox' : 'Open NupsBox Facebook'}
                  kind="facebook"
                  placement="contact-page"
                  className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--nupsbox-navy)] px-4 text-sm font-bold text-white"
                />
              </aside>
            ) : null}
          </div>

          <div id="lead-request">
            <div className="mb-4">
              <h2 className="text-xl font-extrabold tracking-[-0.025em] text-[var(--nupsbox-navy)]">
                {vi ? 'Gửi thông tin cần thiết để NupsBox phản hồi.' : 'Send the information NupsBox needs to respond.'}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--nupsbox-slate)]">
                {vi
                  ? 'Chọn loại yêu cầu trước. Thông tin chi tiết về nhu cầu kho chỉ xuất hiện khi bạn chọn tư vấn lưu trữ.'
                  : 'Choose the enquiry type first. Storage-specific questions appear only when you select storage advice.'}
              </p>
            </div>
            <Suspense fallback={<div className="min-h-[26rem] rounded-3xl bg-white" aria-hidden="true" />}>
              <LeadForm
                locale={locale}
                fallbackPhone={settings.phone}
                fallbackZalo={settings.zaloUrl}
                fallbackFacebook={settings.facebookUrl}
                unitTypeId={requestedUnit?.id}
                unitName={requestedUnit?.name}
                locationId={requestedLocation?.id}
                locationName={requestedLocation?.name}
                inquiryType={intakeInquiryType}
                needType={intakeNeed}
                estimatedVolume={intakeVolume}
              />
            </Suspense>
          </div>
        </div>
      </Section>
    </main>
  );
}
