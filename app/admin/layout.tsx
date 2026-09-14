import type {ReactNode} from 'react';
import {requireAdminUser} from '@/features/auth/require-admin-user';

export default async function AdminLayout({children}: {children: ReactNode}) {
  const session = await requireAdminUser();

  return (
    <div className="min-h-screen bg-[var(--nupsbox-surface)]">
      <header className="border-b border-[var(--nupsbox-border)] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between">
          <strong className="tracking-[-0.03em] text-[var(--nupsbox-navy)]">NUPSBOX ADMIN</strong>
          <span className="text-sm text-[var(--nupsbox-slate)]">{session.fullName ?? session.user.email ?? session.role}</span>
        </div>
      </header>
      {children}
    </div>
  );
}
