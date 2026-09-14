import type {ReactNode} from 'react';
import {AdminNav} from '@/components/admin/admin-nav';
import {Container} from '@/components/ui/container';
import {requireAdminUser} from '@/features/auth/require-admin-user';
import {PRIVATE_AREA_METADATA} from '@/features/seo/private-metadata';

export const metadata = PRIVATE_AREA_METADATA;

export default async function AdminLayout({children}: {children: ReactNode}) {
  const session = await requireAdminUser();

  return (
    <div className="min-h-screen bg-[var(--nupsbox-surface)]">
      <header className="border-b border-[var(--nupsbox-border)] bg-white">
        <Container className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-4">
            <strong className="tracking-[-0.03em] text-[var(--nupsbox-navy)]">NUPSBOX ADMIN</strong>
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--nupsbox-slate)]">{session.role}</span>
          </div>
          <AdminNav role={session.role} />
          <span className="text-sm text-[var(--nupsbox-slate)]">{session.fullName ?? session.user.email ?? session.role}</span>
        </Container>
      </header>
      {children}
    </div>
  );
}
