import type {AdminLocation} from '@/features/admin/locations';
import {
  createLocation,
  setLocationPublication,
  updateLocation
} from '@/app/admin/catalog/locations/actions';

type Props = {
  location?: AdminLocation;
  canMutate: boolean;
  canPublish: boolean;
};

const inputClass =
  'mt-1 w-full rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 py-2 text-sm text-[var(--nupsbox-navy)] disabled:bg-slate-50 disabled:text-slate-500';

export function LocationForm({location, canMutate, canPublish}: Props) {
  const editing = Boolean(location);
  const slugLocked = Boolean(location?.publishedAt);
  const action = editing ? updateLocation : createLocation;

  return (
    <article className="rounded-3xl border border-[var(--nupsbox-border)] bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black tracking-[0.14em] text-[var(--nupsbox-blue)]">
            {editing ? location?.status.toUpperCase() : 'NEW'}
          </p>
          <h2 className="mt-1 text-xl font-black text-[var(--nupsbox-navy)]">
            {editing ? location?.nameVi : 'Thêm địa điểm'}
          </h2>
          {location?.publishedAt ? (
            <p className="mt-1 text-xs text-[var(--nupsbox-slate)]">
              Đã từng xuất bản — slug được khóa vĩnh viễn trong Phase 2.
            </p>
          ) : null}
        </div>
        {location && canPublish ? (
          <form action={setLocationPublication}>
            <input type="hidden" name="id" value={location.id} />
            <input type="hidden" name="publish" value={location.status === 'active' ? 'false' : 'true'} />
            <button
              type="submit"
              className="rounded-full border border-[var(--nupsbox-blue)] px-4 py-2 text-sm font-bold text-[var(--nupsbox-blue)]"
            >
              {location.status === 'active' ? 'Ngừng xuất bản' : 'Xuất bản'}
            </button>
          </form>
        ) : null}
      </div>

      <form action={action} className="space-y-4">
        {location ? <input type="hidden" name="id" value={location.id} /> : null}
        {slugLocked && location ? <input type="hidden" name="slug" value={location.slug} /> : null}
        <fieldset disabled={!canMutate} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold">
            Slug
            <input
              className={inputClass}
              name="slug"
              required
              disabled={!canMutate || slugLocked}
              defaultValue={location?.slug ?? ''}
              placeholder="tan-phu"
            />
          </label>
          <label className="text-sm font-semibold">
            Quận / huyện
            <input className={inputClass} name="district" required defaultValue={location?.district ?? ''} />
          </label>
          <label className="text-sm font-semibold">
            Tên VI
            <input className={inputClass} name="nameVi" required defaultValue={location?.nameVi ?? ''} />
          </label>
          <label className="text-sm font-semibold">
            Tên EN
            <input className={inputClass} name="nameEn" required defaultValue={location?.nameEn ?? ''} />
          </label>
          <label className="text-sm font-semibold md:col-span-2">
            Địa chỉ VI
            <input className={inputClass} name="addressVi" required defaultValue={location?.addressVi ?? ''} />
          </label>
          <label className="text-sm font-semibold md:col-span-2">
            Địa chỉ EN
            <input className={inputClass} name="addressEn" required defaultValue={location?.addressEn ?? ''} />
          </label>
          <label className="text-sm font-semibold">
            Thành phố
            <input
              className={inputClass}
              name="city"
              required
              defaultValue={location?.city ?? 'Ho Chi Minh City'}
            />
          </label>
          <label className="text-sm font-semibold">
            Thứ tự
            <input className={inputClass} name="sortOrder" type="number" defaultValue={location?.sortOrder ?? 0} />
          </label>
          <label className="text-sm font-semibold">
            Latitude
            <input className={inputClass} name="latitude" type="number" step="any" defaultValue={location?.latitude ?? ''} />
          </label>
          <label className="text-sm font-semibold">
            Longitude
            <input className={inputClass} name="longitude" type="number" step="any" defaultValue={location?.longitude ?? ''} />
          </label>
          <label className="text-sm font-semibold">
            Điện thoại
            <input className={inputClass} name="phone" defaultValue={location?.phone ?? ''} />
          </label>
          <label className="text-sm font-semibold">
            Zalo URL
            <input className={inputClass} name="zaloUrl" type="url" defaultValue={location?.zaloUrl ?? ''} />
          </label>
          <label className="text-sm font-semibold md:col-span-2">
            Giờ mở cửa (JSON)
            <textarea
              className={`${inputClass} min-h-24 font-mono`}
              name="openingHours"
              defaultValue={JSON.stringify(location?.openingHours ?? {}, null, 2)}
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold md:col-span-2">
            <input name="isFeatured" type="checkbox" defaultChecked={location?.isFeatured ?? false} />
            Địa điểm nổi bật
          </label>
        </fieldset>
        {canMutate ? (
          <button
            type="submit"
            className="rounded-full bg-[var(--nupsbox-blue)] px-5 py-2.5 text-sm font-black text-white"
          >
            {editing ? 'Lưu thay đổi' : 'Tạo bản nháp'}
          </button>
        ) : (
          <p className="text-sm text-[var(--nupsbox-slate)]">Tài khoản hiện tại chỉ có quyền xem.</p>
        )}
      </form>
    </article>
  );
}
