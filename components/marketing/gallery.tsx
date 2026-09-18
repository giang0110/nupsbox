import Image from 'next/image';
import {ImageOff} from 'lucide-react';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
import {TrackedContactLink} from '@/components/marketing/tracked-contact-link';
import type {PublicLocation} from '@/features/catalog/types';
import {getFacilityMedia} from '@/features/content/facility-media';

export function Gallery({
  locale,
  location,
  facebookUrl
}: {
  locale: 'vi' | 'en';
  location: PublicLocation | null;
  facebookUrl?: string | null;
}) {
  const vi = locale === 'vi';
  const facilityMedia = location ? getFacilityMedia(location.slug) : null;

  return (
    <Section tone="soft">
      <div className="grid gap-8 lg:grid-cols-[.78fr_1.22fr] lg:items-end lg:gap-12">
        <SectionHeading
          eyebrow={vi ? 'HÌNH ẢNH CƠ SỞ' : 'FACILITY MEDIA'}
          title={vi ? 'Ảnh chỉ đi cùng đúng cơ sở.' : 'Imagery stays tied to the right facility.'}
          description={vi
            ? 'NupsBox chỉ hiển thị ảnh khi asset đã được gắn rõ với cơ sở đang công bố; website không tái sử dụng ảnh của một cơ sở cho địa điểm khác.'
            : 'NupsBox shows imagery only when an asset is explicitly mapped to the published facility; one facility image is not reused for another location.'}
        />

        {location && facilityMedia ? (
          <figure className="overflow-hidden rounded-3xl border border-[var(--nupsbox-border)] bg-white shadow-[var(--nupsbox-shadow-sm)]">
            <div className="relative aspect-[16/9]">
              <Image
                src={facilityMedia.imageUrl}
                alt={vi ? `Hình ảnh cơ sở ${location.name}` : `Facility image for ${location.name}`}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            </div>
            <figcaption className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-sm text-[var(--nupsbox-slate)]">
              <span>{location.name} · {vi ? 'asset được gắn theo cơ sở' : 'location-scoped facility asset'}</span>
              {facebookUrl ? (
                <TrackedContactLink
                  href={facebookUrl}
                  label={vi ? 'Xem thêm trên Facebook' : 'More on Facebook'}
                  kind="facebook"
                  placement="about-gallery"
                  showIcon={false}
                  className="font-bold text-[var(--nupsbox-blue)] hover:underline"
                />
              ) : null}
            </figcaption>
          </figure>
        ) : (
          <div
            className="grid min-h-64 place-items-center rounded-3xl border border-[var(--nupsbox-border)] bg-white p-7 text-center shadow-[var(--nupsbox-shadow-sm)]"
            role="status"
          >
            <div>
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[var(--nupsbox-surface)] text-[var(--nupsbox-blue)]">
                <ImageOff size={22} aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-xl font-extrabold tracking-[-0.025em] text-[var(--nupsbox-navy)]">
                {location
                  ? (vi ? 'Chưa có ảnh đã gắn cho cơ sở này.' : 'No mapped image is available for this facility yet.')
                  : (vi ? 'Chưa có cơ sở được công bố.' : 'No facility is currently published.')}
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--nupsbox-slate)]">
                {vi
                  ? 'Thông tin hình ảnh sẽ chỉ xuất hiện khi nguồn media và cơ sở được liên kết rõ ràng.'
                  : 'Facility imagery appears only when the media source and facility are explicitly linked.'}
              </p>
              {facebookUrl ? (
                <TrackedContactLink
                  href={facebookUrl}
                  label={vi ? 'Xem nguồn hình ảnh trên Facebook' : 'View the Facebook media source'}
                  kind="facebook"
                  placement="about-gallery-empty"
                  className="mx-auto mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--nupsbox-navy)] px-4 text-sm font-bold text-white"
                />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
