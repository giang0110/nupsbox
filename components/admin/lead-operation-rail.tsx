import clsx from 'clsx';
import {AdminStatusBadge} from '@/components/admin/admin-primitives';
import {LeadAssignmentForm} from '@/components/admin/lead-assignment-form';
import {LeadStatusForm} from '@/components/admin/lead-status-form';
import {leadStatusMeta} from '@/features/admin/lead-workspace';
import type {
  AdminAppointmentRow
} from '@/features/admin/appointment-read-model';
import type {
  LeadAssigneeOption,
  OperationalLeadStatus
} from '@/features/admin/leads';

const crmDateTime = new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh',
  dateStyle: 'medium',
  timeStyle: 'short'
});

function formatDateTime(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : crmDateTime.format(parsed);
}

export type LeadRailAppointment = AdminAppointmentRow & {
  overdue: boolean;
};

export function LeadOperationRail({
  leadId,
  status,
  canUpdate,
  canAssign,
  assignedTo,
  assigneeName,
  assignees,
  nextAppointment,
  className
}: {
  leadId: string;
  status: OperationalLeadStatus;
  canUpdate: boolean;
  canAssign: boolean;
  assignedTo: string | null;
  assigneeName: string | null;
  assignees: LeadAssigneeOption[];
  nextAppointment: LeadRailAppointment | null;
  className?: string;
}) {
  return (
    <aside
      className={clsx(
        'admin-lead-operation-rail rounded-2xl border border-[var(--nupsbox-border)] bg-white p-5 shadow-sm',
        className
      )}
    >
      <section>
        <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--nupsbox-slate)]">
          Trạng thái
        </p>
        <div className="mt-3">
          {canUpdate ? (
            <LeadStatusForm leadId={leadId} status={status} />
          ) : (
            <AdminStatusBadge
              label={leadStatusMeta[status].label}
              tone={leadStatusMeta[status].tone}
            />
          )}
        </div>
      </section>

      <section className="mt-6 border-t border-[var(--nupsbox-border)] pt-5">
        <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--nupsbox-slate)]">
          Phụ trách
        </p>
        <div className="mt-3">
          {canAssign ? (
            <LeadAssignmentForm
              leadId={leadId}
              currentAssignee={assignedTo}
              options={assignees}
            />
          ) : (
            <p className="text-sm font-bold text-[var(--nupsbox-navy)]">
              {assigneeName ?? 'Chưa phân công'}
            </p>
          )}
        </div>
      </section>

      <section className="mt-6 border-t border-[var(--nupsbox-border)] pt-5">
        <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--nupsbox-slate)]">
          Lịch xem kho gần nhất
        </p>
        {nextAppointment ? (
          <div className="mt-3 grid gap-2 text-sm">
            <AdminStatusBadge
              label={
                nextAppointment.overdue
                  ? 'Quá hạn'
                  : nextAppointment.status === 'confirmed'
                    ? 'Đã xác nhận'
                    : 'Đang chờ'
              }
              tone={nextAppointment.overdue ? 'warning' : 'neutral'}
            />
            <p className="font-bold text-[var(--nupsbox-navy)]">
              {formatDateTime(nextAppointment.scheduledAt)}
            </p>
            <p className="text-[var(--nupsbox-slate)]">
              {nextAppointment.durationMinutes} phút
            </p>
            {nextAppointment.locationName ? (
              <p className="text-[var(--nupsbox-slate)]">{nextAppointment.locationName}</p>
            ) : null}
            {nextAppointment.unitTypeName ? (
              <p className="text-[var(--nupsbox-slate)]">{nextAppointment.unitTypeName}</p>
            ) : null}
            {nextAppointment.assignedName ? (
              <p className="text-[var(--nupsbox-slate)]">
                Phụ trách: {nextAppointment.assignedName}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-2 text-sm text-[var(--nupsbox-slate)]">
            Chưa có lịch hành động.
          </p>
        )}
      </section>
    </aside>
  );
}
