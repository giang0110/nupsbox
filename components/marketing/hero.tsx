import Image from 'next/image';
import {ArrowRight, Boxes, MapPin} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {Container} from '@/components/ui/container';
import {buttonClassName} from '@/components/ui/button';
import type {PublicLocation, PublicUnitType} from '@/features/catalog/types';
import {getFacilityMedia} from '@/features/content/facility-media';
import type {CommercialCopy} from '@/features/content/commercial-content';

export function Hero({
  locale,
  location,
  units,
  hasGallery = false,
  copy
}: {
  locale: 'vi' | 'en';
  location: PublicLocation | null;
  units: PublicUnitType[];
  hasGallery?: boolean;
  copy?: CommercialCopy;
}) {
  const vi = locale === 'vi';
  const publishedUseCases = 4;
  const facilityMedia = location ? getFacilityMedia(location.slug) : null;

  return (
    <section aria-labelledby="home-hero-title" className="relative overflow-hidden bg-[var(--nupsbox-navy)] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_15%,rgba(8,70,168,.28),transparent_38%),linear-gradient(180deg,transparent_60%,rgba(0,0,0,.08))]" />
      <Container className="home-hero-grid relative grid gap-8 py-10 sm:py-12 lg:grid-cols-[.92fr_1.08fr] lg:items-center lg:gap-14 lg:py-16">
        <div className="home-hero-copy relative z-10 max-w-[40rem]">
          <p className="flex items-center gap-2 text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-white/58">
            <MapPin size={13} className="text-[var(--nupsbox-yellow)]" aria-hidden="true" />
            {copy?.eyebrow ?? (vi ? 'THÔNG TIN THƯƠNG MẠI • TP.HCM' : 'COMMERCIAL INFORMATION • HO CHI MINH CITY')}
          </p>

          <h1
            id="home-hero-title"
            className="home-hero-title mt-4 max-w-[11.5em] text-[clamp(3rem,5vw,4.75rem)] font-extrabold leading-[.98] tracking-[-0.052em]"
          >
            {copy?.title ?? (vi ? 'NupsBox — hiểu dịch vụ trước khi quyết định.' : 'NupsBox — understand the service before you decide.')}
          </h1>

          <p className="home-hero-description mt-5 max-w-[36rem] text-base leading-7 text-white/68 sm:text-[1.05rem]">
            {copy?.description ?? (vi
              ? 'Khám phá giải pháp lưu trữ, cơ sở, hình ảnh thực tế và thông tin liên hệ của NupsBox. Website ưu tiên thông tin rõ ràng để bạn chủ động đánh giá trước khi trao đổi.'
              : 'Explore NupsBox storage solutions, facilities, real imagery and contact information. The website prioritizes clear information so you can assess the service before getting in touch.')}
          </p>

          <div className="home-hero-actions mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link href="/giai-phap" className={buttonClassName({variant: 'primary', size: 'lg', className: 'group'})}>
              {vi ? 'Khám phá dịch vụ' : 'Explore services'}
              <ArrowRight size={18} aria-hidden="true" className="transition group-hover:translate-x-0.5" />
            </Link>

            {hasGallery ? (
              <a href="#warehouse-gallery" className="inline-flex min-h-11 items-center text-sm font-bold text-white/78 underline-offset-4 transition hover:text-white hover:underline">
                {vi ? 'Xem hình ảnh thực tế →' : 'View real facility photos →'}
              </a>
            ) : (
              <Link href="/lien-he" className="inline-flex min-h-11 items-center text-sm font-bold text-white/78 underline-offset-4 transition hover:text-white hover:underline">
                {vi ? 'Liên hệ NupsBox →' : 'Contact NupsBox →'}
              </Link>
            )}
          </div>

          <div className="home-hero-trust mt-8 grid max-w-[34rem] grid-cols-3 border-y border-white/10 py-4 text-sm">
            <div className="pr-4">
              <p className="font-extrabold text-white">{publishedUseCases} {vi ? 'nhóm nhu cầu' : 'use cases'}</p>
              <p className="mt-1 text-xs leading-5 text-white/52">{vi ? 'Shop · SME · Hàng tồn · Cá nhân' : 'Online · SME · Inventory · Personal'}</p>
            </div>
            <div className="border-l border-white/10 px-4">
              <p className="font-extrabold text-white">{location ? location.district : (vi ? 'Cơ sở thực tế' : 'Real facility')}</p>
              <p className="mt-1 text-xs leading-5 text-white/52">{vi ? 'Thông tin & hình ảnh đã công bố' : 'Published facility information'}</p>
            </div>
            <div className="border-l border-white/10 pl-4">
              <p className="font-extrabold text-white">{vi ? 'Phân tích chuyên sâu' : 'Practical analysis'}</p>
              <p className="mt-1 text-xs leading-5 text-white/52">{vi ? 'Dùng kho, tồn kho, vận hành' : 'Storage, inventory, operations'}</p>
            </div>
          </div>
        </div>

        {location && facilityMedia ? (
          <figure className="home-hero-image group relative min-h-[390px] overflow-hidden rounded-[2rem] lg:h-[clamp(440px,36vw,540px)] lg:min-h-0">
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
          <div className="home-hero-image relative grid min-h-[390px] overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,#0d2d62,#071a38_65%,#091f43)] p-7 lg:h-[clamp(440px,36vw,540px)] lg:min-h-0">
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
                      ? 'Thông tin cơ sở, dịch vụ và hình ảnh được công bố khi dữ liệu đã sẵn sàng.'
                      : 'Facility, service and imagery details are published when the information is ready.')}
              </p>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
