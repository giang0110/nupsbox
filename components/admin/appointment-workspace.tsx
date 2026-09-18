'use client';

import {useRouter} from 'next/navigation';
import {useState, type FormEvent} from 'react';
import {
  createAppointmentValue,
  updateAppointmentValue
} from '@/app/admin/leads/[leadId]/actions';
import {AdminStatusBadge} from '@/components/admin/admin-primitives';
import type {AdminActionResult} from '@/features/admin/action-result';
import type {
  AdminAppointmentRow,
  AppointmentWorkspace as AppointmentWorkspaceModel
} from '@/features/admin/appointment-read-model';
import {selectNextAppointment} from '@/features/admin/lead-detail';
import type {AppointmentStatus} from '@/features/appointments/domain';

const statusLabels: Record<AppointmentStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
  no_show: 'Khách không đến'
};

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Ho_Chi_Minh'
});

function formatDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : dateFormatter.format(parsed);
}

function statusOptions(status: AppointmentStatus): AppointmentStatus[] {
  if (status === 'pending') return ['pending', 'confirmed', 'cancelled'];
  if (status === 'confirmed') return ['confirmed', 'completed', 'cancelled', 'no_show'];
  return [status];
}

function statusTone(
  status: AppointmentStatus
): 'neutral' | 'info' | 'success' | 'warning' | 'danger' {
  if (status === 'confirmed') return 'info';
  if (status === 'completed') return 'success';
  if (status === 'cancelled' || status === 'no_show') return 'danger';
  return 'neutral';
}

