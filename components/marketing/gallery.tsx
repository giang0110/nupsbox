import Image from 'next/image';
import {Container} from '@/components/ui/container';

const facilityImage = 'https://siaodieqxzlarnvfppox.supabase.co/storage/v1/object/public/onboarding-photos/nupsbox-tan-phu/corridor-1.jpg';

export function Gallery({locale}: {locale: 'vi' | 'en'}) {
  const vi = locale === 'vi';
  return (
    <section className="bg-[var(--nupsbox-surface)] py-20 sm:py-24">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-xs font-black tracking-[0.16em] text-[var(--nupsbox-blue)]">{vi ? 'HÌNH ẢNH THỰC TẾ' : 'REAL FACILITY'}</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.045em] text-[var(--nupsbox-navy)] sm:text-5xl">{vi ? 'Kho thật. Địa điểm thật.' : 'Real storage. A real place.'}</h2>
            <p className="mt-5 max-w-lg leading-7 text-[var(--nupsbox-slate)]">{vi ? 'Website ưu tiên hình ảnh thực tế của NupsBox. Bộ ảnh độ phân giải cao sẽ tiếp tục được bổ sung vào thư viện quản trị.' : 'The site prioritizes real NupsBox imagery. Higher-resolution originals can be added through the media library as they become available.'}</p>
          </div>
          <figure className="overflow-hidden rounded-[2rem] border border-[var(--nupsbox-border)] bg-white shadow-[var(--nupsbox-shadow)]">
            <div className="relative aspect-[16/10]">
              <Image src={facilityImage} alt={vi ? 'Hành lang kho NupsBox Tân Phú' : 'NupsBox Tan Phu storage corridor'} fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" />
            </div>
            <figcaption className="px-5 py-4 text-sm text-[var(--nupsbox-slate)]">NupsBox Tân Phú · {vi ? 'hình ảnh cơ sở thực tế' : 'real facility image'}</figcaption>
          </figure>
        </div>
      </Container>
    </section>
  );
}
