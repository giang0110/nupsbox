import {
  adminAvailabilityLabel,
  formatAdminPrice,
  type AdminCatalog
} from '@/features/admin/catalog';

export function CatalogTables({catalog}: {catalog: AdminCatalog}) {
  const locationNames = new Map(catalog.locations.map((location) => [location.id, location.nameVi]));
  const unitNames = new Map(catalog.unitTypes.map((unit) => [unit.id, unit.nameVi]));

  return (
    <div className="mt-10 grid gap-8">
      <section className="overflow-hidden rounded-[1.5rem] border border-[var(--nupsbox-border)] bg-white shadow-sm">
        <div className="border-b border-[var(--nupsbox-border)] px-6 py-5">
          <h2 className="text-xl font-black text-[var(--nupsbox-navy)]">Địa điểm</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[var(--nupsbox-surface)] text-xs uppercase tracking-[0.08em] text-[var(--nupsbox-slate)]">
              <tr><th className="px-5 py-4">Tên</th><th className="px-5 py-4">Quận</th><th className="px-5 py-4">Trạng thái</th><th className="px-5 py-4">Slug</th></tr>
            </thead>
            <tbody>
              {catalog.locations.map((location) => (
                <tr key={location.id} className="border-t border-[var(--nupsbox-border)]">
                  <td className="px-5 py-4"><span className="font-black text-[var(--nupsbox-navy)]">{location.nameVi}</span>{location.isFeatured ? <span className="ml-2 rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-[var(--nupsbox-blue)]">Nổi bật</span> : null}<p className="mt-1 text-xs text-[var(--nupsbox-slate)]">{location.nameEn}</p></td>
                  <td className="px-5 py-4 text-[var(--nupsbox-slate)]">{location.district}</td>
                  <td className="px-5 py-4 font-bold text-[var(--nupsbox-navy)]">{location.status}</td>
                  <td className="px-5 py-4 font-mono text-xs text-[var(--nupsbox-slate)]">{location.slug}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.5rem] border border-[var(--nupsbox-border)] bg-white shadow-sm">
        <div className="border-b border-[var(--nupsbox-border)] px-6 py-5">
          <h2 className="text-xl font-black text-[var(--nupsbox-navy)]">Loại kho</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[var(--nupsbox-surface)] text-xs uppercase tracking-[0.08em] text-[var(--nupsbox-slate)]">
              <tr><th className="px-5 py-4">Tên</th><th className="px-5 py-4">Diện tích</th><th className="px-5 py-4">Hoạt động</th><th className="px-5 py-4">Slug</th></tr>
            </thead>
            <tbody>
              {catalog.unitTypes.map((unit) => (
                <tr key={unit.id} className="border-t border-[var(--nupsbox-border)]">
                  <td className="px-5 py-4"><span className="font-black text-[var(--nupsbox-navy)]">{unit.nameVi}</span><p className="mt-1 text-xs text-[var(--nupsbox-slate)]">{unit.nameEn}</p></td>
                  <td className="px-5 py-4 font-bold text-[var(--nupsbox-navy)]">{unit.areaM2.toLocaleString('vi-VN')} m²</td>
                  <td className="px-5 py-4 text-[var(--nupsbox-slate)]">{unit.active ? 'Có' : 'Không'}</td>
                  <td className="px-5 py-4 font-mono text-xs text-[var(--nupsbox-slate)]">{unit.slug}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.5rem] border border-[var(--nupsbox-border)] bg-white shadow-sm">
        <div className="border-b border-[var(--nupsbox-border)] px-6 py-5">
          <h2 className="text-xl font-black text-[var(--nupsbox-navy)]">Giá & trạng thái tư vấn</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--nupsbox-slate)]">Các trạng thái dưới đây là dữ liệu vận hành để tư vấn, không phải cam kết tồn kho thời gian thực.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-[var(--nupsbox-surface)] text-xs uppercase tracking-[0.08em] text-[var(--nupsbox-slate)]">
              <tr><th className="px-5 py-4">Địa điểm</th><th className="px-5 py-4">Loại kho</th><th className="px-5 py-4">Giá tháng</th><th className="px-5 py-4">Khuyến mãi</th><th className="px-5 py-4">Trạng thái</th></tr>
            </thead>
            <tbody>
              {catalog.pricing.map((row) => (
                <tr key={row.id} className="border-t border-[var(--nupsbox-border)]">
                  <td className="px-5 py-4 font-bold text-[var(--nupsbox-navy)]">{locationNames.get(row.locationId) ?? row.locationId}</td>
                  <td className="px-5 py-4 font-bold text-[var(--nupsbox-navy)]">{unitNames.get(row.unitTypeId) ?? row.unitTypeId}</td>
                  <td className="px-5 py-4 text-[var(--nupsbox-slate)]">{formatAdminPrice(row.monthlyPrice)}</td>
                  <td className="px-5 py-4 text-[var(--nupsbox-slate)]">{formatAdminPrice(row.promoPrice)}</td>
                  <td className="px-5 py-4"><span className="font-bold text-[var(--nupsbox-navy)]">{adminAvailabilityLabel(row.availabilityStatus)}</span>{row.featured ? <span className="ml-2 text-xs font-bold text-[var(--nupsbox-blue)]">Nổi bật</span> : null}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
