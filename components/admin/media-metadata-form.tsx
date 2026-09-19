import Image from 'next/image';
import {updateMediaMetadata} from '@/app/admin/content/media/actions';
import {MediaDeleteForm} from '@/components/admin/media-delete-form';
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
  canDelete: boolean;
  locationOptions: Option[];
  unitOptions: Option[];
};

const inputClass =
  'mt-1 min-h-11 w-full rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 py-2 text-sm disabled:bg-slate-50';

export function MediaMetadataForm({
  media,
  canEdit,
  canDelete,
  locationOptions,
  unitOptions
}: Props) {
  return (
    <AdminPanel
      title={media.storagePath}
      description="Ảnh được lưu trong Supabase Storage; chỉnh metadata ở đây không thay file gốc."
      actions={
        <AdminStatusBadge
          label={media.isPublic ? 'Công khai' : 'Nội bộ'}
          tone={media.isPublic ? 'success' : 'neutral'}
        />
      }
    >
      {media.publicUrl ? (
        <div className="mb-6 overflow-hidden rounded-2xl border border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)]">
          <div className="relative aspect-[16/7] min-h-44">
            <Image
              src={media.publicUrl}
              alt={media.altVi || media.altEn || media.storagePath}
              fill
              sizes="(max-width: 1024px) 100vw, 900px"
              className="object-cover"
            />
          </div>
        </div>
      ) : null}

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

      {canDelete ? (
        <div className="mt-6 border-t border-red-100 pt-5">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.12em] text-red-700">Vùng nguy hiểm</p>
          <MediaDeleteForm
            mediaId={media.id}
            label={media.altVi || media.altEn || media.storagePath}
          />
        </div>
      ) : null}
    </AdminPanel>
  );
}
