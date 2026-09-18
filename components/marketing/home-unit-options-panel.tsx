'use client';

import {UnitCard} from '@/components/units/unit-card';
import type {PublicUnitType} from '@/features/catalog/types';

export function HomeUnitOptionsPanel({
  units,
  locale
}: {
  units: PublicUnitType[];
  locale: 'vi' | 'en';
}) {
  const vi = locale === 'vi';

  if (!units.length) {
    return (
      <div
        className="rounded-2xl border border-[var(--nupsbox-border)] bg-white p-6 text-sm leading-6 text-[var(--nupsbox-slate)]"
        role="status"
      >
        <p className="font-bold text-[var(--nupsbox-navy)]">
          {vi ? 'Chưa có loại kho được công bố.' : 'No storage unit types are currently published.'}
        </p>
        <p className="mt-1">
          {vi
            ? 'NupsBox sẽ hiển thị diện tích, giá và tình trạng sau khi dữ liệu được xác nhận.'
            : 'NupsBox will show area, pricing and status after the data has been verified.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {units.map((unit) => <UnitCard key={unit.id} unit={unit} locale={locale} />)}
    </div>
  );
}
