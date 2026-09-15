import {leadStatuses, type OperationalLeadStatus} from '@/features/admin/leads';
import {updateLeadStatus} from '@/app/admin/leads/actions';

const labels: Record<OperationalLeadStatus, string> = {
  new: 'Mới',
  contacted: 'Đã liên hệ',
  qualified: 'Đã xác nhận nhu cầu',
  viewing: 'Đang xem kho',
  negotiating: 'Đang thương lượng',
  won: 'Đã thuê',
  lost: 'Không chuyển đổi'
};

export function LeadStatusForm({leadId, status}: {leadId: string; status: OperationalLeadStatus}) {
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
