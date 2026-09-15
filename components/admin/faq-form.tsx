import type {AdminFaq} from '@/features/admin/faqs';
import {createFaq, setFaqPublication, updateFaq} from '@/app/admin/content/faq/actions';

type Props = {faq?: AdminFaq; canEdit: boolean; canPublish: boolean};

const inputClass =
  'mt-1 w-full rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 py-2 text-sm disabled:bg-slate-50';

export function FaqForm({faq, canEdit, canPublish}: Props) {
  const editing = Boolean(faq);

  return (
    <article className="rounded-3xl border border-[var(--nupsbox-border)] bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black tracking-[0.14em] text-[var(--nupsbox-blue)]">
            {faq?.active ? 'PUBLISHED' : editing ? 'DRAFT' : 'NEW'}
          </p>
          <h2 className="mt-1 text-xl font-black text-[var(--nupsbox-navy)]">
            {faq?.questionVi ?? 'Thêm FAQ'}
          </h2>
        </div>
        {faq && canPublish ? (
          <form action={setFaqPublication}>
            <input type="hidden" name="id" value={faq.id} />
            <input type="hidden" name="publish" value={faq.active ? 'false' : 'true'} />
            <button className="rounded-full border border-[var(--nupsbox-blue)] px-4 py-2 text-sm font-bold text-[var(--nupsbox-blue)]">
              {faq.active ? 'Ngừng xuất bản' : 'Xuất bản'}
            </button>
          </form>
        ) : null}
      </div>

      <form action={editing ? updateFaq : createFaq} className="space-y-4">
        {faq ? <input type="hidden" name="id" value={faq.id} /> : null}
        <fieldset disabled={!canEdit} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold">
            Câu hỏi VI
            <textarea className={inputClass} name="questionVi" required rows={3} defaultValue={faq?.questionVi ?? ''} />
          </label>
          <label className="text-sm font-semibold">
            Question EN
            <textarea className={inputClass} name="questionEn" required rows={3} defaultValue={faq?.questionEn ?? ''} />
          </label>
          <label className="text-sm font-semibold">
            Trả lời VI
            <textarea className={inputClass} name="answerVi" required rows={6} defaultValue={faq?.answerVi ?? ''} />
          </label>
          <label className="text-sm font-semibold">
            Answer EN
            <textarea className={inputClass} name="answerEn" required rows={6} defaultValue={faq?.answerEn ?? ''} />
          </label>
          <label className="text-sm font-semibold">
            Thứ tự
            <input className={inputClass} name="sortOrder" type="number" defaultValue={faq?.sortOrder ?? 0} />
          </label>
        </fieldset>
        {canEdit ? (
          <button className="rounded-full bg-[var(--nupsbox-blue)] px-5 py-2.5 text-sm font-black text-white">
            {editing ? 'Lưu thay đổi' : 'Tạo bản nháp'}
          </button>
        ) : (
          <p className="text-sm text-[var(--nupsbox-slate)]">Tài khoản hiện tại chỉ có quyền xem.</p>
        )}
      </form>
    </article>
  );
}
