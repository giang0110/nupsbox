import {
  AdminPanel,
  AdminStatusBadge
} from '@/components/admin/admin-primitives';
import {
  adminAvailabilityLabel,
  formatAdminPrice,
  type AdminCatalog
} from '@/features/admin/catalog';

export function CatalogTables({catalog}: {catalog: AdminCatalog}) {
  const locationNames = new Map(
    catalog.locations.map((location) => [location.id, location.nameVi])
  );
  const unitNames = new Map(
    catalog.unitTypes.map((unit) => [unit.id, unit.nameVi])
  );

  return (
    <div className="grid gap-6">
      <AdminPanel title="Địa điểm">
        <div data-admin-desktop-table className="hidden lg:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--nupsbox-surface)] text-xs uppercase tracking-[0.08em] text-[var(--nupsbox-slate)]">
              <tr>
                <th className="px-4 py-3">Tên</th>
                <th className="px-4 py-3">Quận</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Slug</th>
              </tr>
            </thead>
            <tbody>
              {catalog.locations.map((location) => (
                <tr key={location.id} className="border-t border-[var(--nupsbox-border)]">
                  <td className="px-4 py-4">
                    <strong className="text-[var(--nupsbox-navy)]">{location.nameVi}</strong>
                    <p className="mt-1 text-xs text-[var(--nupsbox-slate)]">{location.nameEn}</p>
                  </td>
                  <td className="px-4 py-4 text-[var(--nupsbox-slate)]">{location.district}</td>
                  <td className="px-4 py-4">
                    <AdminStatusBadge
                      label={location.status === 'active' ? 'Đang hoạt động' : 'Bản nháp'}
                      tone={location.status === 'active' ? 'success' : 'neutral'}
                    />
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-[var(--nupsbox-slate)]">{location.slug}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div data-admin-mobile-list className="grid gap-3 lg:hidden">
          {catalog.locations.map((location) => (
            <article
              key={location.id}
              className="rounded-xl border border-[var(--nupsbox-border)] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-black text-[var(--nupsbox-navy)]">{location.nameVi}</h3>
                  <p className="mt-1 text-xs text-[var(--nupsbox-slate)]">{location.nameEn}</p>
                </div>
                <AdminStatusBadge
                  label={location.status === 'active' ? 'Đang hoạt động' : 'Bản nháp'}
                  tone={location.status === 'active' ? 'success' : 'neutral'}
                />
              </div>
              <p className="mt-3 text-sm text-[var(--nupsbox-slate)]">{location.district}</p>
              <p className="mt-2 font-mono text-xs text-[var(--nupsbox-slate)]">{location.slug}</p>
            </article>
          ))}
        </div>
      </AdminPanel>

      <AdminPanel title="Loại kho">
        <div data-admin-desktop-table className="hidden lg:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--nupsbox-surface)] text-xs uppercase tracking-[0.08em] text-[var(--nupsbox-slate)]">
              <tr>
                <th className="px-4 py-3">Tên</th>
                <th className="px-4 py-3">Diện tích</th>
                <th className="px-4 py-3">Hoạt động</th>
                <th className="px-4 py-3">Slug</th>
              </tr>
            </thead>
            <tbody>
              {catalog.unitTypes.map((unit) => (
                <tr key={unit.id} className="border-t border-[var(--nupsbox-border)]">
                  <td className="px-4 py-4">
                    <strong className="text-[var(--nupsbox-navy)]">{unit.nameVi}</strong>
                    <p className="mt-1 text-xs text-[var(--nupsbox-slate)]">{unit.nameEn}</p>
                  </td>
                  <td className="px-4 py-4 font-bold text-[var(--nupsbox-navy)]">
                    {unit.areaM2.toLocaleString('vi-VN')} m²
                  </td>
                  <td className="px-4 py-4 text-[var(--nupsbox-slate)]">{unit.active ? 'Có' : 'Không'}</td>
                  <td className="px-4 py-4 font-mono text-xs text-[var(--nupsbox-slate)]">{unit.slug}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div data-admin-mobile-list className="grid gap-3 lg:hidden">
          {catalog.unitTypes.map((unit) => (
            <article
              key={unit.id}
              className="rounded-xl border border-[var(--nupsbox-border)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black text-[var(--nupsbox-navy)]">{unit.nameVi}</h3>
                  <p className="mt-1 text-xs text-[var(--nupsbox-slate)]">{unit.nameEn}</p>
                </div>
                <AdminStatusBadge
                  label={unit.active ? 'Đang hoạt động' : 'Bản nháp'}
                  tone={unit.active ? 'success' : 'neutral'}
                />
              </div>
              <p className="mt-3 text-sm text-[var(--nupsbox-slate)]">
                {unit.areaM2.toLocaleString('vi-VN')} m² · Hoạt động: {unit.active ? 'Có' : 'Không'}
              </p>
              <p className="mt-2 font-mono text-xs text-[var(--nupsbox-slate)]">{unit.slug}</p>
            </article>
          ))}
        </div>
      </AdminPanel>

      <AdminPanel
        title="Giá & trạng thái tư vấn"
        description="Các trạng thái dưới đây là dữ liệu vận hành để tư vấn, không phải cam kết tồn kho thời gian thực."
      >
        <div data-admin-desktop-table className="hidden lg:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--nupsbox-surface)] text-xs uppercase tracking-[0.08em] text-[var(--nupsbox-slate)]">
              <tr>
                <th className="px-4 py-3">Địa điểm</th>
                <th className="px-4 py-3">Loại kho</th>
                <th className="px-4 py-3">Giá tháng</th>
                <th className="px-4 py-3">Khuyến mãi</th>
                <th className="px-4 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {catalog.pricing.map((row) => (
                <tr key={row.id} className="border-t border-[var(--nupsbox-border)]">
                  <td className="px-4 py-4 font-bold text-[var(--nupsbox-navy)]">
                    {locationNames.get(row.locationId) ?? row.locationId}
                  </td>
                  <td className="px-4 py-4 font-bold text-[var(--nupsbox-navy)]">
                    {unitNames.get(row.unitTypeId) ?? row.unitTypeId}
                  </td>
                  <td className="px-4 py-4 text-[var(--nupsbox-slate)]">{formatAdminPrice(row.monthlyPrice)}</td>
                  <td className="px-4 py-4 text-[var(--nupsbox-slate)]">{formatAdminPrice(row.promoPrice)}</td>
                  <td className="px-4 py-4">
                    <AdminStatusBadge label={adminAvailabilityLabel(row.availabilityStatus)} tone="info" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div data-admin-mobile-list className="grid gap-3 lg:hidden">
          {catalog.pricing.map((row) => (
            <article
              key={row.id}
              className="rounded-xl border border-[var(--nupsbox-border)] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-black text-[var(--nupsbox-navy)]">
                    {locationNames.get(row.locationId) ?? row.locationId}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--nupsbox-slate)]">
                    {unitNames.get(row.unitTypeId) ?? row.unitTypeId}
                  </p>
                </div>
                <AdminStatusBadge label={adminAvailabilityLabel(row.availabilityStatus)} tone="info" />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs font-bold text-[var(--nupsbox-slate)]">Giá tháng</dt>
                  <dd className="mt-1 font-bold text-[var(--nupsbox-navy)]">{formatAdminPrice(row.monthlyPrice)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-[var(--nupsbox-slate)]">Khuyến mãi</dt>
                  <dd className="mt-1 font-bold text-[var(--nupsbox-navy)]">{formatAdminPrice(row.promoPrice)}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </AdminPanel>
    </div>
  );
}
