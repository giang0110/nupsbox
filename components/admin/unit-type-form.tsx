import {
  createUnitType,
  setUnitTypePublication,
  updateUnitType
} from '@/app/admin/catalog/unit-types/actions';
import Link from 'next/link';
import {
  AdminActionBar,
  AdminFieldGroup,
  AdminPanel,
  AdminStatusBadge
} from '@/components/admin/admin-primitives';
import {getUnitTypePublicationReadiness, type AdminUnitType} from '@/features/admin/unit-types';

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
  const publication = unit ? getUnitTypePublicationReadiness(unit) : null;

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
          {unit?.active ? (
            <Link
              href={'/kho-mini/' + unit.slug}
              target="_blank"
              className="inline-flex min-h-11 items-center rounded-xl border border-[var(--nupsbox-border)] px-4 text-sm font-bold text-[var(--nupsbox-blue)]"
            >
              Preview public ↗
            </Link>
          ) : null}
          {unit && canPublish ? (
            <form action={setUnitTypePublication}>
              <input type="hidden" name="id" value={unit.id} />
              <input type="hidden" name="publish" value={unit.active ? 'false' : 'true'} />
              <button
                type="submit"
                disabled={!unit.active && !publication?.ready}
                title={!unit.active && !publication?.ready ? 'Hoàn thiện checklist trước khi xuất bản' : undefined}
                className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] px-4 text-sm font-bold text-[var(--nupsbox-navy)] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {unit.active ? 'Ngừng xuất bản' : publication?.ready ? 'Xuất bản' : 'Chưa sẵn sàng'}
              </button>
            </form>
          ) : null}
        </AdminActionBar>
      }
    >
      {unit && publication ? (
        <div className="mb-6 rounded-xl border border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-[var(--nupsbox-navy)]">Checklist trước khi xuất bản</p>
              <p className="mt-1 text-xs leading-5 text-[var(--nupsbox-slate)]">
                Chỉ các trường cốt lõi được dùng để chặn publish; ghi chú sức chứa vẫn là tùy chọn.
              </p>
            </div>
            <AdminStatusBadge
              label={publication.ready ? 'Sẵn sàng' : publication.missingLabels.length + ' mục còn thiếu'}
              tone={publication.ready ? 'success' : 'warning'}
            />
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {publication.checks.map(check => (
              <div key={check.id} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-[var(--nupsbox-navy)]">
                <span aria-hidden="true" className={check.ready ? 'text-emerald-700' : 'text-amber-700'}>
                  {check.ready ? '✓' : '○'}
                </span>
                {check.label}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <form action={editing ? updateUnitType : createUnitType} className="grid gap-6">
        {unit ? <input type="hidden" name="id" value={unit.id} /> : null}
        {slugLocked && unit ? <input type="hidden" name="slug" value={unit.slug} /> : null}

        <AdminFieldGroup legend="Thông tin chính" disabled={!canMutate}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Slug
              <input
                className={inputClass}
                name="slug"
                required
                disabled={!canMutate || slugLocked}
                defaultValue={unit?.slug ?? ''}
                autoCapitalize="none"
                spellCheck={false}
              />
              {!slugLocked ? (
                <span className="mt-1 block text-xs font-normal leading-5 text-[var(--nupsbox-slate)]">
                  Có thể nhập “Kho Mini 2.5m²”; hệ thống sẽ tự chuẩn hoá thành slug URL-safe.
                </span>
              ) : null}
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
