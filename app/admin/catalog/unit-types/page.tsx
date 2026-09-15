import Link from 'next/link';
import {redirect} from 'next/navigation';
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
    <main className="py-10 sm:py-14">
      <Container>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs font-black tracking-[0.16em] text-[var(--nupsbox-blue)]">CATALOG / UNIT TYPES</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] text-[var(--nupsbox-navy)] sm:text-5xl">Loại kho</h1>
            <p className="mt-4 leading-7 text-[var(--nupsbox-slate)]">Tạo loại kho ở trạng thái chưa xuất bản. Sau lần xuất bản đầu tiên, slug được khóa.</p>
          </div>
          <Link href="/admin/catalog" className="rounded-full border border-[var(--nupsbox-border)] px-4 py-2 text-sm font-bold text-[var(--nupsbox-navy)]">Về catalog</Link>
        </div>
        <div className="mt-8 space-y-6">
          {canCreate ? <UnitTypeForm canMutate canPublish={false} /> : null}
          {units.length === 0 ? <div className="rounded-3xl border border-dashed border-[var(--nupsbox-border)] p-8 text-sm text-[var(--nupsbox-slate)]">Chưa có loại kho.</div> : units.map((unit) => <UnitTypeForm key={unit.id} unit={unit} canMutate={canUpdate} canPublish={canPublish} />)}
        </div>
      </Container>
    </main>
  );
}
