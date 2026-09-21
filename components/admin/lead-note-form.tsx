import {addLeadNote} from '@/app/admin/leads/actions';

export function LeadNoteForm({leadId}: {leadId: string}) {
  return (
    <form action={addLeadNote} className="mt-5 grid gap-3">
      <input type="hidden" name="leadId" value={leadId} />
      <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
        Thêm ghi chú
        <textarea name="note" required maxLength={2000} rows={4} className="rounded-xl border border-[var(--nupsbox-border)] bg-white p-3 font-normal" placeholder="Ví dụ: Khách muốn xem kho chiều thứ Sáu…" />
      </label>
      <button type="submit" className="w-fit rounded-xl bg-[var(--nupsbox-blue)] px-4 py-3 text-sm font-bold text-white">Lưu ghi chú</button>
    </form>
  );
}
