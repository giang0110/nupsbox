import type {AdminMedia} from '@/features/admin/media';
import {updateMediaMetadata} from '@/app/admin/content/media/actions';

type Option = {id: string; label: string};
type Props = {
  media: AdminMedia;
  canEdit: boolean;
  locationOptions: Option[];
  unitOptions: Option[];
};

const inputClass =
  'mt-1 w-full rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 py-2 text-sm disabled:bg-slate-50';

export function MediaMetadataForm({media, canEdit, locationOptions, unitOptions}: Props) {
  return (
    <article className="rounded-3xl border border-[var(--nupsbox-border)] bg-white p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-black tracking-[0.14em] text-[var(--nupsbox-blue)]">MEDIA METADATA</p>
        <h2 className="mt-1 break-all text-base font-black text-[var(--nupsbox-navy)]">{media.storagePath}</h2>
        <p className="mt-1 text-xs text-[var(--nupsbox-slate)]">P2.2 chỉ chỉnh metadata; không upload, thay thế hay xóa file.</p>
      </div>

      <form action={updateMediaMetadata} className="space-y-4">
        <input type="hidden" name="id" value={media.id} />
        <fieldset disabled={!canEdit} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold">
            Alt VI
            <input className={inputClass} name="altVi" required defaultValue={media.altVi} />
          </label>
          <label className="text-sm font-semibold">
            Alt EN
            <input className={inputClass} name="altEn" required defaultValue={media.altEn} />
          </label>
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
              {locationOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Loại kho liên kết
            <select className={inputClass} name="unitTypeId" defaultValue={media.unitTypeId ?? ''}>
              <option value="">Không liên kết</option>
              {unitOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
          </label>
        </fieldset>
        {canEdit ? (
          <button className="rounded-full bg-[var(--nupsbox-blue)] px-5 py-2.5 text-sm font-black text-white">Lưu metadata</button>
        ) : (
          <p className="text-sm text-[var(--nupsbox-slate)]">Tài khoản hiện tại chỉ có quyền xem.</p>
        )}
      </form>
    </article>
  );
}
