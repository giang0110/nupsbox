import {Package, BriefcaseBusiness, Archive, House} from 'lucide-react';
import {Container} from '@/components/ui/container';

export function UseCases({locale}: {locale: 'vi' | 'en'}) {
  const vi = locale === 'vi';
  const items = vi ? [
    [Package, 'Bán hàng online', 'Tách hàng hóa khỏi không gian sống và có một điểm lưu trữ riêng cho vận hành shop.'],
    [BriefcaseBusiness, 'Doanh nghiệp nhỏ', 'Thêm không gian cho hàng mẫu, thiết bị và tồn kho mà không cần thuê cả văn phòng lớn.'],
    [Archive, 'Hàng tồn & hồ sơ', 'Giữ những thứ doanh nghiệp vẫn cần nhưng không cần nằm ngay tại bàn làm việc.'],
    [House, 'Đồ cá nhân', 'Giải phóng diện tích nhà ở với một kho riêng có kiểm soát ra vào.']
  ] as const : [
    [Package, 'Online selling', 'Separate inventory from your living space with a dedicated operating base for your shop.'],
    [BriefcaseBusiness, 'Small business', 'Add room for samples, equipment and inventory without leasing another large office.'],
    [Archive, 'Inventory & files', 'Keep business items you still need without letting them take over your workspace.'],
    [House, 'Personal storage', 'Free up room at home with a private storage unit and controlled access.']
  ] as const;

  return (
    <section className="py-20 sm:py-24">
      <Container>
        <div className="max-w-2xl">
          <p className="text-xs font-black tracking-[0.16em] text-[var(--nupsbox-blue)]">{vi ? 'DÙNG KHO THEO CÁCH CỦA BẠN' : 'SPACE THAT FITS THE JOB'}</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.045em] text-[var(--nupsbox-navy)] sm:text-5xl">
            {vi ? 'Không gian nhỏ cho những kế hoạch lớn.' : 'Small spaces for plans that are growing.'}
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {items.map(([Icon, title, text]) => (
            <article key={title} className="rounded-3xl border border-[var(--nupsbox-border)] bg-white p-6">
              <span className="grid size-11 place-items-center rounded-2xl bg-[var(--nupsbox-yellow)] text-[var(--nupsbox-navy)]"><Icon size={21} aria-hidden="true" /></span>
              <h3 className="mt-6 text-xl font-black tracking-[-0.025em] text-[var(--nupsbox-navy)]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--nupsbox-slate)]">{text}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
