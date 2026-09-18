import {updateMediaMetadata} from '@/app/admin/content/media/actions';
import {
  AdminFieldGroup,
  AdminPanel,
  AdminStatusBadge
} from '@/components/admin/admin-primitives';
import type {AdminMedia} from '@/features/admin/media';

type Option = {id: string; label: string};
type Props = {
  media: AdminMedia;
  canEdit: boolean;
  locationOptions: Option[];
  unitOptions: Option[];
};

const inputClass =
  'mt-1 min-h-11 w-full rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 py-2 text-sm disabled:bg-slate-50';

export function MediaMetadataForm({
  media,
  canEdit,
  locationOptions,
  unitOptions
}: Props) {
  return (
    <AdminPanel
      title={media.storagePath}
      description="Chỉ chỉnh metadata; không upload, thay thế hay xóa file."
      actions={
        <AdminStatusBadge
          label={media.isPublic ? 'Công khai' : 'Nội bộ'}
          tone={media.isPublic ? 'success' : 'neutral'}
        />
      }
    >
      <form action={updateMediaMetadata} className="grid gap-6">
        <input type="hidden" name="id" value={media.id} />

        <AdminFieldGroup legend="Alt text song ngữ" disabled={!canEdit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Alt VI
              <input className={inputClass} name="altVi" required defaultValue={media.altVi} />
            </label>
            <label className="text-sm font-semibold">
              Alt EN
              <input className={inputClass} name="altEn" required defaultValue={media.altEn} />
            </label>
          </div>
        </AdminFieldGroup>

        <AdminFieldGroup legend="Phân loại & liên kết" disabled={!canEdit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Category
              <select className={inputClass} name="category" defaultValue={media.category}>
                {['hero', 'location', 'unit', 'security', 'exterior', 'lifestyle', 'blog'].map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Thứ tự
              <input className={inputClass} name="sortOrder" type="number" defaultValue={media.sortOrder} />
            </label>
            <label className="text-sm font-semibold">
              Hiển thị công khai
              <select className={inputClass} name="isPublic" defaultValue={media.isPublic ? 'true' : 'false'}>
                <option value="true">Có</option>
                <option value="false">Không</option>
              </select>
            </label>
            <label className="text-sm font-semibold">
              Địa điểm liên kết
              <select className={inputClass} name="locationId" defaultValue={media.locationId ?? ''}>
                <option value="">Không liên kết</option>
                {locationOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Loại kho liên kết
              <select className={inputClass} name="unitTypeId" defaultValue={media.unitTypeId ?? ''}>
                <option value="">Không liên kết</option>
                {unitOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>
        </AdminFieldGroup>

        {canEdit ? (
          <button className="min-h-11 w-fit rounded-xl bg-[var(--nupsbox-blue)] px-5 text-sm font-black text-white">
            Lưu metadata
          </button>
        ) : (
          <p className="text-sm text-[var(--nupsbox-slate)]">Tài khoản hiện tại chỉ có quyền xem.</p>
        )}
      </form>
    </AdminPanel>
  );
}
