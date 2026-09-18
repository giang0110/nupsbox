import {
  createUnitType,
  setUnitTypePublication,
  updateUnitType
} from '@/app/admin/catalog/unit-types/actions';
import {
  AdminActionBar,
  AdminFieldGroup,
  AdminPanel,
  AdminStatusBadge
} from '@/components/admin/admin-primitives';
import type {AdminUnitType} from '@/features/admin/unit-types';

type Props = {
  unit?: AdminUnitType;
  canMutate: boolean;
  canPublish: boolean;
};

const inputClass =
  'mt-1 min-h-11 w-full rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 py-2 text-sm disabled:bg-slate-50';

export function UnitTypeForm({unit, canMutate, canPublish}: Props) {
  const editing = Boolean(unit);
  const slugLocked = Boolean(unit?.publishedAt);

  return (
    <AdminPanel
      title={unit?.nameVi ?? 'Thêm loại kho'}
      description={unit?.publishedAt ? 'Đã từng xuất bản — slug được khóa.' : undefined}
      actions={
        <AdminActionBar>
          <AdminStatusBadge
            label={unit?.active ? 'Đang hoạt động' : editing ? 'Bản nháp' : 'Mới'}
            tone={unit?.active ? 'success' : 'neutral'}
          />
          {unit && canPublish ? (
            <form action={setUnitTypePublication}>
              <input type="hidden" name="id" value={unit.id} />
              <input type="hidden" name="publish" value={unit.active ? 'false' : 'true'} />
              <button
                type="submit"
                className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] px-4 text-sm font-bold text-[var(--nupsbox-navy)]"
              >
                {unit.active ? 'Ngừng xuất bản' : 'Xuất bản'}
              </button>
            </form>
          ) : null}
        </AdminActionBar>
      }
    >
      <form action={editing ? updateUnitType : createUnitType} className="grid gap-6">
        {unit ? <input type="hidden" name="id" value={unit.id} /> : null}
        {slugLocked && unit ? <input type="hidden" name="slug" value={unit.slug} /> : null}

        <AdminFieldGroup legend="Thông tin chính" disabled={!canMutate}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Slug
              <input className={inputClass} name="slug" required disabled={!canMutate || slugLocked} defaultValue={unit?.slug ?? ''} />
            </label>
            <label className="text-sm font-semibold">
              Diện tích m²
              <input className={inputClass} name="areaM2" type="number" min="0.01" step="0.01" required defaultValue={unit?.areaM2 ?? ''} />
            </label>
            <label className="text-sm font-semibold">
              Tên VI
              <input className={inputClass} name="nameVi" required defaultValue={unit?.nameVi ?? ''} />
            </label>
            <label className="text-sm font-semibold">
              Tên EN
              <input className={inputClass} name="nameEn" required defaultValue={unit?.nameEn ?? ''} />
            </label>
          </div>
        </AdminFieldGroup>

        <AdminFieldGroup legend="Nội dung tư vấn" disabled={!canMutate}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Gợi ý VI
              <input className={inputClass} name="recommendedForVi" defaultValue={unit?.recommendedForVi ?? ''} />
            </label>
            <label className="text-sm font-semibold">
              Gợi ý EN
              <input className={inputClass} name="recommendedForEn" defaultValue={unit?.recommendedForEn ?? ''} />
            </label>
            <label className="text-sm font-semibold">
              Sức chứa VI
              <input className={inputClass} name="capacityNoteVi" defaultValue={unit?.capacityNoteVi ?? ''} />
            </label>
            <label className="text-sm font-semibold">
              Sức chứa EN
              <input className={inputClass} name="capacityNoteEn" defaultValue={unit?.capacityNoteEn ?? ''} />
            </label>
          </div>
        </AdminFieldGroup>

        <AdminFieldGroup legend="Hiển thị & vận hành" disabled={!canMutate}>
          <label className="text-sm font-semibold">
            Thứ tự
            <input className={inputClass} name="sortOrder" type="number" defaultValue={unit?.sortOrder ?? 0} />
          </label>
        </AdminFieldGroup>

        {canMutate ? (
          <button
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
