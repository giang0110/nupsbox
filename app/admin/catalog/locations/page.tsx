import Link from 'next/link';
import {redirect} from 'next/navigation';
import {AdminPageHeader} from '@/components/admin/admin-page-header';
import {AdminEmptyState} from '@/components/admin/admin-primitives';
import {LocationForm} from '@/components/admin/location-form';
import {Container} from '@/components/ui/container';
import {listAdminLocations} from '@/features/admin/locations';
import {can} from '@/features/auth/permissions';
import {requireAdminUser} from '@/features/auth/require-admin-user';

export default async function AdminLocationsPage() {
  const session = await requireAdminUser();
  if (!can(session.role, 'catalog:read')) redirect('/admin');

  const locations = await listAdminLocations();
  const canCreate = can(session.role, 'catalog:create');
  const canUpdate = can(session.role, 'catalog:update');
  const canPublish = can(session.role, 'catalog:publish');

  return (
    <main className="py-8 sm:py-10">
      <Container className="grid gap-6">
        <AdminPageHeader
          eyebrow="CATALOG / LOCATIONS"
          title="Quản lý địa điểm"
          description="Tạo bản nháp, cập nhật dữ liệu vận hành và xuất bản bằng quyền riêng biệt."
          actions={
            <Link
              href="/admin/catalog"
              className="inline-flex min-h-11 items-center rounded-xl border border-[var(--nupsbox-border)] bg-white px-4 text-sm font-bold text-[var(--nupsbox-navy)]"
            >
              Về catalog
            </Link>
          }
        />

        <div className="grid gap-6">
          {canCreate ? <LocationForm canMutate canPublish={false} /> : null}
          {locations.length ? (
            locations.map((location) => (
              <LocationForm
                key={location.id}
                location={location}
                canMutate={canUpdate}
                canPublish={canPublish}
              />
            ))
          ) : (
            <AdminEmptyState
              title="Chưa có địa điểm"
              description="Chưa có địa điểm nào trong cơ sở dữ liệu."
            />
          )}
        </div>
      </Container>
    </main>
  );
}
