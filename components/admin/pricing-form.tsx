'use client';

import {useMemo, useState} from 'react';
import {createPricing, updatePricing} from '@/app/admin/catalog/pricing/actions';
import {
  AdminFieldGroup,
  AdminPanel
} from '@/components/admin/admin-primitives';
import type {AdminLocation} from '@/features/admin/locations';
import type {AdminPricing} from '@/features/admin/pricing';
import type {AdminUnitType} from '@/features/admin/unit-types';
import {AdminSubmitButton} from '@/components/admin/admin-submit-button';

type Props = {
  pricing?: AdminPricing;
  locations: AdminLocation[];
  units: AdminUnitType[];
  canMutate: boolean;
  defaultLocationId?: string;
  defaultUnitTypeId?: string;
  existingPairKeys?: string[];
};

const inputClass =
  'mt-1 min-h-11 w-full rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 py-2 text-sm disabled:bg-slate-50';

export function PricingForm({
  pricing,
  locations,
  units,
  canMutate,
  defaultLocationId,
  defaultUnitTypeId,
  existingPairKeys = []
}: Props) {
  const editing = Boolean(pricing);
  const initialLocationId = pricing?.locationId ?? defaultLocationId ?? '';
  const initialUnitTypeId = pricing?.unitTypeId ?? defaultUnitTypeId ?? '';
  const [locationId, setLocationId] = useState(initialLocationId);
  const [unitTypeId, setUnitTypeId] = useState(initialUnitTypeId);
  const [monthlyPrice, setMonthlyPrice] = useState(pricing?.monthlyPrice?.toString() ?? '');
  const [promoPrice, setPromoPrice] = useState(pricing?.promoPrice?.toString() ?? '');
  const [availabilityStatus, setAvailabilityStatus] = useState(pricing?.availabilityStatus ?? 'contact');

  const selectedLocation = locations.find(item => item.id === locationId);
  const selectedUnit = units.find(item => item.id === unitTypeId);
  const pairKey = locationId && unitTypeId ? locationId + ':' + unitTypeId : '';
  const originalPairKey = pricing ? pricing.locationId + ':' + pricing.unitTypeId : '';
  const duplicatePair = Boolean(pairKey && pairKey !== originalPairKey && existingPairKeys.includes(pairKey));
  const displayedPrice = promoPrice.trim() || monthlyPrice.trim();
  const formattedPrice = useMemo(() => {
    if (!displayedPrice) return 'Liên hệ báo giá';
    const value = Number(displayedPrice);
    if (!Number.isFinite(value)) return 'Liên hệ báo giá';
    return new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND', maximumFractionDigits: 0}).format(value);
  }, [displayedPrice]);

  const availabilityLabel = availabilityStatus === 'available'
    ? 'Có thể trao đổi ngay'
    : availabilityStatus === 'limited'
      ? 'Số lượng hạn chế'
      : availabilityStatus === 'sold_out'
        ? 'Hiện chưa có chỗ'
        : 'Liên hệ xác nhận';

  return (
    <AdminPanel title={editing ? 'Cập nhật bảng giá' : 'Thêm cấu hình giá'}>
      <form
        action={editing ? updatePricing : createPricing}
        className="grid gap-6"
        onSubmit={(event) => {
          const form = event.currentTarget;
          const monthly = form.elements.namedItem('monthlyPrice') as HTMLInputElement | null;
          const promo = form.elements.namedItem('promoPrice') as HTMLInputElement | null;
          const monthlyValue = monthly?.value.trim() ? Number(monthly.value) : null;
          const promoValue = promo?.value.trim() ? Number(promo.value) : null;

          promo?.setCustomValidity('');
          if (monthlyValue !== null && promoValue !== null && promoValue > monthlyValue) {
            promo?.setCustomValidity('Giá ưu đãi không được lớn hơn giá tháng.');
            event.preventDefault();
            promo?.reportValidity();
          }
        }}
      >
        {pricing ? (
          <>
            <input type="hidden" name="id" value={pricing.id} />
            <input type="hidden" name="expectedUpdatedAt" value={pricing.updatedAt} />
          </>
        ) : null}

        <AdminFieldGroup legend="Phạm vi áp dụng" disabled={!canMutate}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Địa điểm
              <select className={inputClass} name="locationId" required value={locationId} onChange={event => setLocationId(event.target.value)}>
                <option value="" disabled>Chọn địa điểm</option>
                {locations.map((item) => <option key={item.id} value={item.id}>{item.nameVi}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Loại kho
              <select className={inputClass} name="unitTypeId" required value={unitTypeId} onChange={event => setUnitTypeId(event.target.value)}>
                <option value="" disabled>Chọn loại kho</option>
                {units.map((item) => <option key={item.id} value={item.id}>{item.nameVi} ({item.areaM2} m²)</option>)}
              </select>
            </label>
          </div>
        </AdminFieldGroup>

        <AdminFieldGroup legend="Giá" disabled={!canMutate}>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="text-sm font-semibold">
              Giá tháng đã xác minh
              <input className={inputClass} name="monthlyPrice" type="number" min="0" step="1" value={monthlyPrice} onChange={event => setMonthlyPrice(event.target.value)} placeholder="Để trống = Liên hệ" />
            </label>
            <label className="text-sm font-semibold">
              Giá ưu đãi đã xác minh
              <input className={inputClass} name="promoPrice" type="number" min="0" step="1" value={promoPrice} onChange={event => setPromoPrice(event.target.value)} />
            </label>
            <label className="text-sm font-semibold">
              Tiền cọc
              <input className={inputClass} name="depositAmount" type="number" min="0" step="1" defaultValue={pricing?.depositAmount ?? ''} />
            </label>
          </div>
        </AdminFieldGroup>

        <AdminFieldGroup legend="Hiển thị & vận hành" disabled={!canMutate}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Trạng thái tư vấn
              <select className={inputClass} name="availabilityStatus" value={availabilityStatus} onChange={event => setAvailabilityStatus(event.target.value as 'available' | 'limited' | 'sold_out' | 'contact')}>
                <option value="contact">Liên hệ xác nhận</option>
                <option value="available">Có thể tư vấn</option>
                <option value="limited">Giới hạn</option>
                <option value="sold_out">Tạm hết</option>
              </select>
            </label>
            <label className="text-sm font-semibold">
              Số lượng vận hành nội bộ
              <input className={inputClass} name="availableCount" type="number" min="0" step="1" defaultValue={pricing?.availableCount ?? ''} />
              <span className="mt-1 block text-xs font-normal text-[var(--nupsbox-slate)]">
                Không phải số tồn kho realtime và không được dùng như cam kết chỗ trống công khai.
              </span>
            </label>
            <label className="flex min-h-11 items-center gap-2 self-end text-sm font-semibold">
              <input name="featured" type="checkbox" defaultChecked={pricing?.featured ?? false} />
              Nổi bật
            </label>
          </div>
        </AdminFieldGroup>

        <div className="rounded-2xl border border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] p-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--nupsbox-blue)]">Preview public</p>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-[var(--nupsbox-slate)]">{selectedLocation?.nameVi ?? 'Chọn địa điểm'}</p>
              <p className="mt-1 text-xl font-extrabold tracking-[-0.03em] text-[var(--nupsbox-navy)]">
                {selectedUnit ? selectedUnit.nameVi + ' · ' + selectedUnit.areaM2.toLocaleString('vi-VN') + ' m²' : 'Chọn loại kho'}
              </p>
              <p className="mt-2 text-sm text-[var(--nupsbox-slate)]">{availabilityLabel}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--nupsbox-muted)]">Giá thuê tháng</p>
              <p className="mt-1 text-xl font-black text-[var(--nupsbox-navy)]">{formattedPrice}</p>
            </div>
          </div>
          {duplicatePair ? (
            <p role="alert" className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-800">
              Mapping địa điểm × loại kho này đã tồn tại. Hãy sửa mapping hiện có thay vì tạo bản trùng.
            </p>
          ) : null}
        </div>

        {canMutate ? (
          <div className="flex flex-wrap gap-2.5">
            <button disabled={duplicatePair} className="min-h-11 w-fit rounded-xl bg-[var(--nupsbox-blue)] px-5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-45">
              {editing ? 'Lưu bảng giá' : 'Tạo cấu hình'}
            </button>
            <button
              type="submit"
              name="next"
              value="preview"
              disabled={duplicatePair}
              className="min-h-11 w-fit rounded-xl border border-[var(--nupsbox-border)] bg-white px-5 text-sm font-black text-[var(--nupsbox-navy)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {editing ? 'Lưu & preview public' : 'Tạo & preview public'}
            </button>
          </div>
        ) : (
          <p className="text-sm text-[var(--nupsbox-slate)]">Tài khoản hiện tại chỉ có quyền xem.</p>
        )}
      </form>
    </AdminPanel>
  );
}
