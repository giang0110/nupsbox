import {
  createLocation,
  setLocationPublication,
  updateLocation
} from '@/app/admin/catalog/locations/actions';
import {
  AdminActionBar,
  AdminFieldGroup,
  AdminPanel,
  AdminStatusBadge
} from '@/components/admin/admin-primitives';
import {JsonTextarea} from '@/components/admin/json-textarea';
import type {AdminLocation} from '@/features/admin/locations';

type Props = {
  location?: AdminLocation;
  canMutate: boolean;
  canPublish: boolean;
};

const inputClass =
  'mt-1 min-h-11 w-full rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 py-2 text-sm text-[var(--nupsbox-navy)] disabled:bg-slate-50 disabled:text-slate-500';

export function LocationForm({location, canMutate, canPublish}: Props) {
  const editing = Boolean(location);
  const slugLocked = Boolean(location?.publishedAt);
  const action = editing ? updateLocation : createLocation;

  const panelActions = (
    <AdminActionBar>
      <AdminStatusBadge
        label={location?.status === 'active' ? 'Đang hoạt động' : editing ? 'Bản nháp' : 'Mới'}
        tone={location?.status === 'active' ? 'success' : 'neutral'}
      />
      {location && canPublish ? (
        <form action={setLocationPublication}>
          <input type="hidden" name="id" value={location.id} />
          <input
            type="hidden"
            name="publish"
            value={location.status === 'active' ? 'false' : 'true'}
          />
          <button
            type="submit"
            className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] px-4 text-sm font-bold text-[var(--nupsbox-navy)]"
          >
            {location.status === 'active' ? 'Ngừng xuất bản' : 'Xuất bản'}
          </button>
        </form>
      ) : null}
    </AdminActionBar>
  );

  return (
    <AdminPanel
      title={editing ? location?.nameVi : 'Thêm địa điểm'}
      description={location?.publishedAt ? 'Đã từng xuất bản — slug được khóa vĩnh viễn trong Phase 2.' : undefined}
      actions={panelActions}
    >
      <form action={action} className="grid gap-6">
        {location ? <input type="hidden" name="id" value={location.id} /> : null}
        {slugLocked && location ? <input type="hidden" name="slug" value={location.slug} /> : null}

        <AdminFieldGroup legend="Thông tin chính" disabled={!canMutate}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Slug
              <input
                className={inputClass}
                name="slug"
                required
                disabled={!canMutate || slugLocked}
                defaultValue={location?.slug ?? ''}
                placeholder="tan-phu"
                autoCapitalize="none"
                spellCheck={false}
              />
              {!slugLocked ? (
                <span className="mt-1 block text-xs font-normal leading-5 text-[var(--nupsbox-slate)]">
                  Có thể nhập “NupsBox Tân Phú”; hệ thống sẽ tự chuẩn hoá thành “nupsbox-tan-phu”.
                </span>
              ) : null}
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
              <input className={inputClass} name="city" required defaultValue={location?.city ?? 'Ho Chi Minh City'} />
            </label>
          </div>
        </AdminFieldGroup>

        <AdminFieldGroup legend="Vị trí & liên hệ" disabled={!canMutate}>
          <div className="grid gap-4 md:grid-cols-2">
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
          </div>
        </AdminFieldGroup>

        <AdminFieldGroup legend="Hiển thị & vận hành" disabled={!canMutate}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold md:col-span-2">
              Giờ mở cửa (JSON)
              <JsonTextarea
                className={inputClass + ' min-h-24 font-mono'}
                name="openingHours"
                rows={6}
                label="Giờ mở cửa"
                defaultValue={JSON.stringify(location?.openingHours ?? {}, null, 2)}
              />
            </label>
            <label className="text-sm font-semibold">
              Thứ tự
              <input className={inputClass} name="sortOrder" type="number" defaultValue={location?.sortOrder ?? 0} />
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
              <input name="isFeatured" type="checkbox" defaultChecked={location?.isFeatured ?? false} />
              Địa điểm nổi bật
            </label>
          </div>
        </AdminFieldGroup>

        {canMutate ? (
          <button
            type="submit"
            className="min-h-11 w-fit rounded-xl bg-[var(--nupsbox-blue)] px-5 text-sm font-black text-white"
          >
            {editing ? 'Lưu thay đổi' : 'Tạo bản nháp'}
          </button>
        ) : (
          <p className="text-sm text-[var(--nupsbox-slate)]">Tài khoản hiện tại chỉ có quyền xem.</p>
        )}
      </form>
    </AdminPanel>
  );
}
