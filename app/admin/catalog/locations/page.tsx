import Link from 'next/link';
import {redirect} from 'next/navigation';
import {AdminPageHeader} from '@/components/admin/admin-page-header';
import {AdminEmptyState, AdminPanel, AdminStatCard} from '@/components/admin/admin-primitives';
import {LocationForm} from '@/components/admin/location-form';
import {Container} from '@/components/ui/container';
import {listAdminLocations} from '@/features/admin/locations';
import {listAdminMedia} from '@/features/admin/media';
import {listAdminPricing} from '@/features/admin/pricing';
import {buildLocationLaunchReadiness} from '@/features/admin/location-launch';
import {can} from '@/features/auth/permissions';
import {requireAdminUser} from '@/features/auth/require-admin-user';

export default async function AdminLocationsPage() {
  const session = await requireAdminUser();
  if (!can(session.role, 'catalog:read')) redirect('/admin');

  const [locations, media, pricing] = await Promise.all([
    listAdminLocations(),
    listAdminMedia(),
    listAdminPricing()
  ]);
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

        <AdminPanel
          title="Location Launch"
          description="Rà nhanh mức hoàn thiện của từng cơ sở trước khi bổ sung media, mapping giá và mở public preview."
        >
          <section aria-label="Tổng quan địa điểm" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard label="Tổng cơ sở" value={locations.length} />
            <AdminStatCard label="Đang active" value={locations.filter(item => item.status === 'active').length} />
            <AdminStatCard label="Có ảnh public" value={locations.filter(item => media.some(asset => asset.locationId === item.id && asset.isPublic)).length} />
            <AdminStatCard label="Có mapping giá" value={locations.filter(item => pricing.some(row => row.locationId === item.id)).length} />
          </section>
        </AdminPanel>

        <div className="grid gap-6">
          {canCreate ? <LocationForm canMutate canPublish={false} /> : null}
          {locations.length ? (
            locations.map((location) => (
              <LocationForm
                key={location.id}
                location={location}
                canMutate={canUpdate}
                canPublish={canPublish}
                launch={buildLocationLaunchReadiness(location, media, pricing)}
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
