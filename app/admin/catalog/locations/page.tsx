import Link from 'next/link';
import {redirect} from 'next/navigation';
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
    <main className="py-10 sm:py-14">
      <Container>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs font-black tracking-[0.16em] text-[var(--nupsbox-blue)]">CATALOG / LOCATIONS</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] text-[var(--nupsbox-navy)] sm:text-5xl">
              Quản lý địa điểm
            </h1>
            <p className="mt-4 leading-7 text-[var(--nupsbox-slate)]">
              Tạo địa điểm ở trạng thái chưa xuất bản, cập nhật dữ liệu vận hành và xuất bản bằng quyền riêng biệt.
            </p>
          </div>
          <Link
            href="/admin/catalog"
            className="rounded-full border border-[var(--nupsbox-border)] px-4 py-2 text-sm font-bold text-[var(--nupsbox-navy)]"
          >
            Về catalog
          </Link>
        </div>

        <div className="mt-8 space-y-6">
          {canCreate ? <LocationForm canMutate canPublish={false} /> : null}
          {locations.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[var(--nupsbox-border)] p-8 text-sm text-[var(--nupsbox-slate)]">
              Chưa có địa điểm nào trong cơ sở dữ liệu.
            </div>
          ) : (
            locations.map((location) => (
              <LocationForm
                key={location.id}
                location={location}
                canMutate={canUpdate}
                canPublish={canPublish}
              />
            ))
          )}
        </div>
      </Container>
    </main>
  );
}
