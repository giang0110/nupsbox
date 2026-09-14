import Image from 'next/image';
import {Link} from '@/i18n/navigation';
import {buttonClassName} from '@/components/ui/button';
import {Container} from '@/components/ui/container';

const facilityImage = 'https://siaodieqxzlarnvfppox.supabase.co/storage/v1/object/public/onboarding-photos/nupsbox-tan-phu/corridor-1.jpg';

export function Hero({locale}: {locale: 'vi' | 'en'}) {
  const vi = locale === 'vi';
  return (
    <section className="relative overflow-hidden bg-[var(--nupsbox-navy)] text-white">
      <Container className="grid min-h-[680px] items-center gap-10 py-16 lg:grid-cols-[1.08fr_.92fr] lg:py-20">
        <div className="relative z-10 max-w-3xl">
          <p className="text-xs font-black tracking-[0.18em] text-[var(--nupsbox-yellow)]">
            {vi ? 'MINI STORAGE • TP.HCM' : 'MINI STORAGE • HO CHI MINH CITY'}
          </p>
          <h1 className="mt-5 text-5xl font-black leading-[0.97] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
            {vi ? 'Có kho tại TP.HCM. Không cần thuê cả mặt bằng.' : 'Your business needs space. Not another expensive office.'}
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
            {vi
              ? 'Không gian kho riêng linh hoạt cho shop online và doanh nghiệp nhỏ — tiết kiệm chi phí, gần khách hàng và mở rộng khi bạn cần.'
              : 'Flexible private mini storage for online sellers and growing businesses — practical, cost-conscious and ready to scale with you.'}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#storage-finder" className={buttonClassName({size: 'lg'})}>{vi ? 'Tìm kho phù hợp' : 'Find your storage'}</a>
            <Link href="/bang-gia" className={buttonClassName({variant: 'ghost', size: 'lg', className: 'text-white ring-1 ring-white/20 hover:bg-white/10'})}>
              {vi ? 'Xem bảng giá' : 'View pricing'}
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/70">
            <span>✓ {vi ? 'Kho riêng' : 'Private units'}</span>
            <span>✓ CCTV</span>
            <span>✓ Keypad access</span>
            <span>✓ {vi ? 'Thuê linh hoạt' : 'Flexible rental'}</span>
          </div>
        </div>
        <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl lg:min-h-[560px]">
          <Image
            src={facilityImage}
            alt={vi ? 'Hành lang kho mini thực tế tại NupsBox Tân Phú' : 'Real mini storage corridor at NupsBox Tan Phu'}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 44vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(7,26,56,.72)] via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/15 bg-[rgba(7,26,56,.78)] p-5 backdrop-blur-md">
            <p className="text-xs font-black tracking-[0.14em] text-[var(--nupsbox-yellow)]">NUPSBOX TÂN PHÚ</p>
            <p className="mt-2 font-bold">{vi ? 'Kho mini từ 1,64 m²' : 'Mini storage from 1.64 m²'}</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
