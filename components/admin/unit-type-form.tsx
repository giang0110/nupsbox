import type {AdminUnitType} from '@/features/admin/unit-types';
import {
  createUnitType,
  setUnitTypePublication,
  updateUnitType
} from '@/app/admin/catalog/unit-types/actions';

type Props = {unit?: AdminUnitType; canMutate: boolean; canPublish: boolean};
const inputClass = 'mt-1 w-full rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 py-2 text-sm disabled:bg-slate-50';

export function UnitTypeForm({unit, canMutate, canPublish}: Props) {
  const editing = Boolean(unit);
  const slugLocked = Boolean(unit?.publishedAt);
  return (
    <article className="rounded-3xl border border-[var(--nupsbox-border)] bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black tracking-[0.14em] text-[var(--nupsbox-blue)]">{unit?.active ? 'PUBLISHED' : editing ? 'DRAFT' : 'NEW'}</p>
          <h2 className="mt-1 text-xl font-black text-[var(--nupsbox-navy)]">{unit?.nameVi ?? 'Thêm loại kho'}</h2>
          {unit?.publishedAt ? <p className="mt-1 text-xs text-[var(--nupsbox-slate)]">Đã từng xuất bản — slug được khóa.</p> : null}
        </div>
        {unit && canPublish ? (
          <form action={setUnitTypePublication}>
            <input type="hidden" name="id" value={unit.id} />
            <input type="hidden" name="publish" value={unit.active ? 'false' : 'true'} />
            <button className="rounded-full border border-[var(--nupsbox-blue)] px-4 py-2 text-sm font-bold text-[var(--nupsbox-blue)]">
              {unit.active ? 'Ngừng xuất bản' : 'Xuất bản'}
            </button>
          </form>
        ) : null}
      </div>
      <form action={editing ? updateUnitType : createUnitType} className="space-y-4">
        {unit ? <input type="hidden" name="id" value={unit.id} /> : null}
        {slugLocked && unit ? <input type="hidden" name="slug" value={unit.slug} /> : null}
        <fieldset disabled={!canMutate} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold">Slug<input className={inputClass} name="slug" required disabled={!canMutate || slugLocked} defaultValue={unit?.slug ?? ''} /></label>
          <label className="text-sm font-semibold">Diện tích m²<input className={inputClass} name="areaM2" type="number" min="0.01" step="0.01" required defaultValue={unit?.areaM2 ?? ''} /></label>
          <label className="text-sm font-semibold">Tên VI<input className={inputClass} name="nameVi" required defaultValue={unit?.nameVi ?? ''} /></label>
          <label className="text-sm font-semibold">Tên EN<input className={inputClass} name="nameEn" required defaultValue={unit?.nameEn ?? ''} /></label>
          <label className="text-sm font-semibold">Gợi ý VI<input className={inputClass} name="recommendedForVi" defaultValue={unit?.recommendedForVi ?? ''} /></label>
          <label className="text-sm font-semibold">Gợi ý EN<input className={inputClass} name="recommendedForEn" defaultValue={unit?.recommendedForEn ?? ''} /></label>
          <label className="text-sm font-semibold">Sức chứa VI<input className={inputClass} name="capacityNoteVi" defaultValue={unit?.capacityNoteVi ?? ''} /></label>
          <label className="text-sm font-semibold">Sức chứa EN<input className={inputClass} name="capacityNoteEn" defaultValue={unit?.capacityNoteEn ?? ''} /></label>
          <label className="text-sm font-semibold">Thứ tự<input className={inputClass} name="sortOrder" type="number" defaultValue={unit?.sortOrder ?? 0} /></label>
        </fieldset>
        {canMutate ? <button className="rounded-full bg-[var(--nupsbox-blue)] px-5 py-2.5 text-sm font-black text-white">{editing ? 'Lưu thay đổi' : 'Tạo bản nháp'}</button> : <p className="text-sm text-[var(--nupsbox-slate)]">Tài khoản hiện tại chỉ có quyền xem.</p>}
      </form>
    </article>
  );
}
