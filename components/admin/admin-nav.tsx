import Link from 'next/link';
import {can} from '@/features/auth/permissions';
import type {AppRole} from '@/types/database';

type Props = {role: AppRole};

const items = [
  {href: '/admin', label: 'Tổng quan', action: 'dashboard:read' as const},
  {href: '/admin/leads', label: 'Khách hàng', action: 'leads:read' as const},
  {href: '/admin/catalog', label: 'Kho & bảng giá', action: 'catalog:read' as const},
  {href: '/admin/content', label: 'Nội dung', action: 'content:read' as const}
];

export function AdminNav({role}: Props) {
  return (
    <nav aria-label="Quản trị NupsBox" className="flex flex-wrap gap-2">
      {items.filter((item) => can(role, item.action)).map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-full border border-[var(--nupsbox-border)] bg-white px-4 py-2 text-sm font-bold text-[var(--nupsbox-navy)] transition hover:border-[var(--nupsbox-blue)] hover:text-[var(--nupsbox-blue)]"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
