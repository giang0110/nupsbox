import Link from 'next/link';
import {redirect} from 'next/navigation';
import {AdminPageHeader} from '@/components/admin/admin-page-header';
import {AdminPanel, AdminStatusBadge} from '@/components/admin/admin-primitives';
import {CatalogTables} from '@/components/admin/catalog-tables';
import {Container} from '@/components/ui/container';
import {getAdminCatalog} from '@/features/admin/catalog';
import {buildCatalogLaunchReadiness} from '@/features/admin/catalog-launch';
import {can} from '@/features/auth/permissions';
import {requireAdminUser} from '@/features/auth/require-admin-user';

export default async function AdminCatalogPage() {
  const session = await requireAdminUser();
  if (!can(session.role, 'catalog:read')) redirect('/admin');
  const catalog = await getAdminCatalog();
  const launch = buildCatalogLaunchReadiness(catalog);

  return (
    <main className="py-8 sm:py-10">
      <Container className="grid gap-6">
        <AdminPageHeader
          eyebrow="CATALOG"
          title="Kho & bảng giá"
          description="Quản lý địa điểm, loại kho và dữ liệu giá vận hành."
        />
        <AdminPanel
          title="Catalog Launch"
          description="Luồng ngắn nhất để đưa dữ liệu kho ra public mà không bỏ sót prerequisite."
          actions={
            <div className="text-right">
              <p className="text-3xl font-black tracking-[-0.04em] text-[var(--nupsbox-navy)]">{launch.score}%</p>
              <p className="text-xs font-bold text-[var(--nupsbox-slate)]">{launch.readyCount}/{launch.totalCount} bước đạt</p>
            </div>
          }
        >
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {launch.steps.map(step => (
              <Link
                key={step.id}
                href={step.href}
                target={step.id === 'preview' ? '_blank' : undefined}
                className={
                  'rounded-xl border p-4 transition ' +
                  (step.current
                    ? 'border-[var(--nupsbox-blue)] bg-blue-50/50'
                    : 'border-[var(--nupsbox-border)] bg-white hover:border-[var(--nupsbox-blue)]')
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <strong className="text-sm text-[var(--nupsbox-navy)]">{step.label}</strong>
                  <AdminStatusBadge
                    label={step.ready ? 'Đạt' : step.current ? 'Tiếp theo' : 'Chờ'}
                    tone={step.ready ? 'success' : step.current ? 'warning' : 'neutral'}
                  />
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--nupsbox-slate)]">{step.detail}</p>
              </Link>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[var(--nupsbox-surface)] px-4 py-3">
            <p className="text-sm font-bold text-[var(--nupsbox-navy)]">
              Bước nên làm tiếp: {launch.nextLabel}
            </p>
            <Link
              href={launch.nextHref}
              className="inline-flex min-h-10 items-center rounded-xl bg-[var(--nupsbox-navy)] px-4 text-sm font-bold text-white"
            >
              Mở bước tiếp theo
            </Link>
          </div>
        </AdminPanel>

        <CatalogTables catalog={catalog} />
      </Container>
    </main>
  );
}
