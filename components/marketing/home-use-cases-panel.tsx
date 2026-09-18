'use client';

import {Archive, BriefcaseBusiness, House, Package} from 'lucide-react';
import {Link} from '@/i18n/navigation';

export function HomeUseCasesPanel({locale}: {locale: 'vi' | 'en'}) {
  const vi = locale === 'vi';
  const useCases = vi
    ? [
        [Package, 'Bán hàng online', 'Tách hàng hóa khỏi không gian sống và có điểm lưu trữ riêng cho vận hành shop.', '/giai-phap/shop-online'],
        [BriefcaseBusiness, 'Doanh nghiệp nhỏ', 'Thêm chỗ cho hàng mẫu, thiết bị và tồn kho mà không cần thuê mặt bằng lớn.', '/giai-phap/doanh-nghiep-nho'],
        [Archive, 'Hàng tồn & hồ sơ', 'Giữ những thứ vẫn cần nhưng không phải nằm ngay tại nơi làm việc.', '/giai-phap/chua-hang'],
        [House, 'Đồ cá nhân', 'Giải phóng diện tích nhà ở với một không gian lưu trữ riêng.', '/giai-phap/ca-nhan']
      ] as const
    : [
        [Package, 'Online selling', 'Separate inventory from your living space with a dedicated operating base.', '/giai-phap/shop-online'],
        [BriefcaseBusiness, 'Small business', 'Add room for samples, equipment and inventory without another large lease.', '/giai-phap/doanh-nghiep-nho'],
        [Archive, 'Inventory & files', 'Keep business items you still need without crowding the workspace.', '/giai-phap/chua-hang'],
        [House, 'Personal storage', 'Free up room at home with a separate storage space.', '/giai-phap/ca-nhan']
      ] as const;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {useCases.map(([Icon, title, body, href]) => (
        <Link
          key={title}
          href={href}
          className="group rounded-2xl border border-[var(--nupsbox-border)] bg-white p-5 transition hover:-translate-y-px hover:shadow-[var(--nupsbox-shadow-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nupsbox-blue)] focus-visible:ring-offset-2"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-[var(--nupsbox-yellow)] text-[var(--nupsbox-navy)]">
            <Icon size={19} aria-hidden="true" />
          </span>
          <h3 className="mt-4 text-lg font-extrabold tracking-[-0.02em] text-[var(--nupsbox-navy)]">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--nupsbox-slate)]">{body}</p>
          <span className="mt-4 inline-flex text-sm font-bold text-[var(--nupsbox-blue)]">
            {vi ? 'Xem giải pháp →' : 'View solution →'}
          </span>
        </Link>
      ))}
    </div>
  );
}
