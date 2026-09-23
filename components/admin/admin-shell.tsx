'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect, useRef, useState, type ReactNode} from 'react';
import clsx from 'clsx';
import {
  BarChart3,
  Boxes,
  CalendarDays,
  CircleGauge,
  ClipboardCheck,
  FileText,
  HelpCircle,
  ImageIcon,
  LayoutDashboard,
  MapPin,
  NotebookTabs,
  ReceiptText,
  SearchCheck,
  Settings,
  ShieldCheck,
  Users
} from 'lucide-react';
import {
  isAdminRouteActive,
  type AdminNavigationGroup
} from '@/features/admin/navigation';
import type {AppRole} from '@/types/database';
import {AdminLogoutButton} from '@/components/admin/admin-logout-button';

function NavigationIcon({href}: {href: string}) {
  const iconClass = "size-[17px]";
  if (href === '/admin') return <LayoutDashboard className={iconClass} aria-hidden="true" />;
  if (href === '/admin/action-center') return <ClipboardCheck className={iconClass} aria-hidden="true" />;
  if (href.startsWith('/admin/leads')) return <Users className={iconClass} aria-hidden="true" />;
  if (href === '/admin/quality') return <ShieldCheck className={iconClass} aria-hidden="true" />;
  if (href === '/admin/analytics') return <BarChart3 className={iconClass} aria-hidden="true" />;
  if (href === '/admin/seo') return <SearchCheck className={iconClass} aria-hidden="true" />;
  if (href === '/admin/audit') return <FileText className={iconClass} aria-hidden="true" />;
  if (href === '/admin/catalog') return <CircleGauge className={iconClass} aria-hidden="true" />;
  if (href === '/admin/catalog/locations') return <MapPin className={iconClass} aria-hidden="true" />;
  if (href === '/admin/catalog/unit-types') return <Boxes className={iconClass} aria-hidden="true" />;
  if (href === '/admin/catalog/pricing') return <ReceiptText className={iconClass} aria-hidden="true" />;
  if (href === '/admin/content') return <NotebookTabs className={iconClass} aria-hidden="true" />;
  if (href === '/admin/content/faq') return <HelpCircle className={iconClass} aria-hidden="true" />;
  if (href === '/admin/content/blog') return <FileText className={iconClass} aria-hidden="true" />;
  if (href === '/admin/content/calendar') return <CalendarDays className={iconClass} aria-hidden="true" />;
  if (href === '/admin/content/media') return <ImageIcon className={iconClass} aria-hidden="true" />;
  if (href === '/admin/content/settings') return <Settings className={iconClass} aria-hidden="true" />;
  return <FileText className={iconClass} aria-hidden="true" />;
}

type AdminShellProps = {
  role: AppRole;
  userLabel: string;
  groups: AdminNavigationGroup[];
  children: ReactNode;
};

