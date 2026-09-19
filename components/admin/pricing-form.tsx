'use client';

import {createPricing, updatePricing} from '@/app/admin/catalog/pricing/actions';
import {
  AdminFieldGroup,
  AdminPanel
} from '@/components/admin/admin-primitives';
import type {AdminLocation} from '@/features/admin/locations';
import type {AdminPricing} from '@/features/admin/pricing';
import type {AdminUnitType} from '@/features/admin/unit-types';

type Props = {
  pricing?: AdminPricing;
  locations: AdminLocation[];
  units: AdminUnitType[];
  canMutate: boolean;
};

const inputClass =
  'mt-1 min-h-11 w-full rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 py-2 text-sm disabled:bg-slate-50';

export function PricingForm({pricing, locations, units, canMutate}: Props) {
  const editing = Boolean(pricing);

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
        {pricing ? <input type="hidden" name="id" value={pricing.id} /> : null}

        <AdminFieldGroup legend="Phạm vi áp dụng" disabled={!canMutate}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Địa điểm
              <select className={inputClass} name="locationId" required defaultValue={pricing?.locationId ?? ''}>
                <option value="" disabled>Chọn địa điểm</option>
                {locations.map((item) => <option key={item.id} value={item.id}>{item.nameVi}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Loại kho
              <select className={inputClass} name="unitTypeId" required defaultValue={pricing?.unitTypeId ?? ''}>
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
              <input className={inputClass} name="monthlyPrice" type="number" min="0" step="1" defaultValue={pricing?.monthlyPrice ?? ''} placeholder="Để trống = Liên hệ" />
            </label>
            <label className="text-sm font-semibold">
              Giá ưu đãi đã xác minh
              <input className={inputClass} name="promoPrice" type="number" min="0" step="1" defaultValue={pricing?.promoPrice ?? ''} />
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
              <select className={inputClass} name="availabilityStatus" defaultValue={pricing?.availabilityStatus ?? 'contact'}>
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

        {canMutate ? (
          <button className="min-h-11 w-fit rounded-xl bg-[var(--nupsbox-blue)] px-5 text-sm font-black text-white">
            {editing ? 'Lưu bảng giá' : 'Tạo cấu hình'}
          </button>
        ) : (
          <p className="text-sm text-[var(--nupsbox-slate)]">Tài khoản hiện tại chỉ có quyền xem.</p>
        )}
      </form>
    </AdminPanel>
  );
}
