import {leadStatuses} from '@/features/admin/leads';
import type {LeadStatus} from '@/types/database';
import {updateLeadStatus} from '@/app/admin/leads/actions';

const labels: Record<LeadStatus, string> = {
  new: 'Mới',
  contacted: 'Đã liên hệ',
  visit_scheduled: 'Đã hẹn xem kho',
  visited: 'Đã xem kho',
  won: 'Đã thuê',
  lost: 'Không chuyển đổi'
};

export function LeadStatusForm({leadId, status}: {leadId: string; status: LeadStatus}) {
  return (
    <form action={updateLeadStatus} className="flex min-w-[15rem] items-center gap-2">
      <input type="hidden" name="leadId" value={leadId} />
      <label className="sr-only" htmlFor={`lead-status-${leadId}`}>Trạng thái lead</label>
      <select
        id={`lead-status-${leadId}`}
        name="status"
        defaultValue={status}
        className="min-h-10 flex-1 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 text-sm"
      >
        {leadStatuses.map((value) => <option key={value} value={value}>{labels[value]}</option>)}
      </select>
      <button type="submit" className="min-h-10 rounded-xl bg-[var(--nupsbox-navy)] px-3 text-sm font-bold text-white">
        Lưu
      </button>
    </form>
  );
}
