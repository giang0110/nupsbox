import {updateAppointment} from '@/app/admin/leads/[leadId]/actions';
import {AppointmentActions} from '@/components/admin/appointment-actions';
import type {AdminAppointmentHistoryRow, AdminLeadAppointment} from '@/features/admin/lead-detail';

type Option = {id: string; name: string};
type AssigneeOption = {id: string; fullName: string; role: 'admin' | 'staff'};

type Props = {
  appointments: AdminLeadAppointment[];
  appointmentHistory: AdminAppointmentHistoryRow[];
  canMutate: boolean;
  assigneeOptions: AssigneeOption[];
  locationOptions: Option[];
  unitTypeOptions: Option[];
};

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Ho_Chi_Minh'
});

const localDateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'Asia/Ho_Chi_Minh'
});

const statusLabels = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  completed: 'Hoàn tất',
  cancelled: 'Đã huỷ',
  no_show: 'Không đến'
} as const;

const sourceLabels = {customer: 'Khách hàng', staff: 'Nhân viên'} as const;

const eventLabels: Record<string, string> = {
  created: 'Tạo lịch',
  rescheduled: 'Đổi thời gian',
  duration_changed: 'Đổi thời lượng',
  location_changed: 'Đổi địa điểm',
  unit_type_changed: 'Đổi loại kho',
  assignment_changed: 'Đổi người phụ trách',
  customer_note_changed: 'Đổi ghi chú khách hàng',
  internal_note_changed: 'Đổi ghi chú nội bộ',
  status_changed: 'Đổi trạng thái',
  details_changed: 'Đổi thông tin'
};

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function formatLocalDateTime(value: string) {
  const parts = localDateTimeFormatter.formatToParts(new Date(value));
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

function optionLabel(options: Option[], id: string | null) {
  if (!id) return 'Chưa chọn';
  return options.find((option) => option.id === id)?.name ?? id;
}

function assigneeLabel(options: AssigneeOption[], id: string | null, fallback: string | null) {
  if (!id) return 'Chưa phân công';
  return options.find((option) => option.id === id)?.fullName ?? fallback ?? id;
}

export function AppointmentList({
  appointments,
  appointmentHistory,
  canMutate,
  assigneeOptions,
  locationOptions,
  unitTypeOptions
}: Props) {
  return (
    <section id="appointments" className="rounded-[1.5rem] border border-[var(--nupsbox-border)] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--nupsbox-blue)]">Lịch xem</p>
          <h2 className="mt-2 text-2xl font-black text-[var(--nupsbox-navy)]">Lịch hẹn & lịch sử</h2>
        </div>
        <span className="text-xs font-bold text-[var(--nupsbox-slate)]">{appointments.length} cuộc hẹn</span>
      </div>

      <div className="mt-6 grid gap-5">
        {appointments.map((appointment) => {
          const events = appointmentHistory.filter((entry) => entry.appointmentId === appointment.id);
          const isPending = appointment.status === 'pending';
          const isActive = isPending || appointment.status === 'confirmed';

          return (
            <article key={appointment.id} className="rounded-2xl border border-[var(--nupsbox-border)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--nupsbox-blue)]">
                    {statusLabels[appointment.status]} · {sourceLabels[appointment.source]}
                  </p>
                  <h3 className="mt-2 text-xl font-black text-[var(--nupsbox-navy)]">{formatDate(appointment.scheduledAt)}</h3>
                  <p className="mt-1 text-sm text-[var(--nupsbox-slate)]">Mã lịch: {appointment.id}</p>
                </div>
                <AppointmentActions appointment={appointment} canMutate={canMutate} />
              </div>

              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl bg-[var(--nupsbox-surface)] p-3">
                  <dt className="text-xs font-bold text-[var(--nupsbox-slate)]">Thời lượng</dt>
                  <dd className="mt-1 font-bold text-[var(--nupsbox-navy)]">{appointment.durationMinutes} phút</dd>
                </div>
                <div className="rounded-xl bg-[var(--nupsbox-surface)] p-3">
                  <dt className="text-xs font-bold text-[var(--nupsbox-slate)]">Địa điểm</dt>
                  <dd className="mt-1 font-bold text-[var(--nupsbox-navy)]">{optionLabel(locationOptions, appointment.locationId)}</dd>
                </div>
                <div className="rounded-xl bg-[var(--nupsbox-surface)] p-3">
                  <dt className="text-xs font-bold text-[var(--nupsbox-slate)]">Loại kho</dt>
                  <dd className="mt-1 font-bold text-[var(--nupsbox-navy)]">{optionLabel(unitTypeOptions, appointment.unitTypeId)}</dd>
                </div>
                <div className="rounded-xl bg-[var(--nupsbox-surface)] p-3">
                  <dt className="text-xs font-bold text-[var(--nupsbox-slate)]">Phụ trách</dt>
                  <dd className="mt-1 font-bold text-[var(--nupsbox-navy)]">{assigneeLabel(assigneeOptions, appointment.assignedTo, appointment.assignedName)}</dd>
                </div>
              </dl>

              {appointment.customerNote ? (
                <div className="mt-4 rounded-xl bg-[var(--nupsbox-surface)] p-3 text-sm">
                  <p className="text-xs font-bold text-[var(--nupsbox-slate)]">Ghi chú khách hàng</p>
                  <p className="mt-1 whitespace-pre-wrap leading-6 text-[var(--nupsbox-navy)]">{appointment.customerNote}</p>
                </div>
              ) : null}
              {appointment.internalNote ? (
                <div className="mt-3 rounded-xl bg-[var(--nupsbox-surface)] p-3 text-sm">
                  <p className="text-xs font-bold text-[var(--nupsbox-slate)]">Ghi chú nội bộ</p>
                  <p className="mt-1 whitespace-pre-wrap leading-6 text-[var(--nupsbox-navy)]">{appointment.internalNote}</p>
                </div>
              ) : null}

              {canMutate && isActive ? (
                <form action={updateAppointment} className="mt-5 grid gap-4 rounded-2xl border border-dashed border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] p-4 md:grid-cols-2">
                  <input type="hidden" name="appointmentId" value={appointment.id} />
                  <input type="hidden" name="leadId" value={appointment.leadId ?? ''} />
                  <input type="hidden" name="expectedUpdatedAt" value={appointment.updatedAt} />
                  <label className="text-sm font-bold text-[var(--nupsbox-navy)]">
                    Thời gian xem
                    <input className="mt-1 min-h-11 w-full rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 text-sm" name="scheduledAtLocal" type="datetime-local" defaultValue={formatLocalDateTime(appointment.scheduledAt)} required />
                  </label>
                  <label className="text-sm font-bold text-[var(--nupsbox-navy)]">
                    Thời lượng (phút)
                    <input className="mt-1 min-h-11 w-full rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 text-sm" name="durationMinutes" type="number" min={15} max={180} step={15} defaultValue={appointment.durationMinutes} required />
                  </label>
                  <label className="text-sm font-bold text-[var(--nupsbox-navy)]">
                    Địa điểm
                    <select className="mt-1 min-h-11 w-full rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 text-sm" name="locationId" defaultValue={appointment.locationId ?? ''}>
                      <option value="">Chưa chọn</option>
                      {locationOptions.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-bold text-[var(--nupsbox-navy)]">
                    Loại kho
                    <select className="mt-1 min-h-11 w-full rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 text-sm" name="unitTypeId" defaultValue={appointment.unitTypeId ?? ''}>
                      <option value="">Chưa chọn</option>
                      {unitTypeOptions.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-bold text-[var(--nupsbox-navy)] md:col-span-2">
                    Phụ trách cuộc hẹn
                    <select className="mt-1 min-h-11 w-full rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 text-sm" name="assignedTo" defaultValue={appointment.assignedTo ?? ''}>
                      <option value="">Chưa phân công</option>
                      {assigneeOptions.map((option) => <option key={option.id} value={option.id}>{option.fullName} · {option.role}</option>)}
                    </select>
                  </label>
                  {isPending ? (
                    <label className="text-sm font-bold text-[var(--nupsbox-navy)] md:col-span-2">
                      Ghi chú khách hàng
                      <textarea className="mt-1 min-h-20 w-full rounded-xl border border-[var(--nupsbox-border)] bg-white p-3 text-sm font-normal" name="customerNote" maxLength={1000} rows={2} defaultValue={appointment.customerNote ?? ''} />
                    </label>
                  ) : null}
                  <label className="text-sm font-bold text-[var(--nupsbox-navy)] md:col-span-2">
                    Ghi chú nội bộ
                    <textarea className="mt-1 min-h-20 w-full rounded-xl border border-[var(--nupsbox-border)] bg-white p-3 text-sm font-normal" name="internalNote" maxLength={2000} rows={2} defaultValue={appointment.internalNote ?? ''} />
                  </label>
                  <div className="md:col-span-2">
                    <button type="submit" className="min-h-10 rounded-xl bg-[var(--nupsbox-navy)] px-4 text-xs font-bold text-white">Lưu thay đổi</button>
                  </div>
                </form>
              ) : null}

              <div className="mt-5 border-t border-[var(--nupsbox-border)] pt-4">
                <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--nupsbox-slate)]">Lịch sử cuộc hẹn</p>
                <div className="mt-3 grid gap-2">
                  {events.map((event) => (
                    <div key={event.id} className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl bg-[var(--nupsbox-surface)] px-3 py-2 text-xs">
                      <span className="font-bold text-[var(--nupsbox-navy)]">{eventLabels[event.eventType] ?? event.eventType}</span>
                      <span className="text-[var(--nupsbox-slate)]">{formatDate(event.createdAt)} · {event.changedByName ?? 'Hệ thống'}</span>
                    </div>
                  ))}
                  {!events.length ? <p className="text-sm text-[var(--nupsbox-slate)]">Chưa có lịch sử thay đổi.</p> : null}
                </div>
              </div>
            </article>
          );
        })}
        {!appointments.length ? <p className="py-8 text-center text-sm text-[var(--nupsbox-slate)]">Lead này chưa có cuộc hẹn.</p> : null}
      </div>
    </section>
  );
}
