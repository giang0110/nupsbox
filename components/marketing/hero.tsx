import Image from 'next/image';
import {ArrowRight, Check, MapPin, ShieldCheck} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {buttonClassName} from '@/components/ui/button';
import {Container} from '@/components/ui/container';
import {ConversionCta} from './conversion-cta';

const facilityImage = 'https://siaodieqxzlarnvfppox.supabase.co/storage/v1/object/public/onboarding-photos/nupsbox-tan-phu/corridor-1.jpg';

export function Hero({locale}: {locale: 'vi' | 'en'}) {
  const vi = locale === 'vi';

  return (
    <section className="relative overflow-hidden bg-[var(--nupsbox-navy)] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_15%_20%,rgba(8,70,168,.36),transparent_55%)]" />
      <Container className="relative grid min-h-[650px] items-center gap-12 py-14 lg:grid-cols-[1.04fr_.96fr] lg:py-20">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3 py-2 text-xs font-extrabold tracking-[0.13em] text-white/82 backdrop-blur">
            <MapPin size={14} aria-hidden="true" className="text-[var(--nupsbox-yellow)]" />
            {vi ? 'MINI STORAGE • TP.HCM' : 'MINI STORAGE • HO CHI MINH CITY'}
          </div>

          <h1 className="mt-7 text-5xl font-black leading-[1.01] tracking-[-0.05em] sm:text-6xl lg:text-[4.65rem]">
            {vi ? 'Thêm không gian cho hàng hóa. Không thêm gánh nặng mặt bằng.' : 'More room for what you store. Without another full-size lease.'}
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
            {vi
              ? 'Kho mini riêng, linh hoạt cho shop online, doanh nghiệp nhỏ và nhu cầu cá nhân tại TP.HCM. Bắt đầu bằng hai câu hỏi để tìm kích thước phù hợp.'
              : 'Flexible private mini storage for online sellers, small businesses and personal needs in Ho Chi Minh City. Start with two quick questions to find a suitable size.'}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ConversionCta locale={locale} intent="finder" placement="hero" size="lg" className="group sm:min-w-52">
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

          <div className="mt-9 grid max-w-2xl gap-3 text-sm text-white/72 sm:grid-cols-3">
            <div className="flex items-center gap-2"><Check size={16} className="text-[var(--nupsbox-yellow)]" aria-hidden="true" />{vi ? 'Kho riêng' : 'Private units'}</div>
            <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-[var(--nupsbox-yellow)]" aria-hidden="true" />CCTV</div>
            <div className="flex items-center gap-2"><Check size={16} className="text-[var(--nupsbox-yellow)]" aria-hidden="true" />{vi ? 'Thuê linh hoạt' : 'Flexible rental'}</div>
          </div>
        </div>

        <div className="relative min-h-[410px] overflow-hidden rounded-[2rem] border border-white/10 shadow-[var(--nupsbox-shadow-lg)] sm:min-h-[500px] lg:min-h-[570px]">
          <Image
            src={facilityImage}
            alt={vi ? 'Hành lang kho mini thực tế tại NupsBox Tân Phú' : 'Real mini storage corridor at NupsBox Tan Phu'}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(7,26,56,.86)] via-[rgba(7,26,56,.08)] to-transparent" />
          <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/14 bg-[rgba(7,26,56,.78)] p-5 backdrop-blur-md sm:inset-x-6 sm:bottom-6">
            <p className="text-xs font-black tracking-[0.14em] text-[var(--nupsbox-yellow)]">NUPSBOX TÂN PHÚ</p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
              <p className="font-bold">{vi ? 'Kho mini từ 1,64 m²' : 'Mini storage from 1.64 m²'}</p>
              <span className="text-xs text-white/62">{vi ? 'Ảnh cơ sở thực tế' : 'Real facility image'}</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
