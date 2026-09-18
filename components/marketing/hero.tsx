import Image from 'next/image';
import {ArrowRight, BadgeCheck, Boxes, Check, MapPin, Sparkles} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {buttonClassName} from '@/components/ui/button';
import {Container} from '@/components/ui/container';
import {ConversionCta} from './conversion-cta';
import type {PublicLocation, PublicUnitType} from '@/features/catalog/types';

const facilityImage = 'https://siaodieqxzlarnvfppox.supabase.co/storage/v1/object/public/onboarding-photos/nupsbox-tan-phu/corridor-1.jpg';

export function Hero({
  locale,
  location,
  units
}: {
  locale: 'vi' | 'en';
  location: PublicLocation | null;
  units: PublicUnitType[];
}) {
  const vi = locale === 'vi';
  const minArea = units.length ? Math.min(...units.map((unit) => unit.areaM2)) : null;

  return (
    <section
      aria-labelledby="home-hero-title"
      className="relative overflow-hidden bg-[var(--nupsbox-navy)] text-white"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_14%_16%,rgba(8,70,168,.34),transparent_58%)]" />
      <Container className="home-hero-grid relative grid items-center gap-8 py-10 sm:gap-10 sm:py-12 lg:grid-cols-[1.06fr_.94fr] lg:gap-12 lg:py-14">
        <div className="home-hero-copy relative z-10 max-w-[42rem]">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-[0.7rem] font-extrabold tracking-[0.13em] text-white/82 backdrop-blur">
            <MapPin size={13} aria-hidden="true" className="text-[var(--nupsbox-yellow)]" />
            {vi ? 'MINI STORAGE • TP.HCM' : 'MINI STORAGE • HO CHI MINH CITY'}
          </div>

          <h1
            id="home-hero-title"
            className="home-hero-title mt-5 max-w-[10.75em] text-[clamp(3rem,4.5vw,4.2rem)] font-extrabold leading-[1.01] tracking-[-0.047em]"
          >
            {vi ? 'Thêm không gian cho hàng hóa. Không thêm gánh nặng mặt bằng.' : 'More room for what you store. Without another full-size lease.'}
          </h1>

          <p className="home-hero-description mt-5 max-w-[39rem] text-base leading-7 text-white/70 sm:text-[1.05rem]">
            {vi
              ? 'Kho mini linh hoạt cho shop online, doanh nghiệp nhỏ và nhu cầu cá nhân. Bắt đầu bằng hai câu hỏi để tìm lựa chọn phù hợp.'
              : 'Flexible mini storage for online sellers, small businesses and personal needs. Start with two quick questions to find a suitable option.'}
          </p>

          <div className="home-hero-actions mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
            <ConversionCta locale={locale} intent="finder" placement="hero" size="lg" className="group sm:min-w-48">
              {vi ? 'Tìm kho phù hợp' : 'Find suitable storage'}
              <ArrowRight size={18} aria-hidden="true" className="transition group-hover:translate-x-0.5" />
            </ConversionCta>
            <Link
              href="/bang-gia"
              className={buttonClassName({variant: 'ghost', size: 'lg', className: 'text-white ring-1 ring-white/18 hover:bg-white/10'})}
            >
              {vi ? 'Xem bảng giá' : 'View pricing'}
            </Link>
          </div>

          <div className="home-hero-trust mt-6 flex max-w-[39rem] flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-white/70">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-[var(--nupsbox-yellow)]" aria-hidden="true" />
              {vi ? 'Gợi ý theo nhu cầu' : 'Need-based guidance'}
            </div>
            <div className="flex items-center gap-2">
              <BadgeCheck size={15} className="text-[var(--nupsbox-yellow)]" aria-hidden="true" />
              {vi ? 'Thông tin được xác nhận' : 'Verified information'}
            </div>
            <div className="flex items-center gap-2">
              <Check size={15} className="text-[var(--nupsbox-yellow)]" aria-hidden="true" />
              {vi ? 'Xác nhận trước khi thuê' : 'Confirm before renting'}
            </div>
          </div>
        </div>

        {location ? (
          <div className="home-hero-image relative min-h-[360px] overflow-hidden rounded-[1.65rem] border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,.2)] sm:min-h-[420px] lg:h-[clamp(430px,36vw,500px)] lg:min-h-0">
            <Image
              src={facilityImage}
              alt={vi ? `Hình ảnh cơ sở ${location.name}` : `Facility image for ${location.name}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 44vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(7,26,56,.82)] via-[rgba(7,26,56,.05)] to-transparent" />
            <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/12 bg-[rgba(7,26,56,.76)] p-4 backdrop-blur-md sm:inset-x-5 sm:bottom-5">
              <p className="text-[0.68rem] font-extrabold tracking-[0.14em] text-[var(--nupsbox-yellow)]">
                {location.name}
              </p>
              <div className="mt-1.5 flex flex-wrap items-end justify-between gap-2">
                <p className="text-sm font-bold sm:text-base">
                  {minArea !== null
                    ? (vi ? `Loại kho đang công bố từ ${minArea.toFixed(2)} m²` : `Published unit types from ${minArea.toFixed(2)} m²`)
                    : (vi ? 'Xem thông tin cơ sở đang công bố' : 'View currently published facility information')}
                </p>
                <span className="text-[0.7rem] text-white/58">
                  {vi ? 'Thông tin theo dữ liệu hiện có' : 'Based on current published data'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="home-hero-image relative grid min-h-[360px] overflow-hidden rounded-[1.65rem] border border-white/10 bg-[linear-gradient(145deg,#0d2d62,#071a38_62%,#0a2147)] p-6 shadow-[0_24px_64px_rgba(0,0,0,.2)] sm:min-h-[420px] sm:p-8 lg:h-[clamp(430px,36vw,500px)] lg:min-h-0">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_22%,rgba(255,211,26,.18),transparent_28%),radial-gradient(circle_at_30%_78%,rgba(8,70,168,.32),transparent_36%)]" />
            <div className="relative z-10 self-end rounded-3xl border border-white/12 bg-white/[0.06] p-6 backdrop-blur">
              <span className="grid size-12 place-items-center rounded-2xl bg-[var(--nupsbox-yellow)] text-[var(--nupsbox-navy)]">
                <Boxes size={23} aria-hidden="true" />
              </span>
              <p className="mt-5 text-[0.68rem] font-extrabold tracking-[0.14em] text-[var(--nupsbox-yellow)]">
                NUPSBOX
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.03em]">
                {vi ? 'Thông tin cơ sở sẽ xuất hiện sau khi được công bố.' : 'Facility details appear after they are published.'}
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/68">
                {vi
                  ? 'Bạn vẫn có thể dùng Storage Finder và gửi nhu cầu; website không tự điền địa chỉ, diện tích hay tiện ích khi chưa có dữ liệu xác nhận.'
                  : 'You can still use Storage Finder and send your requirements; the site does not invent an address, area or facility feature when verified data is unavailable.'}
              </p>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
