import type {AdminLocation} from '@/features/admin/locations';
import type {AdminPricing} from '@/features/admin/pricing';
import type {AdminUnitType} from '@/features/admin/unit-types';
import {createPricing, updatePricing} from '@/app/admin/catalog/pricing/actions';

type Props = {
  pricing?: AdminPricing;
  locations: AdminLocation[];
  units: AdminUnitType[];
  canMutate: boolean;
};

const inputClass = 'mt-1 w-full rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 py-2 text-sm disabled:bg-slate-50';

export function PricingForm({pricing, locations, units, canMutate}: Props) {
  const editing = Boolean(pricing);
  return (
    <article className="rounded-3xl border border-[var(--nupsbox-border)] bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black text-[var(--nupsbox-navy)]">{editing ? 'Cập nhật bảng giá' : 'Thêm cấu hình giá'}</h2>
      <form action={editing ? updatePricing : createPricing} className="mt-4 space-y-4">
        {pricing ? <input type="hidden" name="id" value={pricing.id} /> : null}
        <fieldset disabled={!canMutate} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold">Địa điểm<select className={inputClass} name="locationId" required defaultValue={pricing?.locationId ?? ''}><option value="" disabled>Chọn địa điểm</option>{locations.map((item) => <option key={item.id} value={item.id}>{item.nameVi}</option>)}</select></label>
          <label className="text-sm font-semibold">Loại kho<select className={inputClass} name="unitTypeId" required defaultValue={pricing?.unitTypeId ?? ''}><option value="" disabled>Chọn loại kho</option>{units.map((item) => <option key={item.id} value={item.id}>{item.nameVi} ({item.areaM2} m²)</option>)}</select></label>
          <label className="text-sm font-semibold">Giá tháng đã xác minh<input className={inputClass} name="monthlyPrice" type="number" min="0" step="1" defaultValue={pricing?.monthlyPrice ?? ''} placeholder="Để trống = Liên hệ" /></label>
          <label className="text-sm font-semibold">Giá ưu đãi đã xác minh<input className={inputClass} name="promoPrice" type="number" min="0" step="1" defaultValue={pricing?.promoPrice ?? ''} /></label>
          <label className="text-sm font-semibold">Tiền cọc<input className={inputClass} name="depositAmount" type="number" min="0" step="1" defaultValue={pricing?.depositAmount ?? ''} /></label>
          <label className="text-sm font-semibold">Trạng thái tư vấn<select className={inputClass} name="availabilityStatus" defaultValue={pricing?.availabilityStatus ?? 'contact'}><option value="contact">Liên hệ xác nhận</option><option value="available">Có thể tư vấn</option><option value="limited">Giới hạn</option><option value="sold_out">Tạm hết</option></select></label>
          <label className="text-sm font-semibold">Số lượng vận hành nội bộ<input className={inputClass} name="availableCount" type="number" min="0" step="1" defaultValue={pricing?.availableCount ?? ''} /><span className="mt-1 block text-xs font-normal text-[var(--nupsbox-slate)]">Không phải số tồn kho realtime và không được dùng như cam kết chỗ trống công khai.</span></label>
          <label className="flex items-center gap-2 self-end text-sm font-semibold"><input name="featured" type="checkbox" defaultChecked={pricing?.featured ?? false} />Nổi bật</label>
        </fieldset>
        {canMutate ? <button className="rounded-full bg-[var(--nupsbox-blue)] px-5 py-2.5 text-sm font-black text-white">{editing ? 'Lưu bảng giá' : 'Tạo cấu hình'}</button> : <p className="text-sm text-[var(--nupsbox-slate)]">Tài khoản hiện tại chỉ có quyền xem.</p>}
      </form>
    </article>
  );
}
