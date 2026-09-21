import Link from 'next/link';
import {notFound, redirect} from 'next/navigation';
import {AppointmentForm} from '@/components/admin/appointment-form';
import {AppointmentList} from '@/components/admin/appointment-list';
import {LeadAssigneeForm} from '@/components/admin/lead-assignee-form';
import {LeadNoteForm} from '@/components/admin/lead-note-form';
import {LeadStatusForm} from '@/components/admin/lead-status-form';
import {LeadTimeline} from '@/components/admin/lead-timeline';
import {getAdminLeadDetail, type OperationalLeadStatus} from '@/features/admin/leads';
import {can} from '@/features/auth/permissions';
import {requireAdminUser} from '@/features/auth/require-admin-user';

const statusLabels: Record<OperationalLeadStatus, string> = {
  new: 'Mới',
  contacted: 'Đã liên hệ',
  qualified: 'Đã xác nhận nhu cầu',
  viewing: 'Đang xem kho',
  negotiating: 'Đang thương lượng',
  won: 'Đã thuê',
  lost: 'Không chuyển đổi'
};

const appointmentStatusLabels = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  completed: 'Hoàn tất',
  cancelled: 'Đã huỷ',
  no_show: 'Không đến'
} as const;

const needTypeLabels: Record<string, string> = {
  shop_online: 'Bán hàng online',
  sme: 'Doanh nghiệp nhỏ / SME',
  inventory: 'Lưu hàng hóa / tồn kho',
  personal: 'Đồ dùng cá nhân',
  documents: 'Hồ sơ / tài liệu',
  other: 'Nhu cầu khác'
};

const volumeLabels: Record<string, string> = {
  under_20_boxes: 'Dưới 20 thùng',
  boxes_20_50: '20–50 thùng',
  over_50_boxes: 'Trên 50 thùng',
  unknown: 'Chưa xác định'
};

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Ho_Chi_Minh'
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function optionName(options: Array<{id: string; name: string}>, id: string | null) {
  if (!id) return 'Chưa chọn';
  return options.find((option) => option.id === id)?.name ?? id;
}

function MetaItem({label, value}: {label: string; value: string | null | undefined}) {
  return (
    <div className="rounded-2xl border border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--nupsbox-slate)]">{label}</p>
      <p className="mt-2 break-words font-bold text-[var(--nupsbox-navy)]">{value || 'Chưa có'}</p>
    </div>
  );
}

