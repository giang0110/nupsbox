import {ArrowRight, MapPin} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {ConversionCta} from '@/components/marketing/conversion-cta';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
import type {PublicLocation} from '@/features/catalog/types';

export function HomeLocationJourney({
  location,
  locale
}: {
  location: PublicLocation | null;
  locale: 'vi' | 'en';
}) {
  const vi = locale === 'vi';
  const steps = vi
    ? [
        ['01', 'Chọn nhu cầu', 'Dùng Finder hoặc xem loại kho phù hợp.'],
        ['02', 'Gửi yêu cầu', 'Chọn báo giá hoặc đề xuất lịch xem kho.'],
        ['03', 'Nhận xác nhận', 'NupsBox xác nhận giá, tình trạng và bước tiếp theo.']
      ]
    : [
        ['01', 'Choose your need', 'Use Finder or browse suitable unit types.'],
        ['02', 'Send your request', 'Request pricing or suggest a viewing time.'],
        ['03', 'Get confirmation', 'NupsBox confirms pricing, availability and the next step.']
      ];

  return (
    <Section tone="soft" size="compact">
      <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
        <div>
          <SectionHeading
            eyebrow={vi ? 'ĐỊA ĐIỂM & TRẢI NGHIỆM THUÊ' : 'LOCATION & RENTAL JOURNEY'}
            title={vi ? 'Biết nơi bạn sẽ đến. Biết bước tiếp theo là gì.' : 'Know where you are going. Know what happens next.'}
            description={vi
              ? 'Thông tin cơ sở và quy trình thuê được trình bày gọn để bạn dễ quyết định.'
              : 'Facility information and the rental journey are kept simple so you can decide with confidence.'}
          />

          {location ? (
            <div className="mt-7 border-l-2 border-[var(--nupsbox-yellow)] pl-5 sm:pl-6">
              <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--nupsbox-blue)]">
                <MapPin size={15} aria-hidden="true" />
                {vi ? 'CƠ SỞ ĐANG HIỂN THỊ' : 'FEATURED FACILITY'}
              </p>
              <h3 className="mt-3 text-2xl font-extrabold tracking-[-0.03em] text-[var(--nupsbox-navy)]">{location.name}</h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--nupsbox-slate)]">{location.address}</p>
              <p className="mt-3 text-sm font-semibold text-[var(--nupsbox-blue)]">
                {location.unitTypes.length} {vi ? 'loại kho đang hiển thị' : 'unit types listed'}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-4">
                <ConversionCta
                  locale={locale}
                  intent="viewing"
                  context={{locationSlug: location.slug, locationId: location.id}}
                  placement="home-location-journey"
                >
                  {vi ? 'Đề xuất lịch xem kho' : 'Request a viewing'}
                </ConversionCta>
                <Link
                  href={{pathname: '/dia-diem/[slug]', params: {slug: location.slug}}}
                  className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[var(--nupsbox-blue)] hover:underline"
                >
                  {vi ? 'Xem chi tiết cơ sở' : 'View location details'}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
          ) : (
            <p className="mt-7 max-w-xl border-l-2 border-[var(--nupsbox-border)] pl-5 text-sm leading-6 text-[var(--nupsbox-slate)]">
              {vi ? 'Thông tin cơ sở đang được cập nhật.' : 'Facility information is being updated.'}
            </p>
          )}
        </div>

        <ol className="border-t border-[var(--nupsbox-border)]">
          {steps.map(([number, title, body]) => (
            <li key={number} className="grid grid-cols-[3rem_1fr] gap-4 border-b border-[var(--nupsbox-border)] py-5 sm:py-6">
              <span className="text-sm font-extrabold text-[var(--nupsbox-blue)]">{number}</span>
              <div>
                <h3 className="font-extrabold text-[var(--nupsbox-navy)]">{title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-[var(--nupsbox-slate)]">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
