'use client';

import {useState, useTransition} from 'react';
import {addLeadNoteValue} from '@/app/admin/leads/actions';

export function LeadNoteForm({leadId}: {leadId: string}) {
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    startTransition(async () => {
      try {
        const result = await addLeadNoteValue(leadId, note);
        if (!result.ok) {
          setError(result.message);
          return;
        }

        setNote('');
      } catch {
        setError('Mất kết nối khi lưu ghi chú. Nội dung chưa được gửi, vui lòng thử lại.');
      }
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-3">
      <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
        Ghi chú nội bộ
        <textarea
          name="note"
          required
          maxLength={2000}
          rows={4}
          value={note}
          disabled={pending}
          onChange={(event) => setNote(event.target.value)}
          className="rounded-xl border border-[var(--nupsbox-border)] bg-white p-3 font-normal text-[var(--nupsbox-navy)] disabled:cursor-wait disabled:opacity-60"
          placeholder="Ví dụ: Khách muốn xem kho chiều thứ Sáu…"
        />
      </label>
      <button
        type="submit"
        disabled={pending || !note.trim()}
        className="min-h-11 w-fit rounded-xl bg-[var(--nupsbox-blue)] px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Đang lưu…' : 'Lưu ghi chú'}
      </button>
      {error ? (
        <p role="alert" aria-live="assertive" className="text-xs font-bold text-rose-700">
          {error}
        </p>
      ) : null}
    </form>
  );
}
