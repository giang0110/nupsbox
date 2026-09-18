'use client';

import {useState, useTransition} from 'react';
import {assignLeadValue} from '@/app/admin/leads/actions';
import type {LeadAssigneeOption} from '@/features/admin/leads';

export function LeadAssignmentForm({
  leadId,
  currentAssignee,
  options
}: {
  leadId: string;
  currentAssignee: string | null;
  options: LeadAssigneeOption[];
}) {
  const [value, setValue] = useState(currentAssignee ?? '');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    startTransition(async () => {
      const result = await assignLeadValue(leadId, value);
      if (!result.ok) {
        setError(result.message);
      }
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-3">
      <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
        Người phụ trách
        <select
          value={value}
          disabled={pending}
          onChange={(event) => setValue(event.target.value)}
          className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 text-sm font-normal text-[var(--nupsbox-navy)] disabled:cursor-wait disabled:opacity-60"
        >
          <option value="">Chưa phân công</option>
          {options.map((assignee) => (
            <option key={assignee.id} value={assignee.id}>
              {assignee.fullName} · {assignee.role}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-xl bg-[var(--nupsbox-navy)] px-4 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? 'Đang lưu…' : 'Lưu phân công'}
      </button>
      {error ? (
        <p role="alert" aria-live="assertive" className="text-xs font-bold text-rose-700">
          {error}
        </p>
      ) : null}
    </form>
  );
}
