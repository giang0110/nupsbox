import type {AdminUnitType} from '@/features/admin/unit-types';

export function UnitTypePreview({unit}: {unit: AdminUnitType}) {
  const rows = [
    {
      locale: 'VI',
      name: unit.nameVi,
      recommendedFor: unit.recommendedForVi,
      capacity: unit.capacityNoteVi
    },
    {
      locale: 'EN',
      name: unit.nameEn,
      recommendedFor: unit.recommendedForEn,
      capacity: unit.capacityNoteEn
    }
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {rows.map(row => (
        <article
          key={row.locale}
          className="rounded-2xl border border-[var(--nupsbox-border)] bg-white p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[var(--nupsbox-blue)]">
                Preview {row.locale}
              </p>
              <h3 className="mt-2 text-xl font-extrabold tracking-[-0.03em] text-[var(--nupsbox-navy)]">
                {row.name}
              </h3>
            </div>
            <span className="rounded-full bg-[var(--nupsbox-surface)] px-3 py-1 text-xs font-bold text-[var(--nupsbox-slate)]">
              {unit.areaM2.toLocaleString('vi-VN', {maximumFractionDigits: 2})} m²
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-[var(--nupsbox-slate)]">
            {row.recommendedFor || (row.locale === 'VI' ? 'Chưa có nội dung gợi ý.' : 'Recommendation copy is missing.')}
          </p>
          <div className="mt-4 rounded-xl bg-[var(--nupsbox-surface)] px-4 py-3 text-xs leading-5 text-[var(--nupsbox-slate)]">
            {row.capacity || (row.locale === 'VI' ? 'Ghi chú sức chứa chưa được khai báo.' : 'Capacity note has not been provided.')}
          </div>
        </article>
      ))}
    </div>
  );
}
