import {uploadMediaAsset} from '@/app/admin/content/media/actions';
import {AdminFieldGroup, AdminPanel} from '@/components/admin/admin-primitives';

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
    <AdminPanel
      title="Upload hình ảnh"
      description="JPG, PNG, WebP hoặc AVIF · tối đa 8 MB · ảnh mới không ghi đè file cũ."
    >
      <form action={uploadMediaAsset} className="grid gap-6">
        <AdminFieldGroup legend="File & mô tả">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold md:col-span-2">
              Hình ảnh
              <input
                className={inputClass + ' py-2'}
                name="file"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                required
              />
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

        <button className="min-h-11 w-fit rounded-xl bg-[var(--nupsbox-blue)] px-5 text-sm font-black text-white">
          Upload ảnh
        </button>
      </form>
    </AdminPanel>
  );
}
