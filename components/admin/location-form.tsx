import Link from 'next/link';
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
import {AdminMutationForm} from '@/components/admin/admin-mutation-form';
import {AdminSubmitButton} from '@/components/admin/admin-submit-button';
import type {AdminLocation} from '@/features/admin/locations';
import type {LocationLaunchReadiness} from '@/features/admin/location-launch';
import {LocationPreview} from '@/components/admin/location-preview';

type Props = {
  location?: AdminLocation;
  canMutate: boolean;
  canPublish: boolean;
  launch?: LocationLaunchReadiness;
};

const inputClass =
  'mt-1 min-h-11 w-full rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 py-2 text-sm text-[var(--nupsbox-navy)] disabled:bg-slate-50 disabled:text-slate-500';

export function LocationForm({location, canMutate, canPublish, launch}: Props) {
  const editing = Boolean(location);
  const slugLocked = Boolean(location?.publishedAt);

  const panelActions = (
    <AdminActionBar>
      <AdminStatusBadge
        label={location?.status === 'active' ? 'Đang hoạt động' : editing ? 'Bản nháp' : 'Mới'}
        tone={location?.status === 'active' ? 'success' : 'neutral'}
      />
      {location?.status === 'active' ? (
        <>
          <Link
            href={'/admin/content/media?location=' + location.id}
            className="inline-flex min-h-11 items-center rounded-xl bg-[var(--nupsbox-navy)] px-4 text-sm font-bold text-white"
          >
            Quản lý ảnh
          </Link>
          <Link
            href={'/admin/catalog/pricing?location=' + location.id}
            className="inline-flex min-h-11 items-center rounded-xl border border-[var(--nupsbox-border)] px-4 text-sm font-bold text-[var(--nupsbox-navy)]"
          >
            Cấu hình giá
          </Link>
          <Link
            href={'/dia-diem/' + location.slug}
            target="_blank"
            className="inline-flex min-h-11 items-center rounded-xl border border-[var(--nupsbox-border)] px-4 text-sm font-bold text-[var(--nupsbox-blue)]"
          >
            Preview public ↗
          </Link>
        </>
      ) : null}
      {location && canPublish ? (
        <AdminMutationForm
          recoverableAction={setLocationPublication}
          expectedUpdatedAt={location.updatedAt}
        >
          <input type="hidden" name="id" value={location.id} />
          <input
            type="hidden"
            name="publish"
            value={location.status === 'active' ? 'false' : 'true'}
          />
          {location.status !== 'active' ? <input type="hidden" name="next" value="media" /> : null}
          <AdminSubmitButton
            idleLabel={location.status === 'active' ? 'Ngừng xuất bản' : 'Xuất bản & quản lý ảnh'}
            pendingLabel={location.status === 'active' ? 'Đang ngừng…' : 'Đang xuất bản…'}
            className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] px-4 text-sm font-bold text-[var(--nupsbox-navy)] disabled:cursor-wait disabled:opacity-60"
          />
        </AdminMutationForm>
      ) : null}
    </AdminActionBar>
  );

  return (
    <AdminPanel
      title={editing ? location?.nameVi : 'Thêm địa điểm'}
      description={location?.publishedAt ? 'Đã từng xuất bản — slug được khóa vĩnh viễn trong Phase 2.' : undefined}
      actions={panelActions}
    >
      {location ? (
        <div className="mb-6 grid gap-5">
          <div>
            <p className="mb-3 text-sm font-black text-[var(--nupsbox-navy)]">Preview nội dung public</p>
            <LocationPreview location={location} />
          </div>
          {launch ? (
            <div className="rounded-xl border border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-[var(--nupsbox-navy)]">Location readiness</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--nupsbox-slate)]">
                    Các mục dưới đây tăng chất lượng public nhưng không tự động chặn publish.
                  </p>
                </div>
                <AdminStatusBadge
                  label={launch.qualityScore + '% quality'}
                  tone={launch.qualityScore >= 80 ? 'success' : launch.qualityScore >= 40 ? 'warning' : 'neutral'}
                />
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                {launch.checks.map(check => (
                  <div key={check.id} className="rounded-lg bg-white px-3 py-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--nupsbox-navy)]">
                      <span aria-hidden="true" className={check.ready ? 'text-emerald-700' : 'text-amber-700'}>
                        {check.ready ? '✓' : '○'}
                      </span>
                      {check.label}
                    </div>
                    <p className="mt-1 text-[0.7rem] leading-4 text-[var(--nupsbox-slate)]">{check.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <AdminMutationForm
        action={!editing ? createLocation : undefined}
        recoverableAction={editing ? updateLocation : undefined}
        expectedUpdatedAt={location?.updatedAt}
        className="grid gap-6"
      >
        {location ? (
          <>
            <input type="hidden" name="id" value={location.id} />
          </>
        ) : null}
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
          <AdminSubmitButton
            idleLabel={editing ? 'Lưu thay đổi' : 'Tạo bản nháp'}
            pendingLabel={editing ? 'Đang lưu…' : 'Đang tạo…'}
            className="min-h-11 w-fit rounded-xl bg-[var(--nupsbox-blue)] px-5 text-sm font-black text-white disabled:cursor-wait disabled:opacity-60"
          />
        ) : (
          <p className="text-sm text-[var(--nupsbox-slate)]">Tài khoản hiện tại chỉ có quyền xem.</p>
        )}
      </AdminMutationForm>
    </AdminPanel>
  );
}
