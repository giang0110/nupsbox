'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect, useRef, useState, type ReactNode} from 'react';
import clsx from 'clsx';
import {
  isAdminRouteActive,
  type AdminNavigationGroup
} from '@/features/admin/navigation';
import type {AppRole} from '@/types/database';

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
                  <span aria-hidden className={clsx('text-xs font-black', !collapsed && 'mr-3')}>
                    {item.label.slice(0, 1)}
                  </span>
                  <span className={clsx(collapsed && 'sr-only')}>{item.label}</span>
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
        gridTemplateColumns: collapsed ? '5.5rem minmax(0, 1fr)' : '18rem minmax(0, 1fr)'
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
        <strong className="tracking-[-0.03em] text-[var(--nupsbox-navy)]">NUPSBOX ADMIN</strong>
        <span className="rounded-full bg-[var(--nupsbox-surface)] px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.08em] text-[var(--nupsbox-slate)]">
          {role}
        </span>
      </div>

      <aside className="hidden min-h-screen flex-col border-r border-[var(--nupsbox-border)] bg-white lg:flex">
        <div className="sticky top-0 flex min-h-screen flex-col">
          <div className="flex min-h-20 items-center justify-between gap-3 border-b border-[var(--nupsbox-border)] px-4">
            <strong
              className={clsx(
                'truncate tracking-[-0.03em] text-[var(--nupsbox-navy)]',
                collapsed && 'sr-only'
              )}
            >
              NUPSBOX ADMIN
            </strong>
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
          </div>
        </div>
      </dialog>

      <div className="min-w-0">
        {children}
      </div>
    </div>
  );
}
