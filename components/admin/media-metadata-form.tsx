import Image from 'next/image';
import {ChevronDown, MapPin, Pencil, Ruler} from 'lucide-react';
import {updateMediaMetadata} from '@/app/admin/content/media/actions';
import {MediaDeleteForm} from '@/components/admin/media-delete-form';
import {
  AdminFieldGroup,
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
  const locationLabel = locationOptions.find(option => option.id === media.locationId)?.label ?? null;
  const unitLabel = unitOptions.find(option => option.id === media.unitTypeId)?.label ?? null;

  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--nupsbox-border)] bg-white shadow-sm">
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--nupsbox-surface)]">
        {media.publicUrl ? (
          <Image
            src={media.publicUrl}
            alt={media.altVi || media.altEn || media.storagePath}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1536px) 50vw, 33vw"
            className="object-cover transition duration-500 hover:scale-[1.015]"
          />
        ) : (
          <div className="grid h-full place-items-center p-6 text-center text-sm text-[var(--nupsbox-slate)]">
            Không có preview
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <AdminStatusBadge
            label={media.isPublic ? 'Công khai' : 'Nội bộ'}
            tone={media.isPublic ? 'success' : 'neutral'}
          />
          <span className="inline-flex min-h-7 items-center rounded-full border border-white/40 bg-white/90 px-2.5 text-xs font-black text-[var(--nupsbox-navy)] backdrop-blur">
            {media.category}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 text-base font-black leading-6 text-[var(--nupsbox-navy)]">
          {media.altVi || media.altEn || media.storagePath}
        </h3>
        <p className="mt-1 truncate text-xs text-[var(--nupsbox-slate)]" title={media.storagePath}>
          {media.storagePath}
        </p>

        <div className="mt-3 grid gap-1.5 text-xs text-[var(--nupsbox-slate)]">
          <p className="flex min-w-0 items-center gap-2">
            <MapPin size={14} className="shrink-0" aria-hidden="true" />
            <span className="truncate">{locationLabel ?? 'Chưa gắn địa điểm'}</span>
          </p>
          <p className="flex min-w-0 items-center gap-2">
            <Ruler size={14} className="shrink-0" aria-hidden="true" />
            <span className="truncate">{unitLabel ?? 'Chưa gắn loại kho'}</span>
          </p>
        </div>

        <details className="group mt-4 border-t border-[var(--nupsbox-border)] pt-3">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-2 text-sm font-black text-[var(--nupsbox-blue)] transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nupsbox-blue)]">
            <span className="inline-flex items-center gap-2">
              <Pencil size={15} aria-hidden="true" />
              {canEdit ? 'Chỉnh metadata' : 'Xem metadata'}
            </span>
            <ChevronDown size={17} className="transition group-open:rotate-180" aria-hidden="true" />
          </summary>

          <div className="pt-4">
            <form action={updateMediaMetadata} className="grid gap-5">
              <input type="hidden" name="id" value={media.id} />

              <AdminFieldGroup legend="Alt text song ngữ" disabled={!canEdit}>
                <div className="grid gap-3">
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
                <div className="grid gap-3">
                  <div className="grid gap-3 sm:grid-cols-2">
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
                  </div>

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
                <button className="min-h-11 w-full rounded-xl bg-[var(--nupsbox-blue)] px-5 text-sm font-black text-white">
                  Lưu metadata
                </button>
              ) : (
                <p className="text-sm text-[var(--nupsbox-slate)]">Tài khoản hiện tại chỉ có quyền xem.</p>
              )}
            </form>

            {canDelete ? (
              <div className="mt-5 border-t border-red-100 pt-4">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.12em] text-red-700">Vùng nguy hiểm</p>
                <MediaDeleteForm
                  mediaId={media.id}
                  label={media.altVi || media.altEn || media.storagePath}
                />
              </div>
            ) : null}
          </div>
        </details>
      </div>
    </article>
  );
}
