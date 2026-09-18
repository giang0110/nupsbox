'use client';

import {useState, useTransition} from 'react';
import {updateLeadStatusValue} from '@/app/admin/leads/actions';
import {leadStatusMeta} from '@/features/admin/lead-workspace';
import {
  leadStatuses,
  type OperationalLeadStatus
} from '@/features/admin/lead-status';

export function LeadStatusForm({
  leadId,
  status
}: {
  leadId: string;
  status: OperationalLeadStatus;
}) {
  const [value, setValue] = useState<OperationalLeadStatus>(status);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    startTransition(async () => {
      const result = await updateLeadStatusValue(leadId, value);
      if (!result.ok) {
        setError(result.message);
      }
    });
  }

  return (
    <form onSubmit={submit} className="grid min-w-[15rem] gap-2">
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor={'lead-status-' + leadId}>
          Trạng thái
        </label>
        <select
          id={'lead-status-' + leadId}
          name="status"
          value={value}
          disabled={pending}
          onChange={(event) =>
            setValue(event.target.value as OperationalLeadStatus)
          }
          className="min-h-11 flex-1 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 text-sm text-[var(--nupsbox-navy)] disabled:cursor-wait disabled:opacity-60"
        >
          {leadStatuses.map((option) => (
            <option key={option} value={option}>
              {leadStatusMeta[option].label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 rounded-xl bg-[var(--nupsbox-navy)] px-3 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? 'Đang lưu…' : 'Lưu trạng thái'}
        </button>
      </div>
      {error ? (
        <p role="alert" aria-live="assertive" className="text-xs font-bold text-rose-700">
          {error}
        </p>
      ) : null}
    </form>
  );
}
