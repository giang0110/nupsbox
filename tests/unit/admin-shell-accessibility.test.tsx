import {cleanup, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {AdminShell} from '@/components/admin/admin-shell';

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/leads'
}));

afterEach(() => cleanup());

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
  it('names visible navigation controls and marks the active route', () => {
    const {container} = render(
      <AdminShell role="staff" userLabel="Nhân viên A" groups={groups}>
        <main>Nội dung</main>
      </AdminShell>
    );

    expect(screen.getByRole('link', {name: 'Bỏ qua menu quản trị'})).toHaveAttribute(
      'href',
      '#admin-main-content'
    );
    expect(container.querySelector('#admin-main-content')).toHaveAttribute('tabindex', '-1');

    expect(screen.getByRole('button', {name: 'Mở menu quản trị'})).toHaveClass(
      'min-h-11',
      'min-w-11'
    );
    expect(
      screen.getByRole('button', {name: 'Thu gọn menu quản trị'})
    ).toBeInTheDocument();

    const closeButton = container.querySelector(
      'button[aria-label="Đóng menu quản trị"]'
    );
    expect(closeButton).toBeInTheDocument();

    const activeLinks = screen.getAllByRole('link', {name: 'Khách hàng'});
    expect(
      activeLinks.some((link) => link.getAttribute('aria-current') === 'page')
    ).toBe(true);
  });

  it('wires the closed mobile dialog to a semantic heading', () => {
    const {container} = render(
      <AdminShell role="staff" userLabel="Nhân viên A" groups={groups}>
        <main>Nội dung</main>
      </AdminShell>
    );

    const dialog = container.querySelector('dialog');
    const heading = container.querySelector('#admin-drawer-title');

    expect(dialog).toHaveAttribute('aria-labelledby', 'admin-drawer-title');
    expect(heading?.tagName).toBe('H2');
    expect(heading).toHaveTextContent('NUPSBOX ADMIN');
  });
});
