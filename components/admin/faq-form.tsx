import {createFaq, setFaqPublication, updateFaq} from '@/app/admin/content/faq/actions';
import {
  AdminActionBar,
  AdminFieldGroup,
  AdminPanel,
  AdminStatusBadge
} from '@/components/admin/admin-primitives';
import type {AdminFaq} from '@/features/admin/faqs';

type Props = {
  faq?: AdminFaq;
  canEdit: boolean;
  canPublish: boolean;
};

const inputClass =
  'mt-1 min-h-11 w-full rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 py-2 text-sm disabled:bg-slate-50';

export function FaqForm({faq, canEdit, canPublish}: Props) {
  const editing = Boolean(faq);

  return (
    <AdminPanel
      title={faq?.questionVi ?? 'Thêm FAQ'}
      actions={
        <AdminActionBar>
          <AdminStatusBadge
            label={faq?.active ? 'Đang hiển thị' : editing ? 'Bản nháp' : 'Mới'}
            tone={faq?.active ? 'success' : 'neutral'}
          />
          {faq && canPublish ? (
            <form action={setFaqPublication}>
              <input type="hidden" name="id" value={faq.id} />
              <input type="hidden" name="publish" value={faq.active ? 'false' : 'true'} />
              <button
                className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] px-4 text-sm font-bold text-[var(--nupsbox-navy)]"
              >
                {faq.active ? 'Ngừng xuất bản' : 'Xuất bản'}
              </button>
            </form>
          ) : null}
        </AdminActionBar>
      }
    >
      <form action={editing ? updateFaq : createFaq} className="grid gap-6">
        {faq ? <input type="hidden" name="id" value={faq.id} /> : null}

        <AdminFieldGroup legend="Tiếng Việt" disabled={!canEdit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Câu hỏi VI
              <textarea className={inputClass} name="questionVi" required rows={3} defaultValue={faq?.questionVi ?? ''} />
            </label>
            <label className="text-sm font-semibold">
              Trả lời VI
              <textarea className={inputClass} name="answerVi" required rows={6} defaultValue={faq?.answerVi ?? ''} />
            </label>
          </div>
        </AdminFieldGroup>

        <AdminFieldGroup legend="English" disabled={!canEdit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Question EN
              <textarea className={inputClass} name="questionEn" required rows={3} defaultValue={faq?.questionEn ?? ''} />
            </label>
            <label className="text-sm font-semibold">
              Answer EN
              <textarea className={inputClass} name="answerEn" required rows={6} defaultValue={faq?.answerEn ?? ''} />
            </label>
          </div>
        </AdminFieldGroup>

        <AdminFieldGroup legend="Hiển thị & vận hành" disabled={!canEdit}>
          <label className="text-sm font-semibold">
            Thứ tự
            <input className={inputClass} name="sortOrder" type="number" defaultValue={faq?.sortOrder ?? 0} />
          </label>
        </AdminFieldGroup>

        {canEdit ? (
          <button className="min-h-11 w-fit rounded-xl bg-[var(--nupsbox-blue)] px-5 text-sm font-black text-white">
            {editing ? 'Lưu thay đổi' : 'Tạo bản nháp'}
          </button>
        ) : (
          <p className="text-sm text-[var(--nupsbox-slate)]">Tài khoản hiện tại chỉ có quyền xem.</p>
        )}
      </form>
    </AdminPanel>
  );
}
