import {Container} from '@/components/ui/container';
import {Link} from '@/i18n/navigation';

export function CostComparison({locale}: {locale: 'vi' | 'en'}) {
  const vi = locale === 'vi';
  return (
    <section className="bg-[var(--nupsbox-navy)] py-20 text-white sm:py-24">
      <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs font-black tracking-[0.16em] text-[var(--nupsbox-yellow)]">{vi ? 'TỐI ƯU MẶT BẰNG' : 'RIGHT-SIZE YOUR SPACE'}</p>
          <h2 className="mt-4 max-w-xl text-4xl font-black leading-tight tracking-[-0.05em] sm:text-5xl">
            {vi ? 'Đừng thuê 30m² khi bạn chỉ cần 5m².' : 'Do not lease 30m² when you only need 5m².'}
          </h2>
          <p className="mt-5 max-w-xl leading-7 text-white/65">
            {vi ? 'NupsBox giúp bạn tách nhu cầu lưu trữ khỏi chi phí của một mặt bằng lớn. Giá cụ thể được cập nhật theo từng loại kho và chi nhánh.' : 'NupsBox separates storage needs from the cost of a large commercial lease. Pricing is maintained per unit type and location.'}
          </p>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/6 p-7 sm:p-9">
          <p className="text-sm font-bold text-white/65">{vi ? 'Mặt bằng truyền thống' : 'Traditional commercial space'}</p>
          <div className="mt-4 space-y-3 text-lg font-semibold">
            <p>30m² + {vi ? 'đặt cọc' : 'deposit'}</p>
            <p>+ {vi ? 'điện nước & vận hành' : 'utilities & operations'}</p>
          </div>
          <div className="my-7 h-px bg-white/10" />
          <p className="text-sm font-bold text-[var(--nupsbox-yellow)]">NUPSBOX</p>
          <p className="mt-3 text-2xl font-black">{vi ? 'Chỉ thuê diện tích bạn thực sự cần.' : 'Rent the amount of space you actually need.'}</p>
          <Link href="/bang-gia" className="mt-6 inline-flex font-bold text-[var(--nupsbox-yellow)] hover:underline">{vi ? 'Xem các loại kho →' : 'Explore storage sizes →'}</Link>
        </div>
      </Container>
    </section>
  );
}
