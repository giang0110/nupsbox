import Image from 'next/image';
import {ArrowRight, Boxes, MapPin} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {Container} from '@/components/ui/container';
import {ConversionCta} from './conversion-cta';
import type {PublicLocation, PublicUnitType} from '@/features/catalog/types';
import {getFacilityMedia} from '@/features/content/facility-media';

export function Hero({
  locale,
  location,
  units,
  hasGallery = false
}: {
  locale: 'vi' | 'en';
  location: PublicLocation | null;
  units: PublicUnitType[];
  hasGallery?: boolean;
}) {
  const vi = locale === 'vi';
  const minArea = units.length ? Math.min(...units.map((unit) => unit.areaM2)) : null;
  const facilityMedia = location ? getFacilityMedia(location.slug) : null;

  return (
    <section aria-labelledby="home-hero-title" className="relative overflow-hidden bg-[var(--nupsbox-navy)] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_15%,rgba(8,70,168,.28),transparent_38%),linear-gradient(180deg,transparent_60%,rgba(0,0,0,.08))]" />
      <Container className="home-hero-grid relative grid gap-8 py-10 sm:py-12 lg:grid-cols-[.92fr_1.08fr] lg:items-center lg:gap-14 lg:py-16">
        <div className="home-hero-copy relative z-10 max-w-[40rem]">
          <p className="flex items-center gap-2 text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-white/58">
            <MapPin size={13} className="text-[var(--nupsbox-yellow)]" aria-hidden="true" />
            {vi ? 'MINI STORAGE TẠI TP.HCM' : 'MINI STORAGE IN HO CHI MINH CITY'}
          </p>

          <h1
            id="home-hero-title"
            className="home-hero-title mt-4 max-w-[10.5em] text-[clamp(3rem,5vw,4.75rem)] font-extrabold leading-[.98] tracking-[-0.052em]"
          >
            {vi ? 'Không gian vừa đủ. Vận hành nhẹ hơn.' : 'The right amount of space. Less overhead.'}
          </h1>

          <p className="home-hero-description mt-5 max-w-[36rem] text-base leading-7 text-white/68 sm:text-[1.05rem]">
            {vi
              ? 'Kho mini linh hoạt cho hàng hóa kinh doanh và nhu cầu cá nhân. Chọn diện tích phù hợp, xem hình ảnh thực tế và nhận báo giá trước khi quyết định.'
              : 'Flexible mini storage for business inventory and personal needs. Choose a suitable size, view real facility imagery and request pricing before deciding.'}
          </p>

          <div className="home-hero-actions mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            <ConversionCta locale={locale} intent="finder" placement="hero" size="lg" className="group">
              {vi ? 'Tìm kho phù hợp' : 'Find suitable storage'}
              <ArrowRight size={18} aria-hidden="true" className="transition group-hover:translate-x-0.5" />
            </ConversionCta>

            {hasGallery ? (
              <a href="#warehouse-gallery" className="inline-flex min-h-11 items-center text-sm font-bold text-white/78 underline-offset-4 transition hover:text-white hover:underline">
                {vi ? 'Xem hình ảnh thực tế →' : 'View real facility photos →'}
              </a>
            ) : (
              <Link href="/bang-gia" className="inline-flex min-h-11 items-center text-sm font-bold text-white/78 underline-offset-4 transition hover:text-white hover:underline">
                {vi ? 'Xem bảng giá →' : 'View pricing →'}
              </Link>
            )}
          </div>

          <div className="home-hero-trust mt-8 grid max-w-[34rem] grid-cols-3 border-y border-white/10 py-4 text-sm">
            <div className="pr-4">
              <p className="font-extrabold text-white">{vi ? 'Ảnh thực tế' : 'Real photos'}</p>
              <p className="mt-1 text-xs leading-5 text-white/52">{vi ? 'Từ Media CMS' : 'From Media CMS'}</p>
            </div>
            <div className="border-l border-white/10 px-4">
              <p className="font-extrabold text-white">{vi ? 'Diện tích rõ ràng' : 'Clear sizing'}</p>
              <p className="mt-1 text-xs leading-5 text-white/52">
                {minArea !== null ? `${minArea.toFixed(2)} m²+` : (vi ? 'Theo dữ liệu hiện có' : 'Based on current data')}
              </p>
            </div>
            <div className="border-l border-white/10 pl-4">
              <p className="font-extrabold text-white">{vi ? 'Xác nhận trước thuê' : 'Confirmed first'}</p>
              <p className="mt-1 text-xs leading-5 text-white/52">{vi ? 'Giá & tình trạng' : 'Price & availability'}</p>
            </div>
          </div>
        </div>

        {location && facilityMedia ? (
          <figure className="home-hero-image group relative min-h-[390px] overflow-hidden rounded-[2rem] lg:h-[clamp(500px,42vw,620px)] lg:min-h-0">
            <Image
              src={facilityMedia.imageUrl}
              alt={vi ? `Hình ảnh cơ sở ${location.name}` : `Facility image for ${location.name}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 54vw"
              className="object-cover transition duration-700 ease-out group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(7,26,56,.75)] via-transparent to-black/10" />
            <figcaption className="absolute inset-x-5 bottom-5 sm:inset-x-7 sm:bottom-7">
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[var(--nupsbox-yellow)]">{location.name}</p>
              <p className="mt-2 max-w-xl text-lg font-bold leading-7 text-white sm:text-xl">{location.address}</p>
            </figcaption>
          </figure>
        ) : (
          <div className="home-hero-image relative grid min-h-[390px] overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,#0d2d62,#071a38_65%,#091f43)] p-7 lg:h-[clamp(500px,42vw,620px)] lg:min-h-0">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(255,211,26,.16),transparent_28%)]" />
            <div className="relative z-10 self-end">
              <span className="grid size-12 place-items-center rounded-full border border-white/15 text-[var(--nupsbox-yellow)]">
                <Boxes size={22} aria-hidden="true" />
              </span>
              <h2 className="mt-5 max-w-md text-2xl font-extrabold tracking-[-0.03em]">
                {location
                  ? location.name
                  : (vi ? 'Không gian kho được cập nhật theo từng cơ sở.' : 'Storage information is updated by facility.')}
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/60">
                {location
                  ? location.address
                  : (vi
                      ? 'Bạn vẫn có thể dùng công cụ tìm kho để chọn diện tích phù hợp và gửi nhu cầu.'
                      : 'You can still use the storage finder to choose a suitable size and send your requirements.')}
              </p>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
