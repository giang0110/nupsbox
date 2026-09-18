import {redirect} from 'next/navigation';
import {AdminPageHeader} from '@/components/admin/admin-page-header';
import {CatalogTables} from '@/components/admin/catalog-tables';
import {Container} from '@/components/ui/container';
import {getAdminCatalog} from '@/features/admin/catalog';
import {can} from '@/features/auth/permissions';
import {requireAdminUser} from '@/features/auth/require-admin-user';

export default async function AdminCatalogPage() {
  const session = await requireAdminUser();
  if (!can(session.role, 'catalog:read')) redirect('/admin');
  const catalog = await getAdminCatalog();

  return (
    <main className="py-8 sm:py-10">
      <Container className="grid gap-6">
        <AdminPageHeader
          eyebrow="CATALOG"
          title="Kho & bảng giá"
          description="Quản lý địa điểm, loại kho và dữ liệu giá vận hành."
        />
        <CatalogTables catalog={catalog} />
      </Container>
    </main>
  );
}
