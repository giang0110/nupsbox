import Link from 'next/link';
import {redirect} from 'next/navigation';
import {AdminPageHeader} from '@/components/admin/admin-page-header';
import {AdminEmptyState, AdminPanel, AdminStatusBadge} from '@/components/admin/admin-primitives';
import {PricingForm} from '@/components/admin/pricing-form';
import {Container} from '@/components/ui/container';
import {listAdminLocations} from '@/features/admin/locations';
import {listAdminPricing} from '@/features/admin/pricing';
import {listAdminUnitTypes} from '@/features/admin/unit-types';
import {can} from '@/features/auth/permissions';
import {requireAdminUser} from '@/features/auth/require-admin-user';

export default async function AdminPricingPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAdminUser();
  if (!can(session.role, 'catalog:read')) redirect('/admin');

  const params = await searchParams;
  const requestedUnitId = Array.isArray(params.unit) ? params.unit[0] : params.unit;
  const requestedLocationId = Array.isArray(params.location) ? params.location[0] : params.location;

  const [pricing, locations, units] = await Promise.all([
    listAdminPricing(),
    listAdminLocations(),
    listAdminUnitTypes()
  ]);
  const canCreate = can(session.role, 'catalog:create');
  const canUpdate = can(session.role, 'catalog:update');
  const activeLocations = locations.filter(location => location.status === 'active');
  const activeUnits = units.filter(unit => unit.active);
  const hasPrerequisites = activeLocations.length > 0 && activeUnits.length > 0;
  const defaultLocationId = activeLocations.some(location => location.id === requestedLocationId)
    ? requestedLocationId
    : activeLocations[0]?.id;
  const defaultUnitTypeId = activeUnits.some(unit => unit.id === requestedUnitId)
    ? requestedUnitId
    : activeUnits[0]?.id;

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

        <AdminPanel
          title="Prerequisite"
          description="Mapping giá chỉ nên tạo sau khi có location và Unit Type đã active."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/admin/catalog/locations"
              className="rounded-xl border border-[var(--nupsbox-border)] p-4 transition hover:border-[var(--nupsbox-blue)]"
            >
              <div className="flex items-center justify-between gap-3">
                <strong className="text-sm text-[var(--nupsbox-navy)]">Location active</strong>
                <AdminStatusBadge label={activeLocations.length ? String(activeLocations.length) : 'Thiếu'} tone={activeLocations.length ? 'success' : 'danger'} />
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--nupsbox-slate)]">Cần ít nhất 1 cơ sở active.</p>
            </Link>
            <Link
              href="/admin/catalog/unit-types"
              className="rounded-xl border border-[var(--nupsbox-border)] p-4 transition hover:border-[var(--nupsbox-blue)]"
            >
              <div className="flex items-center justify-between gap-3">
                <strong className="text-sm text-[var(--nupsbox-navy)]">Unit Type active</strong>
                <AdminStatusBadge label={activeUnits.length ? String(activeUnits.length) : 'Thiếu'} tone={activeUnits.length ? 'success' : 'danger'} />
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--nupsbox-slate)]">Publish ít nhất 1 loại kho trước khi tạo mapping.</p>
            </Link>
          </div>
        </AdminPanel>

        <div className="grid gap-6">
          {canCreate && hasPrerequisites ? (
            <PricingForm
              locations={activeLocations}
              units={activeUnits}
              canMutate
              defaultLocationId={defaultLocationId}
              defaultUnitTypeId={defaultUnitTypeId}
            />
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
              title={hasPrerequisites ? 'Chưa có cấu hình giá' : 'Chưa đủ prerequisite để cấu hình giá'}
              description={hasPrerequisites
                ? 'Chọn location và loại kho phía trên để tạo mapping đầu tiên. Giá tiền có thể để trống nếu chưa xác minh.'
                : 'Hoàn thiện location active và Unit Type active trước. Màn hình này sẽ tự mở form mapping khi đủ điều kiện.'}
              action={!hasPrerequisites ? (
                <Link
                  href={activeLocations.length ? '/admin/catalog/unit-types' : '/admin/catalog/locations'}
                  className="inline-flex min-h-11 items-center rounded-xl bg-[var(--nupsbox-navy)] px-4 text-sm font-bold text-white"
                >
                  {activeLocations.length ? 'Tạo / publish loại kho' : 'Hoàn thiện địa điểm'}
                </Link>
              ) : null}
            />
          )}
        </div>
      </Container>
    </main>
  );
}
