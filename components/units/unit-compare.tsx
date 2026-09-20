'use client';

import {useEffect, useMemo, useState} from 'react';
import {UnitCard} from './unit-card';
import {formatMonthlyPrice} from '@/features/catalog/price';
import {toggleComparedUnit} from '@/features/catalog/compare';
import type {PublicUnitType} from '@/features/catalog/types';
import {trackEvent} from '@/features/analytics/events';
import {ConversionCta} from '@/components/marketing/conversion-cta';

function availabilityLabel(status: PublicUnitType['availabilityStatus'], locale: 'vi' | 'en') {
  const vi = locale === 'vi';
  switch (status) {
    case 'available': return vi ? 'Có thể trao đổi ngay' : 'Available to discuss';
    case 'limited': return vi ? 'Số lượng hạn chế' : 'Limited availability';
    case 'sold_out': return vi ? 'Hiện chưa có chỗ' : 'Currently unavailable';
    default: return vi ? 'Liên hệ xác nhận' : 'Contact to confirm';
  }
}

export function UnitCompare({units, locale}: {units: PublicUnitType[]; locale: 'vi' | 'en'}) {
  const vi = locale === 'vi';
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedUnits = useMemo(
    () => selectedIds.map((id) => units.find((unit) => unit.id === id)).filter(Boolean) as PublicUnitType[],
    [selectedIds, units]
  );

  useEffect(() => {
    if (selectedIds.length === 2) trackEvent('unit_compare_open', {count: selectedIds.length, locale});
  }, [selectedIds.length, locale]);

  if (units.length === 0) {
    return (
      <section
        className="overflow-hidden rounded-3xl border border-[var(--nupsbox-border)] bg-white shadow-[var(--nupsbox-shadow-sm)]"
        role="status"
        aria-labelledby="empty-catalog-title"
      >
        <div className="grid lg:grid-cols-[.72fr_1.28fr]">
          <div className="bg-[var(--nupsbox-navy)] p-6 text-white sm:p-7">
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.15em] text-[var(--nupsbox-yellow)]">
              {vi ? 'TƯ VẤN TRƯỚC, CHỌN SAU' : 'ADVICE FIRST, CHOOSE SECOND'}
            </p>
            <h2 id="empty-catalog-title" className="mt-3 text-2xl font-extrabold tracking-[-0.035em] sm:text-3xl">
              {vi ? 'Catalog đang được hoàn thiện bằng dữ liệu đã xác minh.' : 'The catalog is being completed with verified data.'}
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/68">
              {vi
                ? 'NupsBox không hiển thị diện tích hoặc giá ước tính chỉ để lấp chỗ trống.'
                : 'NupsBox does not publish estimated sizes or prices simply to fill an empty catalog.'}
            </p>
          </div>

          <div className="p-5 sm:p-7">
            <p className="text-sm font-extrabold text-[var(--nupsbox-navy)]">
              {vi ? 'Bạn vẫn có thể bắt đầu ngay mà không cần biết diện tích kho.' : 'You can still start without knowing the storage size.'}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {(vi
                ? [
                    ['01', 'Nói nhu cầu', 'Chọn mục đích lưu trữ và lượng hàng ước tính.'],
                    ['02', 'NupsBox xác nhận', 'Đội ngũ đối chiếu loại kho và mức giá hiện hành.'],
                    ['03', 'Chọn bước tiếp theo', 'Nhận tư vấn hoặc đề xuất lịch xem kho.']
                  ]
                : [
                    ['01', 'Share your need', 'Choose the purpose and rough storage volume.'],
                    ['02', 'NupsBox confirms', 'The team checks a suitable unit and current pricing.'],
                    ['03', 'Choose the next step', 'Get advice or request a facility viewing.']
                  ]
              ).map(([index, title, text]) => (
                <div key={index} className="border-t border-[var(--nupsbox-border)] pt-3">
                  <p className="text-[0.65rem] font-black tracking-[0.12em] text-[var(--nupsbox-blue)]">{index}</p>
                  <p className="mt-1 text-sm font-black text-[var(--nupsbox-navy)]">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--nupsbox-slate)]">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <ConversionCta locale={locale} intent="quote" placement="unit-compare-empty" size="md">
                {vi ? 'Gửi nhu cầu để được tư vấn' : 'Send requirements for advice'}
              </ConversionCta>
              <ConversionCta
                locale={locale}
                intent="viewing"
                placement="unit-compare-empty"
                variant="secondary"
                size="md"
              >
                {vi ? 'Đề xuất lịch xem kho' : 'Request a viewing'}
              </ConversionCta>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function toggle(unitId: string) {
    setSelectedIds((current) => toggleComparedUnit(current, unitId));
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm leading-6 text-[var(--nupsbox-slate)]">
          {vi ? 'Chọn tối đa 3 loại kho để so sánh nhanh các thông tin đang có.' : 'Select up to 3 unit types to compare the information currently available.'}
        </p>
        <p className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-[var(--nupsbox-navy)] shadow-[var(--nupsbox-shadow-sm)]" aria-live="polite">
          {selectedIds.length}/3 {vi ? 'đã chọn' : 'selected'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {units.map((unit) => (
          <UnitCard
            key={unit.id}
            unit={unit}
            locale={locale}
            compareSelected={selectedIds.includes(unit.id)}
            compareDisabled={selectedIds.length >= 3}
            onCompareToggle={() => toggle(unit.id)}
          />
        ))}
      </div>

      {selectedUnits.length >= 2 ? (
        <section
          className="mt-8 overflow-hidden rounded-3xl border border-[var(--nupsbox-border)] bg-white shadow-[var(--nupsbox-shadow-sm)]"
          aria-labelledby="unit-compare-title"
        >
          <div className="border-b border-[var(--nupsbox-border)] px-5 py-4 sm:px-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--nupsbox-blue)]">
              {vi ? 'SO SÁNH NHANH' : 'QUICK COMPARE'}
            </p>
            <h2 id="unit-compare-title" className="mt-2 text-2xl font-extrabold tracking-[-0.03em] text-[var(--nupsbox-navy)]">
              {vi ? 'Đặt các lựa chọn cạnh nhau' : 'Put your options side by side'}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <div className="grid min-w-[620px]" style={{gridTemplateColumns: `180px repeat(${selectedUnits.length}, minmax(180px, 1fr))`}}>
              <div className="border-b border-r border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] p-4 text-sm font-bold text-[var(--nupsbox-slate)]">{vi ? 'Tiêu chí' : 'Criteria'}</div>
              {selectedUnits.map((unit) => <div key={unit.id} className="border-b border-r border-[var(--nupsbox-border)] p-4 text-base font-extrabold text-[var(--nupsbox-navy)] last:border-r-0">{unit.name}</div>)}

              <div className="border-b border-r border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] p-4 text-sm font-bold text-[var(--nupsbox-slate)]">{vi ? 'Diện tích' : 'Area'}</div>
              {selectedUnits.map((unit) => <div key={`${unit.id}-area`} className="border-b border-r border-[var(--nupsbox-border)] p-4 text-sm text-[var(--nupsbox-navy)] last:border-r-0">{unit.areaM2.toFixed(2)} m²</div>)}

              <div className="border-b border-r border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] p-4 text-sm font-bold text-[var(--nupsbox-slate)]">{vi ? 'Phù hợp với' : 'Good for'}</div>
              {selectedUnits.map((unit) => <div key={`${unit.id}-fit`} className="border-b border-r border-[var(--nupsbox-border)] p-4 text-sm leading-6 text-[var(--nupsbox-slate)] last:border-r-0">{unit.recommendedFor}</div>)}

              <div className="border-b border-r border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] p-4 text-sm font-bold text-[var(--nupsbox-slate)]">{vi ? 'Giá tháng' : 'Monthly price'}</div>
              {selectedUnits.map((unit) => <div key={`${unit.id}-price`} className="border-b border-r border-[var(--nupsbox-border)] p-4 text-sm font-bold text-[var(--nupsbox-navy)] last:border-r-0">{formatMonthlyPrice(unit.promoPrice ?? unit.monthlyPrice, locale) ?? (vi ? 'Liên hệ báo giá' : 'Contact for pricing')}</div>)}

              <div className="border-r border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] p-4 text-sm font-bold text-[var(--nupsbox-slate)]">{vi ? 'Tình trạng' : 'Status'}</div>
              {selectedUnits.map((unit) => <div key={`${unit.id}-status`} className="border-r border-[var(--nupsbox-border)] p-4 text-sm text-[var(--nupsbox-navy)] last:border-r-0">{availabilityLabel(unit.availabilityStatus, locale)}</div>)}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
