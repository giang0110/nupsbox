import Link from 'next/link';
import {redirect} from 'next/navigation';
import {AdminPageHeader} from '@/components/admin/admin-page-header';
import {AdminEmptyState} from '@/components/admin/admin-primitives';
import {PricingForm} from '@/components/admin/pricing-form';
import {Container} from '@/components/ui/container';
import {listAdminLocations} from '@/features/admin/locations';
import {listAdminPricing} from '@/features/admin/pricing';
import {listAdminUnitTypes} from '@/features/admin/unit-types';
import {can} from '@/features/auth/permissions';
import {requireAdminUser} from '@/features/auth/require-admin-user';

export default async function AdminPricingPage() {
  const session = await requireAdminUser();
  if (!can(session.role, 'catalog:read')) redirect('/admin');

  const [pricing, locations, units] = await Promise.all([
    listAdminPricing(),
    listAdminLocations(),
    listAdminUnitTypes()
  ]);
  const canCreate = can(session.role, 'catalog:create');
  const canUpdate = can(session.role, 'catalog:update');

  return (
    <main className="py-8 sm:py-10">
      <Container className="grid gap-6">
        <AdminPageHeader
          eyebrow="CATALOG / PRICING"
          title="Bảng giá theo địa điểm"
          description="Giá chưa xác minh được để trống và tiếp tục hiển thị “Liên hệ”. Số lượng chỉ là dữ liệu vận hành nội bộ, không phải tồn kho realtime."
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
          {canCreate ? (
            <PricingForm locations={locations} units={units} canMutate />
          ) : null}
          {pricing.length ? (
            pricing.map((item) => (
              <PricingForm
                key={item.id}
                pricing={item}
                locations={locations}
                units={units}
                canMutate={canUpdate}
              />
            ))
          ) : (
            <AdminEmptyState
              title="Chưa có cấu hình giá"
              description="Chưa có cấu hình giá nào trong cơ sở dữ liệu."
            />
          )}
        </div>
      </Container>
    </main>
  );
}
