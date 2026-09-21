import {assignLead} from '@/app/admin/leads/actions';

type AssigneeOption = {id: string; fullName: string; role: 'admin' | 'staff'};

type Props = {
  leadId: string;
  assignedTo: string | null;
  options: AssigneeOption[];
};

export function LeadAssigneeForm({leadId, assignedTo, options}: Props) {
  return (
    <form action={assignLead} className="mt-4 grid gap-3">
      <input type="hidden" name="leadId" value={leadId} />
      <label className="grid gap-1 text-sm font-bold text-[var(--nupsbox-navy)]">
        Nhân viên phụ trách lead
        <select name="assigneeId" defaultValue={assignedTo ?? ''} className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 text-sm">
          <option value="">Chưa phân công</option>
          {options.map((option) => <option key={option.id} value={option.id}>{option.fullName} · {option.role}</option>)}
        </select>
      </label>
      <button type="submit" className="min-h-11 rounded-xl bg-[var(--nupsbox-navy)] px-4 text-sm font-bold text-white">Lưu phân công</button>
    </form>
  );
}
