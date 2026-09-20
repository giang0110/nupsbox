import Link from 'next/link';
import {redirect} from 'next/navigation';
import {AdminPageHeader} from '@/components/admin/admin-page-header';
import {AdminEmptyState, AdminPanel, AdminStatCard, AdminStatusBadge} from '@/components/admin/admin-primitives';
import {UnitTypeForm} from '@/components/admin/unit-type-form';
import {summarizeUnitTypeLaunch} from '@/features/admin/unit-type-launch';
import {Container} from '@/components/ui/container';
import {listAdminUnitTypes} from '@/features/admin/unit-types';
import {can} from '@/features/auth/permissions';
import {requireAdminUser} from '@/features/auth/require-admin-user';

export default async function AdminUnitTypesPage() {
  const session = await requireAdminUser();
  if (!can(session.role, 'catalog:read')) redirect('/admin');

  const units = await listAdminUnitTypes();
  const canCreate = can(session.role, 'catalog:create');
  const canUpdate = can(session.role, 'catalog:update');
  const canPublish = can(session.role, 'catalog:publish');
  const launch = summarizeUnitTypeLaunch(units);

  return (
    <main className="py-8 sm:py-10">
      <Container className="grid gap-6">
        <AdminPageHeader
          eyebrow="CATALOG / UNIT TYPES"
          title="Loại kho"
          description="Quản lý thông tin tư vấn và trạng thái xuất bản; slug được khóa sau lần xuất bản đầu tiên."
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
          title="Unit Type Launch"
          description="Tạo → hoàn thiện nội dung → preview → publish → sang Pricing. Không cần mở nhiều màn hình để biết bước tiếp theo."
          actions={<AdminStatusBadge label={launch.active ? launch.active + ' active' : 'Chưa có active'} tone={launch.active ? 'success' : 'warning'} />}
        >
          <section aria-label="Tổng quan Unit Type" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard label="Tổng loại kho" value={launch.total} />
            <AdminStatCard label="Draft" value={launch.drafts} />
            <AdminStatCard label="Draft sẵn sàng" value={launch.readyDrafts} />
            <AdminStatCard label="Đang active" value={launch.active} />
          </section>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[var(--nupsbox-surface)] px-4 py-3">
            <p className="text-sm font-bold text-[var(--nupsbox-navy)]">Bước nên làm tiếp: {launch.nextLabel}</p>
            <Link
              href={launch.nextHref}
              className="inline-flex min-h-10 items-center rounded-xl bg-[var(--nupsbox-navy)] px-4 text-sm font-bold text-white"
            >
              Mở bước tiếp theo
            </Link>
          </div>
        </AdminPanel>

        <div className="grid gap-6">
          {canCreate ? (
            <div id="new-unit" className="scroll-mt-24">
              <UnitTypeForm canMutate canPublish={false} />
            </div>
          ) : null}
          <div id="saved-units" className="grid scroll-mt-24 gap-6">
          {units.length ? (
            units.map((unit) => (
              <UnitTypeForm
                key={unit.id}
                unit={unit}
                canMutate={canUpdate}
                canPublish={canPublish}
              />
            ))
          ) : (
            <AdminEmptyState
              title="Chưa có loại kho"
              description="Tạo draft đầu tiên ở form phía trên. Hệ thống sẽ không tự suy đoán diện tích, tên hay nội dung tư vấn."
            />
          )}
          </div>
        </div>
      </Container>
    </main>
  );
}
