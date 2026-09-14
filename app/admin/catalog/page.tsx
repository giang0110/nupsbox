import {redirect} from 'next/navigation';
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
    <main className="py-10 sm:py-14">
      <Container>
        <div className="max-w-3xl">
          <p className="text-xs font-black tracking-[0.16em] text-[var(--nupsbox-blue)]">CATALOG</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] text-[var(--nupsbox-navy)] sm:text-5xl">Kho, loại kho & bảng giá</h1>
          <p className="mt-4 leading-7 text-[var(--nupsbox-slate)]">
            Kiểm tra dữ liệu catalog đang dùng cho website. Giai đoạn này ưu tiên xác minh dữ liệu đọc trước khi mở mutation catalog trên môi trường production.
          </p>
        </div>
        <CatalogTables catalog={catalog} />
      </Container>
    </main>
  );
}
