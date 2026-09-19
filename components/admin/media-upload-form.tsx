import {ChevronDown, UploadCloud} from 'lucide-react';
import {uploadMediaAsset} from '@/app/admin/content/media/actions';
import {AdminFieldGroup} from '@/components/admin/admin-primitives';
import {MediaFileInput} from '@/components/admin/media-file-input';

type Option = {id: string; label: string};

const inputClass =
  'mt-1 min-h-11 w-full rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 py-2 text-sm';

export function MediaUploadForm({
  locationOptions,
  unitOptions
}: {
  locationOptions: Option[];
  unitOptions: Option[];
}) {
  return (
    <details className="group overflow-hidden rounded-2xl border border-[var(--nupsbox-border)] bg-white shadow-sm">
      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--nupsbox-blue)]">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-[var(--nupsbox-blue)]">
            <UploadCloud size={19} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-black text-[var(--nupsbox-navy)]">Thêm ảnh mới</h2>
            <p className="mt-0.5 text-xs text-[var(--nupsbox-slate)]">JPG, PNG, WebP hoặc AVIF · tối đa 8 MB</p>
          </div>
        </div>
        <ChevronDown size={19} className="shrink-0 text-[var(--nupsbox-slate)] transition group-open:rotate-180" aria-hidden="true" />
      </summary>

      <div className="border-t border-[var(--nupsbox-border)] p-5">
        <form action={uploadMediaAsset} className="grid gap-6">
          <AdminFieldGroup legend="File & mô tả">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold md:col-span-2">
                Hình ảnh
                <MediaFileInput className={inputClass + ' py-2'} />
              </label>
              <label className="text-sm font-semibold">
                Alt VI
                <input className={inputClass} name="altVi" required placeholder="Ví dụ: Hành lang kho NupsBox Tân Phú" />
              </label>
              <label className="text-sm font-semibold">
                Alt EN
                <input className={inputClass} name="altEn" required placeholder="Example: NupsBox Tan Phu storage corridor" />
              </label>
            </div>
          </AdminFieldGroup>

          <AdminFieldGroup legend="Phân loại & nơi hiển thị">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold">
                Category
                <select className={inputClass} name="category" defaultValue="location">
                  {['hero', 'location', 'unit', 'security', 'exterior', 'lifestyle', 'blog'].map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold">
                Thứ tự
                <input className={inputClass} name="sortOrder" type="number" defaultValue={10} />
              </label>
              <label className="text-sm font-semibold">
                Địa điểm liên kết
                <select className={inputClass} name="locationId" defaultValue="">
                  <option value="">Không liên kết</option>
                  {locationOptions.map((option) => (
                    <option key={option.id} value={option.id}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold">
                Loại kho liên kết
                <select className={inputClass} name="unitTypeId" defaultValue="">
                  <option value="">Không liên kết</option>
                  {unitOptions.map((option) => (
                    <option key={option.id} value={option.id}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold">
                Hiển thị công khai
                <select className={inputClass} name="isPublic" defaultValue="true">
                  <option value="true">Có</option>
                  <option value="false">Không</option>
                </select>
              </label>
            </div>
          </AdminFieldGroup>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs leading-5 text-[var(--nupsbox-slate)]">Ảnh mới không ghi đè file cũ; có thể chỉnh lại metadata sau khi upload.</p>
            <button className="min-h-11 rounded-xl bg-[var(--nupsbox-blue)] px-5 text-sm font-black text-white">
              Upload ảnh
            </button>
          </div>
        </form>
      </div>
    </details>
  );
}
