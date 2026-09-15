import Link from 'next/link';
import {redirect} from 'next/navigation';
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
    <main className="py-10 sm:py-14">
      <Container>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs font-black tracking-[0.16em] text-[var(--nupsbox-blue)]">CATALOG / PRICING</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] text-[var(--nupsbox-navy)] sm:text-5xl">Bảng giá theo địa điểm</h1>
            <p className="mt-4 leading-7 text-[var(--nupsbox-slate)]">Giá chưa xác minh được để trống và tiếp tục hiển thị “Liên hệ”. Số lượng chỉ là dữ liệu vận hành nội bộ, không phải tồn kho realtime.</p>
          </div>
          <Link href="/admin/catalog" className="rounded-full border border-[var(--nupsbox-border)] px-4 py-2 text-sm font-bold text-[var(--nupsbox-navy)]">Về catalog</Link>
        </div>
        <div className="mt-8 space-y-6">
          {canCreate ? <PricingForm locations={locations} units={units} canMutate /> : null}
          {pricing.length === 0 ? <div className="rounded-3xl border border-dashed border-[var(--nupsbox-border)] p-8 text-sm text-[var(--nupsbox-slate)]">Chưa có cấu hình giá.</div> : pricing.map((item) => <PricingForm key={item.id} pricing={item} locations={locations} units={units} canMutate={canUpdate} />)}
        </div>
      </Container>
    </main>
  );
}