export default async function AdminLeadDetailPage({params}: {params: Promise<{leadId: string}>}) {
  const session = await requireAdminUser();
  if (!can(session.role, 'leads:read')) redirect('/admin');

  const {leadId} = await params;
  const detail = await getAdminLeadDetail(leadId, session.role);
  if (!detail) notFound();

  const lead = detail.lead;
  const locationName = optionName(detail.locationOptions, lead.locationId);
  const unitTypeName = optionName(detail.unitTypeOptions, lead.unitTypeId);

  return (
    <main className="py-10 sm:py-14">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <Link href="/admin/leads" className="text-sm font-bold text-[var(--nupsbox-blue)]">← Danh sách lead</Link>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <section>
            <p className="text-xs font-black tracking-[0.16em] text-[var(--nupsbox-blue)]">CRM · LEAD DETAIL</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] text-[var(--nupsbox-navy)] sm:text-5xl">{lead.fullName}</h1>
            <p className="mt-4 text-[var(--nupsbox-slate)]">Tiếp nhận {formatDate(lead.createdAt)} · Ngôn ngữ {lead.preferredLanguage.toUpperCase()}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={`tel:${lead.phone}`} className="rounded-xl bg-[var(--nupsbox-blue)] px-4 py-3 text-sm font-bold text-white">Gọi {lead.phone}</a>
              {lead.email ? <a href={`mailto:${lead.email}`} className="rounded-xl border border-[var(--nupsbox-border)] bg-white px-4 py-3 text-sm font-bold text-[var(--nupsbox-navy)]">{lead.email}</a> : null}
            </div>
          </section>

          <aside className="rounded-[1.5rem] border border-[var(--nupsbox-border)] bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--nupsbox-slate)]">Trạng thái lead</p>
            <div className="mt-3">
              {detail.canMutateAppointments ? <LeadStatusForm leadId={lead.id} status={lead.status} /> : <p className="font-black text-[var(--nupsbox-navy)]">{statusLabels[lead.status]}</p>}
            </div>

            <div className="mt-6 border-t border-[var(--nupsbox-border)] pt-5">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--nupsbox-slate)]">Phụ trách lead</p>
              {detail.canAssignLead ? (
                <LeadAssigneeForm leadId={lead.id} assignedTo={lead.assignedTo} options={detail.assigneeOptions} />
              ) : (
                <p className="mt-3 text-sm font-bold text-[var(--nupsbox-navy)]">{lead.assignedName ?? lead.assignedTo ?? 'Chưa phân công'}</p>
              )}
            </div>
          </aside>
        </div>

        <section className="mt-10">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--nupsbox-blue)]">Customer summary</p>
          <h2 className="mt-2 text-2xl font-black text-[var(--nupsbox-navy)]">Thông tin khách hàng & nhu cầu</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetaItem label="Họ và tên" value={lead.fullName} />
            <MetaItem label="Điện thoại" value={lead.phone} />
            <MetaItem label="Email" value={lead.email} />
            <MetaItem label="Nhu cầu" value={needTypeLabels[lead.needType] ?? lead.needType} />
            <MetaItem label="Quy mô ước tính" value={volumeLabels[lead.estimatedVolume] ?? lead.estimatedVolume} />
            <MetaItem label="Địa điểm mong muốn" value={locationName} />
            <MetaItem label="Loại kho mong muốn" value={unitTypeName} />
            <MetaItem label="Nguồn" value={lead.source} />
            <MetaItem label="UTM source" value={lead.utmSource} />
            <MetaItem label="UTM medium" value={lead.utmMedium} />
            <MetaItem label="UTM campaign" value={lead.utmCampaign} />
            <MetaItem label="UTM content" value={lead.utmContent} />
            <MetaItem label="Landing page" value={lead.landingPage} />
            <MetaItem label="Referrer" value={lead.referrer} />
          </div>
          {lead.message ? (
            <div className="mt-5 rounded-[1.5rem] border border-[var(--nupsbox-border)] bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--nupsbox-slate)]">Tin nhắn khách hàng</p>
              <p className="mt-3 whitespace-pre-wrap leading-7 text-[var(--nupsbox-navy)]">{lead.message}</p>
            </div>
          ) : null}
        </section>

        <section className="mt-10 rounded-[1.5rem] border border-[var(--nupsbox-border)] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--nupsbox-blue)]">Next appointment</p>
              <h2 className="mt-2 text-2xl font-black text-[var(--nupsbox-navy)]">Cuộc hẹn tiếp theo</h2>
            </div>
            {detail.nextAppointment ? <span className="rounded-full bg-[var(--nupsbox-surface)] px-3 py-1 text-xs font-bold text-[var(--nupsbox-slate)]">{appointmentStatusLabels[detail.nextAppointment.status]}</span> : null}
          </div>
          {detail.nextAppointment ? (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[var(--nupsbox-surface)] p-4">
              <div>
                <p className="font-black text-[var(--nupsbox-navy)]">{formatDate(detail.nextAppointment.scheduledAt)}</p>
                <p className="mt-1 text-sm text-[var(--nupsbox-slate)]">Mã lịch: {detail.nextAppointment.id}</p>
              </div>
              {detail.nextAppointment.overdue ? <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">Quá hạn</span> : null}
            </div>
          ) : <p className="mt-5 text-sm text-[var(--nupsbox-slate)]">Chưa có cuộc hẹn đang chờ xử lý.</p>}
        </section>

        {detail.canMutateAppointments ? (
          <section className="mt-8">
            <AppointmentForm
              leadId={lead.id}
              defaultAssignedTo={lead.assignedTo}
              assigneeOptions={detail.assigneeOptions}
              locationOptions={detail.locationOptions}
              unitTypeOptions={detail.unitTypeOptions}
            />
          </section>
        ) : null}

        <div className="mt-8">
          <AppointmentList
            appointments={detail.appointments}
            appointmentHistory={detail.appointmentHistory}
            canMutate={detail.canMutateAppointments}
            assigneeOptions={detail.assigneeOptions}
            locationOptions={detail.locationOptions}
            unitTypeOptions={detail.unitTypeOptions}
          />
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-2">
          <section className="rounded-[1.5rem] border border-[var(--nupsbox-border)] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--nupsbox-blue)]">Notes</p>
                <h2 className="mt-2 text-2xl font-black text-[var(--nupsbox-navy)]">Ghi chú nội bộ</h2>
              </div>
              <span className="text-xs font-bold text-[var(--nupsbox-slate)]">{lead.notes.length}/100 gần nhất</span>
            </div>
            {detail.canAddNote ? <LeadNoteForm leadId={lead.id} /> : null}
            <div className="mt-6 grid gap-3">
              {lead.notes.map((note) => (
                <article key={note.id} className="rounded-2xl bg-[var(--nupsbox-surface)] p-4">
                  <p className="whitespace-pre-wrap leading-6 text-[var(--nupsbox-navy)]">{note.note}</p>
                  <p className="mt-3 text-xs text-[var(--nupsbox-slate)]">{formatDate(note.createdAt)}{note.authorId ? ` · ${note.authorId}` : ''}</p>
                </article>
              ))}
              {!lead.notes.length ? <p className="py-6 text-center text-sm text-[var(--nupsbox-slate)]">Chưa có ghi chú nội bộ.</p> : null}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-[var(--nupsbox-border)] bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--nupsbox-blue)]">Lead history</p>
            <h2 className="mt-2 text-2xl font-black text-[var(--nupsbox-navy)]">Lịch sử trạng thái lead</h2>
            <div className="mt-6 grid gap-3">
              {detail.statusHistory.map((entry) => (
                <article key={entry.id} className="rounded-2xl border border-[var(--nupsbox-border)] p-4">
                  <p className="font-black text-[var(--nupsbox-navy)]">{entry.fromStatus ? statusLabels[entry.fromStatus] : 'Khởi tạo'} → {statusLabels[entry.toStatus]}</p>
                  <p className="mt-2 text-xs text-[var(--nupsbox-slate)]">{formatDate(entry.createdAt)} · {entry.changedByName ?? entry.changedBy ?? 'Hệ thống'}</p>
                </article>
              ))}
              {!detail.statusHistory.length ? <p className="py-6 text-center text-sm text-[var(--nupsbox-slate)]">Chưa có thay đổi trạng thái được ghi nhận.</p> : null}
            </div>
          </section>
        </div>

        <div className="mt-8">
          <LeadTimeline items={detail.timeline} />
        </div>
      </div>
    </main>
  );
}
