import type {ReactNode} from 'react';
import '../globals.css';
import {AdminShell} from '@/components/admin/admin-shell';
import {getAdminNavigation} from '@/features/admin/navigation';
import {requireAdminUser} from '@/features/auth/require-admin-user';
import {PRIVATE_AREA_METADATA} from '@/features/seo/private-metadata';

export const metadata = PRIVATE_AREA_METADATA;

export default async function AdminLayout({children}: {children: ReactNode}) {
  const session = await requireAdminUser();
  const userLabel = session.fullName ?? session.user.email ?? session.role;

  return (
    <AdminShell
      role={session.role}
      userLabel={userLabel}
      groups={getAdminNavigation(session.role)}
    >
      {children}
    </AdminShell>
  );
}
