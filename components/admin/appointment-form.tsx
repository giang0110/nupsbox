import {createAppointment} from '@/app/admin/leads/[leadId]/actions';

type Option = {id: string; name: string};
type AssigneeOption = {id: string; fullName: string; role: 'admin' | 'staff'};

type Props = {
  leadId: string;
  defaultAssignedTo: string | null;
  assigneeOptions: AssigneeOption[];
  locationOptions: Option[];
  unitTypeOptions: Option[];
};

const inputClass =
  'mt-1 min-h-11 w-full rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 text-sm text-[var(--nupsbox-navy)]';

export function AppointmentForm({
  leadId,
  defaultAssignedTo,
  assigneeOptions,
  locationOptions,
  unitTypeOptions
}: Props) {
  return (
    <section className="rounded-[1.5rem] border border-[var(--nupsbox-border)] bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--nupsbox-blue)]">Tạo lịch xem</p>
        <h2 className="mt-2 text-2xl font-black text-[var(--nupsbox-navy)]">Thêm cuộc hẹn mới</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--nupsbox-slate)]">
          Lịch do nhân viên tạo luôn bắt đầu ở trạng thái chờ xác nhận. Thời gian được hiểu theo giờ Thành phố Hồ Chí Minh.
        </p>
      </div>

      <form action={createAppointment} className="mt-5 grid gap-4 md:grid-cols-2">
        <input type="hidden" name="leadId" value={leadId} />
        <label className="text-sm font-bold text-[var(--nupsbox-navy)]">
          Thời gian xem
          <input className={inputClass} name="scheduledAtLocal" type="datetime-local" required />
        </label>
        <label className="text-sm font-bold text-[var(--nupsbox-navy)]">
          Thời lượng (phút)
          <input className={inputClass} name="durationMinutes" type="number" min={15} max={180} step={15} defaultValue={30} required />
        </label>
        <label className="text-sm font-bold text-[var(--nupsbox-navy)]">
          Địa điểm
          <select className={inputClass} name="locationId" defaultValue="">
            <option value="">Chưa chọn</option>
            {locationOptions.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-bold text-[var(--nupsbox-navy)]">
          Loại kho
          <select className={inputClass} name="unitTypeId" defaultValue="">
            <option value="">Chưa chọn</option>
            {unitTypeOptions.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-bold text-[var(--nupsbox-navy)] md:col-span-2">
          Nhân viên phụ trách cuộc hẹn
          <select className={inputClass} name="assignedTo" defaultValue={defaultAssignedTo ?? ''}>
            <option value="">Chưa phân công</option>
            {assigneeOptions.map((option) => <option key={option.id} value={option.id}>{option.fullName} · {option.role}</option>)}
          </select>
        </label>
        <label className="text-sm font-bold text-[var(--nupsbox-navy)] md:col-span-2">
          Ghi chú của khách hàng
          <textarea className={`${inputClass} min-h-24 py-3 font-normal`} name="customerNote" maxLength={1000} rows={3} />
        </label>
        <label className="text-sm font-bold text-[var(--nupsbox-navy)] md:col-span-2">
          Ghi chú nội bộ
          <textarea className={`${inputClass} min-h-24 py-3 font-normal`} name="internalNote" maxLength={2000} rows={3} />
        </label>
        <div className="md:col-span-2">
          <button type="submit" className="min-h-11 rounded-xl bg-[var(--nupsbox-blue)] px-5 text-sm font-bold text-white">
            Tạo lịch chờ xác nhận
          </button>
        </div>
      </form>
    </section>
  );
}
