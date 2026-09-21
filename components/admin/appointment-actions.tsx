import {updateAppointment} from '@/app/admin/leads/[leadId]/actions';
import {terminalAppointmentStatuses} from '@/features/appointments/domain';
import type {AdminLeadAppointment} from '@/features/admin/lead-detail';

type Props = {
  appointment: AdminLeadAppointment;
  canMutate: boolean;
};

const actionLabels = {
  confirmed: 'Xác nhận',
  cancelled: 'Huỷ lịch',
  completed: 'Hoàn tất',
  no_show: 'Không đến'
} as const;

function StatusAction({appointment, status, label}: {
  appointment: AdminLeadAppointment;
  status: keyof typeof actionLabels;
  label: string;
}) {
  return (
    <form action={updateAppointment}>
      <input type="hidden" name="appointmentId" value={appointment.id} />
      <input type="hidden" name="leadId" value={appointment.leadId ?? ''} />
      <input type="hidden" name="expectedUpdatedAt" value={appointment.updatedAt} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className="min-h-10 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 text-xs font-bold text-[var(--nupsbox-navy)] hover:border-[var(--nupsbox-blue)] hover:text-[var(--nupsbox-blue)]">
        {label}
      </button>
    </form>
  );
}

export function AppointmentActions({appointment, canMutate}: Props) {
  const isTerminal = terminalAppointmentStatuses.includes(appointment.status as typeof terminalAppointmentStatuses[number]);
  if (isTerminal || !canMutate) {
    return <span className="text-xs font-bold text-[var(--nupsbox-slate)]">{isTerminal ? 'Chỉ xem · trạng thái kết thúc' : 'Chỉ xem'}</span>;
  }

  const statuses = appointment.status === 'pending'
    ? (['confirmed', 'cancelled'] as const)
    : (['completed', 'no_show', 'cancelled'] as const);

  return (
    <div className="flex flex-wrap gap-2" aria-label="Thao tác cuộc hẹn">
      {statuses.map((status) => (
        <StatusAction key={status} appointment={appointment} status={status} label={actionLabels[status]} />
      ))}
    </div>
  );
}
