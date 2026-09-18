import Image from 'next/image';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';

const facilityImage = 'https://siaodieqxzlarnvfppox.supabase.co/storage/v1/object/public/onboarding-photos/nupsbox-tan-phu/corridor-1.jpg';

export function Gallery({locale}: {locale: 'vi' | 'en'}) {
  const vi = locale === 'vi';

  return (
    <Section tone="soft">
      <div className="grid gap-8 lg:grid-cols-[.78fr_1.22fr] lg:items-end lg:gap-12">
        <SectionHeading
          eyebrow={vi ? 'HÌNH ẢNH THỰC TẾ' : 'REAL FACILITY'}
          title={vi ? 'Kho thật. Địa điểm thật.' : 'Real storage. A real place.'}
          description={vi
            ? 'Website ưu tiên hình ảnh thực tế của NupsBox. Bộ ảnh độ phân giải cao sẽ tiếp tục được bổ sung vào thư viện quản trị.'
            : 'The site prioritizes real NupsBox imagery. Higher-resolution originals can be added through the media library as they become available.'}
        />
        <figure className="overflow-hidden rounded-3xl border border-[var(--nupsbox-border)] bg-white shadow-[var(--nupsbox-shadow-sm)]">
          <div className="relative aspect-[16/9]">
            <Image
              src={facilityImage}
              alt={vi ? 'Hành lang kho NupsBox Tân Phú' : 'NupsBox Tan Phu storage corridor'}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
          </div>
          <figcaption className="px-5 py-3.5 text-sm text-[var(--nupsbox-slate)]">
            NupsBox Tân Phú · {vi ? 'hình ảnh cơ sở thực tế' : 'real facility image'}
          </figcaption>
        </figure>
      </div>
    </Section>
  );
}
