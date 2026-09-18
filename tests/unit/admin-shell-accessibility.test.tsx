import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {AdminShell} from '@/components/admin/admin-shell';

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/leads'
}));

const groups = [
  {
    label: 'Tổng quan',
    items: [{href: '/admin', label: 'Dashboard', action: 'dashboard:read' as const}]
  },
  {
    label: 'CRM',
    items: [{href: '/admin/leads', label: 'Khách hàng', action: 'leads:read' as const}]
  }
];

describe('admin shell accessibility', () => {
  it('names navigation controls and marks the active route', () => {
    render(
      <AdminShell role="staff" userLabel="Nhân viên A" groups={groups}>
        <main>Nội dung</main>
      </AdminShell>
    );

    expect(screen.getByRole('button', {name: 'Mở menu quản trị'})).toHaveClass(
      'min-h-11',
      'min-w-11'
    );
    expect(
      screen.getByRole('button', {name: 'Thu gọn menu quản trị'})
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Đóng menu quản trị'})
    ).toBeInTheDocument();

    const activeLinks = screen.getAllByRole('link', {name: 'Khách hàng'});
    expect(
      activeLinks.some((link) => link.getAttribute('aria-current') === 'page')
    ).toBe(true);
  });

  it('gives the mobile drawer a visible semantic heading', () => {
    render(
      <AdminShell role="staff" userLabel="Nhân viên A" groups={groups}>
        <main>Nội dung</main>
      </AdminShell>
    );

    expect(
      screen.getByRole('heading', {level: 2, name: 'NUPSBOX ADMIN'})
    ).toBeInTheDocument();
  });
});