function AppointmentEditor({
  appointment,
  workspace,
  pending,
  onSubmit
}: {
  appointment: AdminAppointmentRow;
  workspace: AppointmentWorkspaceModel;
  pending: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const terminal = ['completed', 'cancelled', 'no_show'].includes(appointment.status);
  if (terminal) {
    return (
      <p className="mt-3 text-xs font-bold text-[var(--nupsbox-slate)]">
        Lịch hẹn đã kết thúc và được khóa chỉnh sửa.
      </p>
    );
  }

  return (
    <details className="mt-4 rounded-xl border border-[var(--nupsbox-border)]">
      <summary className="min-h-11 cursor-pointer px-3 py-3 text-sm font-black text-[var(--nupsbox-navy)]">
        Chỉnh sửa lịch hẹn
      </summary>
      <form
        onSubmit={onSubmit}
        className="grid gap-3 border-t border-[var(--nupsbox-border)] p-4"
      >
        <fieldset disabled={pending} className="grid gap-3">
          <input type="hidden" name="appointmentId" value={appointment.id} />
          <input type="hidden" name="leadId" value={appointment.leadId} />
          <input type="hidden" name="expectedUpdatedAt" value={appointment.updatedAt} />

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
              Trạng thái
              <select
                name="status"
                defaultValue={appointment.status}
                className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 font-normal"
              >
                {statusOptions(appointment.status).map((status) => (
                  <option key={status} value={status}>{statusLabels[status]}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
              Thời lượng (phút)
              <input
                name="durationMinutes"
                type="number"
                min={15}
                max={180}
                step={15}
                defaultValue={appointment.durationMinutes}
                className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] px-3 font-normal"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
              Địa điểm
              <select
                name="locationId"
                defaultValue={appointment.locationId ?? ''}
                className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 font-normal"
              >
                <option value="">Chưa chọn</option>
                {workspace.locationOptions.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
              Loại kho
              <select
                name="unitTypeId"
                defaultValue={appointment.unitTypeId ?? ''}
                className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 font-normal"
              >
                <option value="">Chưa chọn</option>
                {workspace.unitTypeOptions.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
              Người phụ trách
              <select
                name="assignedTo"
                defaultValue={appointment.assignedTo ?? ''}
                className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 font-normal"
              >
                <option value="">Chưa phân công</option>
                {workspace.assigneeOptions.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
              Giờ mới tại TP.HCM (nếu đổi)
              <input
                name="scheduledAt"
                type="datetime-local"
                className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] px-3 font-normal"
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
            Ghi chú khách hàng
            <textarea
              name="customerNote"
              maxLength={1000}
              rows={2}
              defaultValue={appointment.customerNote ?? ''}
              className="rounded-xl border border-[var(--nupsbox-border)] p-3 font-normal"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
            Ghi chú nội bộ
            <textarea
              name="internalNote"
              maxLength={2000}
              rows={2}
              defaultValue={appointment.internalNote ?? ''}
              className="rounded-xl border border-[var(--nupsbox-border)] p-3 font-normal"
            />
          </label>
          <button
            type="submit"
            className="min-h-11 w-fit rounded-xl bg-[var(--nupsbox-navy)] px-4 text-sm font-bold text-white disabled:opacity-60"
          >
            {pending ? 'Đang lưu…' : 'Lưu lịch hẹn'}
          </button>
        </fieldset>
      </form>
    </details>
  );
}

function AppointmentCard({
  appointment,
  workspace,
  canMutate,
  isNext,
  pending,
  onSubmit
}: {
  appointment: AdminAppointmentRow;
  workspace: AppointmentWorkspaceModel;
  canMutate: boolean;
  isNext: boolean;
  pending: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <article className="rounded-2xl border border-[var(--nupsbox-border)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-black text-[var(--nupsbox-navy)]">
              {formatDate(appointment.scheduledAt)}
            </p>
            {isNext ? <AdminStatusBadge label="Lịch gần nhất" tone="info" /> : null}
          </div>
          <p className="mt-1 text-sm text-[var(--nupsbox-slate)]">
            {appointment.locationName ?? 'Chưa chọn địa điểm'} ·{' '}
            {appointment.unitTypeName ?? 'Chưa chọn loại kho'} ·{' '}
            {appointment.durationMinutes} phút
          </p>
          <p className="mt-1 text-xs text-[var(--nupsbox-slate)]">
            Phụ trách: {appointment.assignedName ?? 'Chưa phân công'} · Nguồn:{' '}
            {appointment.source === 'customer' ? 'Khách hàng' : 'Nhân viên'}
          </p>
        </div>
        <AdminStatusBadge
          label={statusLabels[appointment.status]}
          tone={statusTone(appointment.status)}
        />
      </div>

      {appointment.customerNote ? (
        <p className="mt-3 text-sm text-[var(--nupsbox-navy)]">
          Khách: {appointment.customerNote}
        </p>
      ) : null}
      {appointment.internalNote ? (
        <p className="mt-1 text-sm text-[var(--nupsbox-slate)]">
          Nội bộ: {appointment.internalNote}
        </p>
      ) : null}

      {canMutate ? (
        <AppointmentEditor
          appointment={appointment}
          workspace={workspace}
          pending={pending}
          onSubmit={onSubmit}
        />
      ) : null}
    </article>
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
  const router = useRouter();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selected = selectNextAppointment(
    workspace.appointments.map((appointment) => ({
      id: appointment.id,
      status: appointment.status,
      scheduledAt: appointment.scheduledAt
    }))
  );
  const nextId = selected?.id ?? null;
  const orderedAppointments = [
    ...workspace.appointments.filter((appointment) => appointment.id === nextId),
    ...workspace.appointments.filter((appointment) => appointment.id !== nextId)
  ];

  async function submitAppointment(
    key: string,
    form: HTMLFormElement,
    action: (formData: FormData) => Promise<AdminActionResult>
  ) {
    setPendingKey(key);
    setError(null);

    try {
      const result = await action(new FormData(form));
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.refresh();
    } catch {
      setError('Không thể lưu lịch hẹn. Vui lòng thử lại.');
    } finally {
      setPendingKey(null);
    }
  }

  return (
    <section className="rounded-2xl border border-[var(--nupsbox-border)] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black tracking-[0.14em] text-[var(--nupsbox-blue)]">
            LIGHT BOOKING CRM
          </p>
          <h2 className="mt-2 text-2xl font-black text-[var(--nupsbox-navy)]">
            Lịch xem kho
          </h2>
        </div>
        <span className="text-xs font-bold text-[var(--nupsbox-slate)]">
          {workspace.appointments.length} lịch hẹn
        </span>
      </div>

      {canMutate ? (
        <details className="mt-5 rounded-xl border border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)]">
          <summary className="min-h-11 cursor-pointer px-4 py-3 font-black text-[var(--nupsbox-navy)]">
            Tạo lịch xem kho
          </summary>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void submitAppointment(
                'create',
                event.currentTarget,
                createAppointmentValue
              );
            }}
            className="grid gap-3 border-t border-[var(--nupsbox-border)] p-4"
          >
            <fieldset disabled={pendingKey === 'create'} className="grid gap-3">
              <input type="hidden" name="leadId" value={leadId} />
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
                  Thời gian tại TP.HCM
                  <input
                    name="scheduledAt"
                    type="datetime-local"
                    required
                    className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 font-normal"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
                  Thời lượng
                  <input
                    name="durationMinutes"
                    type="number"
                    min={15}
                    max={180}
                    step={15}
                    defaultValue={30}
                    className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 font-normal"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
                  Địa điểm
                  <select
                    name="locationId"
                    defaultValue=""
                    className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 font-normal"
                  >
                    <option value="">Chưa chọn</option>
                    {workspace.locationOptions.map((item) => (
                      <option key={item.id} value={item.id}>{item.label}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
                  Loại kho
                  <select
                    name="unitTypeId"
                    defaultValue=""
                    className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 font-normal"
                  >
                    <option value="">Chưa chọn</option>
                    {workspace.unitTypeOptions.map((item) => (
                      <option key={item.id} value={item.id}>{item.label}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
                  Người phụ trách
                  <select
                    name="assignedTo"
                    defaultValue=""
                    className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 font-normal"
                  >
                    <option value="">Chưa phân công</option>
                    {workspace.assigneeOptions.map((item) => (
                      <option key={item.id} value={item.id}>{item.label}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
                Ghi chú khách hàng
                <textarea
                  name="customerNote"
                  maxLength={1000}
                  rows={2}
                  className="rounded-xl border border-[var(--nupsbox-border)] bg-white p-3 font-normal"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
                Ghi chú nội bộ
                <textarea
                  name="internalNote"
                  maxLength={2000}
                  rows={2}
                  className="rounded-xl border border-[var(--nupsbox-border)] bg-white p-3 font-normal"
                />
              </label>
              <button
                type="submit"
                className="min-h-11 w-fit rounded-xl bg-[var(--nupsbox-blue)] px-4 text-sm font-bold text-white disabled:opacity-60"
              >
                {pendingKey === 'create'
                  ? 'Đang tạo…'
                  : 'Tạo lịch chờ xác nhận'}
              </button>
            </fieldset>
          </form>
        </details>
      ) : null}

      {error ? (
        <p
          role="alert"
          aria-live="assertive"
          className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-5 grid gap-4">
        {orderedAppointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            workspace={workspace}
            canMutate={canMutate}
            isNext={appointment.id === nextId}
            pending={pendingKey === appointment.id}
            onSubmit={(event) => {
              event.preventDefault();
              void submitAppointment(
                appointment.id,
                event.currentTarget,
                updateAppointmentValue
              );
            }}
          />
        ))}
        {!workspace.appointments.length ? (
          <p className="py-8 text-center text-sm text-[var(--nupsbox-slate)]">
            Lead này chưa có lịch xem kho.
          </p>
        ) : null}
      </div>
    </section>
  );
}
