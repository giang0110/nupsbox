import {
  createAppointment,
  updateAppointment
} from '@/app/admin/leads/[leadId]/actions';
import type {
  AdminAppointmentRow,
  AppointmentWorkspace as AppointmentWorkspaceModel
} from '@/features/admin/appointment-read-model';
import type {AppointmentStatus} from '@/features/appointments/domain';

const statusLabels: Record<AppointmentStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
  no_show: 'Khách không đến'
};

const eventLabels: Record<string, string> = {
  created: 'Tạo lịch hẹn',
  rescheduled: 'Đổi thời gian',
  location_changed: 'Đổi địa điểm',
  unit_type_changed: 'Đổi loại kho',
  assignee_changed: 'Đổi người phụ trách',
  status_changed: 'Đổi trạng thái',
  details_changed: 'Cập nhật chi tiết'
};

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Ho_Chi_Minh'
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function statusOptions(status: AppointmentStatus): AppointmentStatus[] {
  if (status === 'pending') return ['pending', 'confirmed', 'cancelled'];
  if (status === 'confirmed') return ['confirmed', 'completed', 'cancelled', 'no_show'];
  return [status];
}

function AppointmentEditor({
  appointment,
  workspace
}: {
  appointment: AdminAppointmentRow;
  workspace: AppointmentWorkspaceModel;
}) {
  const terminal = ['completed', 'cancelled', 'no_show'].includes(appointment.status);
  if (terminal) {
    return <p className="mt-4 text-xs font-bold text-[var(--nupsbox-slate)]">Lịch hẹn đã kết thúc và được khóa chỉnh sửa.</p>;
  }

  return (
    <form action={updateAppointment} className="mt-5 grid gap-3 border-t border-[var(--nupsbox-border)] pt-5">
      <input type="hidden" name="appointmentId" value={appointment.id} />
      <input type="hidden" name="leadId" value={appointment.leadId} />
      <input type="hidden" name="expectedUpdatedAt" value={appointment.updatedAt} />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
          Trạng thái
          <select name="status" defaultValue={appointment.status} className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 font-normal">
            {statusOptions(appointment.status).map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
          Thời lượng (phút)
          <input name="durationMinutes" type="number" min={15} max={180} step={15} defaultValue={appointment.durationMinutes} className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] px-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
          Địa điểm
          <select name="locationId" defaultValue={appointment.locationId ?? ''} className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 font-normal">
            <option value="">Chưa chọn</option>
            {workspace.locationOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
          Loại kho
          <select name="unitTypeId" defaultValue={appointment.unitTypeId ?? ''} className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 font-normal">
            <option value="">Chưa chọn</option>
            {workspace.unitTypeOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
          Người phụ trách
          <select name="assignedTo" defaultValue={appointment.assignedTo ?? ''} className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 font-normal">
            <option value="">Chưa phân công</option>
            {workspace.assigneeOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
          Giờ mới tại TP.HCM (nếu đổi)
          <input name="scheduledAt" type="datetime-local" className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] px-3 font-normal" />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
        Ghi chú khách hàng
        <textarea name="customerNote" maxLength={1000} rows={2} defaultValue={appointment.customerNote ?? ''} className="rounded-xl border border-[var(--nupsbox-border)] p-3 font-normal" />
      </label>
      <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
        Ghi chú nội bộ
        <textarea name="internalNote" maxLength={2000} rows={2} defaultValue={appointment.internalNote ?? ''} className="rounded-xl border border-[var(--nupsbox-border)] p-3 font-normal" />
      </label>
      <button type="submit" className="w-fit rounded-xl bg-[var(--nupsbox-navy)] px-4 py-3 text-sm font-bold text-white">Lưu lịch hẹn</button>
    </form>
  );
}

export function AppointmentWorkspace({
  leadId,
  workspace,
  canMutate
}: {
  leadId: string;
  workspace: AppointmentWorkspaceModel;
  canMutate: boolean;
}) {
  return (
    <section className="mt-10 rounded-[1.5rem] border border-[var(--nupsbox-border)] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black tracking-[0.14em] text-[var(--nupsbox-blue)]">LIGHT BOOKING CRM</p>
          <h2 className="mt-2 text-2xl font-black text-[var(--nupsbox-navy)]">Lịch xem kho</h2>
        </div>
        <span className="text-xs font-bold text-[var(--nupsbox-slate)]">{workspace.appointments.length} lịch hẹn</span>
      </div>

      {canMutate ? (
        <form action={createAppointment} className="mt-6 grid gap-3 rounded-2xl bg-[var(--nupsbox-surface)] p-4">
          <input type="hidden" name="leadId" value={leadId} />
          <p className="font-black text-[var(--nupsbox-navy)]">Tạo lịch hẹn mới</p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
              Thời gian tại TP.HCM
              <input name="scheduledAt" type="datetime-local" required className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 font-normal" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
              Thời lượng
              <input name="durationMinutes" type="number" min={15} max={180} step={15} defaultValue={30} className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 font-normal" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
              Địa điểm
              <select name="locationId" defaultValue="" className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 font-normal">
                <option value="">Chưa chọn</option>
                {workspace.locationOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
              Loại kho
              <select name="unitTypeId" defaultValue="" className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 font-normal">
                <option value="">Chưa chọn</option>
                {workspace.unitTypeOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
              Người phụ trách
              <select name="assignedTo" defaultValue="" className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 font-normal">
                <option value="">Chưa phân công</option>
                {workspace.assigneeOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
          </div>
          <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
            Ghi chú khách hàng
            <textarea name="customerNote" maxLength={1000} rows={2} className="rounded-xl border border-[var(--nupsbox-border)] bg-white p-3 font-normal" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
            Ghi chú nội bộ
            <textarea name="internalNote" maxLength={2000} rows={2} className="rounded-xl border border-[var(--nupsbox-border)] bg-white p-3 font-normal" />
          </label>
          <button type="submit" className="w-fit rounded-xl bg-[var(--nupsbox-blue)] px-4 py-3 text-sm font-bold text-white">Tạo lịch chờ xác nhận</button>
        </form>
      ) : null}

      <div className="mt-6 grid gap-4">
        {workspace.appointments.map((appointment) => (
          <article key={appointment.id} className="rounded-2xl border border-[var(--nupsbox-border)] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-black text-[var(--nupsbox-navy)]">{formatDate(appointment.scheduledAt)}</p>
                <p className="mt-1 text-sm text-[var(--nupsbox-slate)]">
                  {appointment.locationName ?? 'Chưa chọn địa điểm'} · {appointment.unitTypeName ?? 'Chưa chọn loại kho'} · {appointment.durationMinutes} phút
                </p>
                <p className="mt-1 text-xs text-[var(--nupsbox-slate)]">Phụ trách: {appointment.assignedName ?? 'Chưa phân công'} · Nguồn: {appointment.source === 'customer' ? 'Khách hàng' : 'Nhân viên'}</p>
              </div>
              <span className="rounded-full bg-[var(--nupsbox-surface)] px-3 py-1 text-xs font-black text-[var(--nupsbox-navy)]">{statusLabels[appointment.status]}</span>
            </div>
            {appointment.customerNote ? <p className="mt-3 text-sm text-[var(--nupsbox-navy)]">Khách: {appointment.customerNote}</p> : null}
            {appointment.internalNote ? <p className="mt-1 text-sm text-[var(--nupsbox-slate)]">Nội bộ: {appointment.internalNote}</p> : null}
            {canMutate ? <AppointmentEditor appointment={appointment} workspace={workspace} /> : null}
          </article>
        ))}
        {!workspace.appointments.length ? <p className="py-8 text-center text-sm text-[var(--nupsbox-slate)]">Lead này chưa có lịch xem kho.</p> : null}
      </div>

      {workspace.history.length ? (
        <div className="mt-8 border-t border-[var(--nupsbox-border)] pt-6">
          <h3 className="font-black text-[var(--nupsbox-navy)]">Audit lịch hẹn</h3>
          <div className="mt-3 grid gap-2">
            {workspace.history.map((entry) => (
              <div key={entry.id} className="rounded-xl bg-[var(--nupsbox-surface)] px-3 py-2 text-sm">
                <span className="font-bold text-[var(--nupsbox-navy)]">{eventLabels[entry.eventType] ?? entry.eventType}</span>
                <span className="text-[var(--nupsbox-slate)]"> · {formatDate(entry.createdAt)}{entry.changedByName ? ` · ${entry.changedByName}` : ''}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