function Navigation({
  groups,
  pathname,
  collapsed = false,
  onNavigate
}: {
  groups: AdminNavigationGroup[];
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Quản trị NupsBox" className="grid gap-6">
      {groups.map((group) => (
        <section key={group.label} aria-label={group.label}>
          <p
            className={clsx(
              'mb-2 px-3 text-[0.68rem] font-black uppercase tracking-[0.14em] text-[var(--nupsbox-slate)]',
              collapsed && 'sr-only'
            )}
          >
            {group.label}
          </p>
          <div className="grid gap-1">
            {group.items.map((item) => {
              const active = isAdminRouteActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  title={collapsed ? item.label : undefined}
                  onClick={onNavigate}
                  className={clsx(
                    'flex min-h-11 items-center rounded-xl px-3 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nupsbox-blue)]',
                    active
                      ? 'bg-blue-50 text-[var(--nupsbox-blue)]'
                      : 'text-[var(--nupsbox-navy)] hover:bg-[var(--nupsbox-surface)]',
                    collapsed && 'justify-center px-2'
                  )}
                >
                  <span
                    className={clsx(
                      'grid size-8 shrink-0 place-items-center rounded-lg transition',
                      active ? 'bg-white text-[var(--nupsbox-blue)] shadow-sm' : 'bg-[var(--nupsbox-surface)] text-[var(--nupsbox-slate)]',
                      !collapsed && 'mr-3'
                    )}
                  >
                    <NavigationIcon href={item.href} />
                  </span>
                  <span className={clsx('truncate', collapsed && 'sr-only')}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </nav>
  );
}

export function AdminShell({role, userLabel, groups, children}: AdminShellProps) {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (dialogRef.current?.open) {
      dialogRef.current.close();
    }
  }, [pathname]);

  function openDrawer() {
    dialogRef.current?.showModal();
  }

  function closeDrawer() {
    dialogRef.current?.close();
  }

  return (
    <div
      className="min-h-screen bg-[var(--nupsbox-surface)] lg:grid"
      style={{
        gridTemplateColumns: collapsed ? '5.25rem minmax(0, 1fr)' : '17rem minmax(0, 1fr)'
      }}
    >
      <div className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-[var(--nupsbox-border)] bg-white px-4 lg:hidden">
        <button
          type="button"
          onClick={openDrawer}
          aria-label="Mở menu quản trị"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-[var(--nupsbox-border)] bg-white text-lg font-black text-[var(--nupsbox-navy)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nupsbox-blue)]"
        >
          ☰
        </button>
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-[var(--nupsbox-yellow)] text-xs font-black tracking-[-0.08em] text-[var(--nupsbox-navy)]">NB</span>
          <strong className="tracking-[-0.03em] text-[var(--nupsbox-navy)]">ADMIN</strong>
        </div>
        <span className="rounded-full bg-[var(--nupsbox-surface)] px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.08em] text-[var(--nupsbox-slate)]">
          {role}
        </span>
      </div>

      <aside className="hidden min-h-screen flex-col border-r border-[var(--nupsbox-border)] bg-white lg:flex">
        <div className="sticky top-0 flex min-h-screen flex-col">
          <div className="flex min-h-20 items-center justify-between gap-3 border-b border-[var(--nupsbox-border)] px-4">
            <div className={clsx('flex min-w-0 items-center gap-2.5', collapsed && 'sr-only')}>
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--nupsbox-yellow)] text-xs font-black tracking-[-0.08em] text-[var(--nupsbox-navy)]">NB</span>
              <div className="min-w-0">
                <strong className="block truncate tracking-[-0.03em] text-[var(--nupsbox-navy)]">NUPSBOX</strong>
                <span className="block text-[0.62rem] font-black uppercase tracking-[0.14em] text-[var(--nupsbox-slate)]">Operations</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              aria-label={collapsed ? 'Mở rộng menu quản trị' : 'Thu gọn menu quản trị'}
              className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--nupsbox-border)] bg-white text-sm font-black text-[var(--nupsbox-navy)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nupsbox-blue)]"
            >
              {collapsed ? '→' : '←'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-5">
            <Navigation groups={groups} pathname={pathname} collapsed={collapsed} />
          </div>

          <div className="border-t border-[var(--nupsbox-border)] p-4">
            <p className={clsx('truncate text-sm font-bold text-[var(--nupsbox-navy)]', collapsed && 'sr-only')}>
              {userLabel}
            </p>
            <p className={clsx('mt-1 text-xs font-bold uppercase tracking-[0.1em] text-[var(--nupsbox-slate)]', collapsed && 'text-center')}>
              {role}
            </p>
            <AdminLogoutButton collapsed={collapsed} />
          </div>
        </div>
      </aside>

      <dialog
        ref={dialogRef}
        aria-labelledby="admin-drawer-title"
        className="m-0 h-full max-h-none w-[min(88vw,22rem)] max-w-none border-0 bg-white p-0 shadow-2xl backdrop:bg-slate-950/40 lg:hidden"
      >
        <div className="flex min-h-full flex-col">
          <div className="flex min-h-16 items-center justify-between gap-3 border-b border-[var(--nupsbox-border)] px-4">
            <h2
              id="admin-drawer-title"
              className="font-black tracking-[-0.03em] text-[var(--nupsbox-navy)]"
            >
              NUPSBOX ADMIN
            </h2>
            <button
              type="button"
              onClick={closeDrawer}
              aria-label="Đóng menu quản trị"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-[var(--nupsbox-border)] bg-white text-lg font-black text-[var(--nupsbox-navy)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nupsbox-blue)]"
            >
              ×
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-5">
            <Navigation groups={groups} pathname={pathname} onNavigate={closeDrawer} />
          </div>
          <div className="border-t border-[var(--nupsbox-border)] p-4">
            <p className="text-sm font-bold text-[var(--nupsbox-navy)]">{userLabel}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-[var(--nupsbox-slate)]">
              {role}
            </p>
            <AdminLogoutButton />
          </div>
        </div>
      </dialog>

      <div className="min-w-0">
        {children}
      </div>
    </div>
  );
}
