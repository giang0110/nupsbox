import Link from 'next/link';
import {redirect} from 'next/navigation';
import {AdminPageHeader} from '@/components/admin/admin-page-header';
import {AdminEmptyState} from '@/components/admin/admin-primitives';
import {UnitTypeForm} from '@/components/admin/unit-type-form';
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

        <div className="grid gap-6">
          {canCreate ? <UnitTypeForm canMutate canPublish={false} /> : null}
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
              description="Chưa có loại kho nào trong cơ sở dữ liệu."
            />
          )}
        </div>
      </Container>
    </main>
  );
}
