import {Package, BriefcaseBusiness, Archive, House} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';

export function UseCases({locale}: {locale: 'vi' | 'en'}) {
  const vi = locale === 'vi';
  const items = vi ? [
    [Package, 'Bán hàng online', 'Tách hàng hóa khỏi không gian sống và có một điểm lưu trữ riêng cho vận hành shop.', '/giai-phap/shop-online'],
    [BriefcaseBusiness, 'Doanh nghiệp nhỏ', 'Thêm không gian cho hàng mẫu, thiết bị và tồn kho mà không cần thuê cả văn phòng lớn.', '/giai-phap/doanh-nghiep-nho'],
    [Archive, 'Hàng tồn & hồ sơ', 'Giữ những thứ doanh nghiệp vẫn cần nhưng không cần nằm ngay tại bàn làm việc.', '/giai-phap/chua-hang'],
    [House, 'Đồ cá nhân', 'Giải phóng diện tích nhà ở với một kho riêng có kiểm soát ra vào.', '/giai-phap/ca-nhan']
  ] as const : [
    [Package, 'Online selling', 'Separate inventory from your living space with a dedicated operating base for your shop.', '/giai-phap/shop-online'],
    [BriefcaseBusiness, 'Small business', 'Add room for samples, equipment and inventory without leasing another large office.', '/giai-phap/doanh-nghiep-nho'],
    [Archive, 'Inventory & files', 'Keep business items you still need without letting them take over your workspace.', '/giai-phap/chua-hang'],
    [House, 'Personal storage', 'Free up room at home with a private storage unit and controlled access.', '/giai-phap/ca-nhan']
  ] as const;

  return (
    <Section>
      <SectionHeading
        eyebrow={vi ? 'TÌNH HUỐNG NÀO GIỐNG BẠN?' : 'WHICH SITUATION SOUNDS LIKE YOU?'}
        title={vi ? 'Bắt đầu từ công việc cần làm, không phải từ số m².' : 'Start with the job to be done, not the square metres.'}
        description={vi
          ? 'Chọn tình huống gần nhất với nhu cầu của bạn để xem cách NupsBox có thể phù hợp trước khi dùng Storage Finder.'
          : 'Choose the situation closest to your needs to understand the fit before using Storage Finder.'}
      />
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {items.map(([Icon, title, text, href]) => (
          <Link key={title} href={href} className="group rounded-3xl border border-[var(--nupsbox-border)] bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-[var(--nupsbox-shadow-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nupsbox-blue)] focus-visible:ring-offset-2">
            <span className="grid size-11 place-items-center rounded-2xl bg-[var(--nupsbox-yellow)] text-[var(--nupsbox-navy)]"><Icon size={21} aria-hidden="true" /></span>
            <h3 className="mt-6 text-xl font-black tracking-[-0.025em] text-[var(--nupsbox-navy)]">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--nupsbox-slate)]">{text}</p>
            <span className="mt-5 inline-flex text-sm font-bold text-[var(--nupsbox-blue)]">{vi ? 'Xem giải pháp →' : 'View solution →'}</span>
          </Link>
        ))}
      </div>
    </Section>
  );
}
