import Link from 'next/link';
import {notFound, redirect} from 'next/navigation';
import {addLeadNote, assignLead} from '@/app/admin/leads/actions';
import {AppointmentWorkspace} from '@/components/admin/appointment-workspace';
import {LeadStatusForm} from '@/components/admin/lead-status-form';
import {Container} from '@/components/ui/container';
import {getAdminAppointmentWorkspace} from '@/features/admin/appointment-workspace';
import {buildLeadTimeline} from '@/features/admin/lead-timeline';
import {
  getAdminLeadDetail,
  listLeadAssignees,
  type OperationalLeadStatus
} from '@/features/admin/leads';
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
  const lead = await getAdminLeadDetail(leadId);
  if (!lead) notFound();

  const canUpdate = can(session.role, 'leads:update');
  const canAssign = can(session.role, 'leads:assign');
  const canNote = can(session.role, 'leads:note');
  const [assignees, appointmentWorkspace] = await Promise.all([
    listLeadAssignees(),
    getAdminAppointmentWorkspace(leadId)
  ]);
  const currentAssignee = assignees.find((item) => item.id === lead.assignedTo);
  const actorNames = new Map(appointmentWorkspace.assigneeOptions.map((item) => [item.id, item.label]));
  const timeline = buildLeadTimeline({
    notes: lead.notes.map((note) => ({
      id: note.id,
      note: note.note,
      authorName: note.authorId ? actorNames.get(note.authorId) ?? null : null,
      createdAt: note.createdAt
    })),
    statusHistory: lead.history.map((entry) => ({
      id: entry.id,
      fromStatus: entry.fromStatus ? statusLabels[entry.fromStatus] : null,
      toStatus: statusLabels[entry.toStatus],
      changedByName: entry.changedBy ? actorNames.get(entry.changedBy) ?? null : null,
      createdAt: entry.createdAt
    })),
    appointmentHistory: appointmentWorkspace.history.map((entry) => ({
      id: entry.id,
      eventType: entry.eventType,
      changedByName: entry.changedByName,
      createdAt: entry.createdAt
    }))
  });

  return (
    <main className="py-10 sm:py-14">
      <Container>
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
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--nupsbox-slate)]">Trạng thái</p>
            <div className="mt-3">
              {canUpdate ? <LeadStatusForm leadId={lead.id} status={lead.status} /> : <p className="font-black text-[var(--nupsbox-navy)]">{statusLabels[lead.status]}</p>}
            </div>

            <div className="mt-6 border-t border-[var(--nupsbox-border)] pt-5">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--nupsbox-slate)]">Phụ trách</p>
              {canAssign ? (
                <form action={assignLead} className="mt-3 grid gap-3">
                  <input type="hidden" name="leadId" value={lead.id} />
                  <select name="assigneeId" defaultValue={lead.assignedTo ?? ''} className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 text-sm text-[var(--nupsbox-navy)]">
                    <option value="">Chưa phân công</option>
                    {assignees.map((assignee) => (
                      <option key={assignee.id} value={assignee.id}>{assignee.fullName} · {assignee.role}</option>
                    ))}
                  </select>
                  <button type="submit" className="min-h-11 rounded-xl bg-[var(--nupsbox-navy)] px-4 text-sm font-bold text-white">Lưu phân công</button>
                </form>
              ) : (
                <p className="mt-2 text-sm font-bold text-[var(--nupsbox-navy)]">{currentAssignee?.fullName ?? (lead.assignedTo ? 'Đã phân công' : 'Chưa phân công')}</p>
              )}
              {lead.assignedTo ? <p className="mt-2 break-all text-xs text-[var(--nupsbox-slate)]">ID: {lead.assignedTo}</p> : null}
            </div>
          </aside>
        </div>

        <section className="mt-10">
          <h2 className="text-2xl font-black text-[var(--nupsbox-navy)]">Thông tin nhu cầu & nguồn</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetaItem label="Nhu cầu" value={needTypeLabels[lead.needType] ?? lead.needType} />
            <MetaItem label="Quy mô ước tính" value={volumeLabels[lead.estimatedVolume] ?? lead.estimatedVolume} />
            <MetaItem label="Địa điểm ID" value={lead.locationId} />
            <MetaItem label="Loại kho ID" value={lead.unitTypeId} />
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

        <AppointmentWorkspace leadId={lead.id} workspace={appointmentWorkspace} canMutate={canUpdate} />

        <div className="mt-10 grid gap-8 xl:grid-cols-2">
          <section className="rounded-[1.5rem] border border-[var(--nupsbox-border)] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-[var(--nupsbox-navy)]">Ghi chú nội bộ</h2>
              <span className="text-xs font-bold text-[var(--nupsbox-slate)]">{lead.notes.length}/100 gần nhất</span>
            </div>

            {canNote ? (
              <form action={addLeadNote} className="mt-5 grid gap-3">
                <input type="hidden" name="leadId" value={lead.id} />
                <label className="grid gap-2 text-sm font-bold text-[var(--nupsbox-navy)]">
                  Thêm ghi chú
                  <textarea name="note" required maxLength={2000} rows={4} className="rounded-xl border border-[var(--nupsbox-border)] bg-white p-3 font-normal" placeholder="Ví dụ: Khách muốn xem kho chiều thứ Sáu…" />
                </label>
                <button type="submit" className="w-fit rounded-xl bg-[var(--nupsbox-blue)] px-4 py-3 text-sm font-bold text-white">Lưu ghi chú</button>
              </form>
            ) : null}

            <div className="mt-6 grid gap-3">
              {lead.notes.map((note) => (
                <article key={note.id} className="rounded-2xl bg-[var(--nupsbox-surface)] p-4">
                  <p className="whitespace-pre-wrap leading-6 text-[var(--nupsbox-navy)]">{note.note}</p>
                  <p className="mt-3 text-xs text-[var(--nupsbox-slate)]">{formatDate(note.createdAt)}{note.authorId ? ` · ${actorNames.get(note.authorId) ?? note.authorId}` : ''}</p>
                </article>
              ))}
              {!lead.notes.length ? <p className="py-6 text-center text-sm text-[var(--nupsbox-slate)]">Chưa có ghi chú nội bộ.</p> : null}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-[var(--nupsbox-border)] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-[var(--nupsbox-navy)]">Timeline CRM</h2>
              <span className="text-xs font-bold text-[var(--nupsbox-slate)]">Lead + lịch hẹn</span>
            </div>
            <div className="mt-6 grid gap-3">
              {timeline.map((entry) => (
                <article key={`${entry.kind}-${entry.id}`} className="rounded-2xl border border-[var(--nupsbox-border)] p-4">
                  <p className="font-black text-[var(--nupsbox-navy)]">{entry.title}</p>
                  {entry.detail ? <p className="mt-1 text-sm text-[var(--nupsbox-navy)]">{entry.detail}</p> : null}
                  <p className="mt-2 text-xs text-[var(--nupsbox-slate)]">{formatDate(entry.createdAt)}{entry.actorName ? ` · ${entry.actorName}` : ''}</p>
                </article>
              ))}
              {!timeline.length ? <p className="py-6 text-center text-sm text-[var(--nupsbox-slate)]">Chưa có hoạt động CRM được ghi nhận.</p> : null}
            </div>
          </section>
        </div>
      </Container>
    </main>
  );
}
