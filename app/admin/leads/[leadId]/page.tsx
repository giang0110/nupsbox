import {notFound, redirect} from 'next/navigation';
import {AdminPanel} from '@/components/admin/admin-primitives';
import {AppointmentWorkspace} from '@/components/admin/appointment-workspace';
import {LeadContactHeader} from '@/components/admin/lead-contact-header';
import {LeadContextPanels} from '@/components/admin/lead-context-panels';
import {LeadNoteForm} from '@/components/admin/lead-note-form';
import {
  LeadOperationRail,
  type LeadRailAppointment
} from '@/components/admin/lead-operation-rail';
import {Container} from '@/components/ui/container';
import {getAdminAppointmentWorkspace} from '@/features/admin/appointment-workspace';
import {
  resolveLeadReferenceLabel,
  selectNextAppointment
} from '@/features/admin/lead-detail';
import {leadStatusMeta} from '@/features/admin/lead-workspace';
import {buildLeadTimeline} from '@/features/admin/lead-timeline';
import {
  getAdminLeadDetail,
  listLeadAssignees
} from '@/features/admin/leads';
import {can} from '@/features/auth/permissions';
import {requireAdminUser} from '@/features/auth/require-admin-user';

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Ho_Chi_Minh'
});

function formatDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : dateFormatter.format(parsed);
}

export default async function AdminLeadDetailPage({
  params
}: {
  params: Promise<{leadId: string}>;
}) {
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
  const locationLabel = resolveLeadReferenceLabel(
    lead.locationId,
    appointmentWorkspace.locationOptions
  );
  const unitTypeLabel = resolveLeadReferenceLabel(
    lead.unitTypeId,
    appointmentWorkspace.unitTypeOptions
  );
  const nextAppointmentSummary = selectNextAppointment(
    appointmentWorkspace.appointments.map((appointment) => ({
      id: appointment.id,
      status: appointment.status,
      scheduledAt: appointment.scheduledAt
    }))
  );
  const nextAppointmentRow = nextAppointmentSummary
    ? appointmentWorkspace.appointments.find(
        (appointment) => appointment.id === nextAppointmentSummary.id
      )
    : null;
  const nextAppointment: LeadRailAppointment | null =
    nextAppointmentSummary && nextAppointmentRow
      ? {...nextAppointmentRow, overdue: nextAppointmentSummary.overdue}
      : null;

  const actorNames = new Map(
    appointmentWorkspace.assigneeOptions.map((item) => [item.id, item.label])
  );
  const timeline = buildLeadTimeline({
    notes: lead.notes.map((note) => ({
      id: note.id,
      note: note.note,
      authorName: note.authorId ? actorNames.get(note.authorId) ?? null : null,
      createdAt: note.createdAt
    })),
    statusHistory: lead.history.map((entry) => ({
      id: entry.id,
      fromStatus: entry.fromStatus ? leadStatusMeta[entry.fromStatus].label : null,
      toStatus: leadStatusMeta[entry.toStatus].label,
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
    <main className="py-8 sm:py-10">
      <Container>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <LeadContactHeader
            fullName={lead.fullName}
            createdAt={lead.createdAt}
            preferredLanguage={lead.preferredLanguage}
            phone={lead.phone}
            email={lead.email}
            className="xl:col-start-1 xl:row-start-1"
          />

          <LeadOperationRail
            leadId={lead.id}
            status={lead.status}
            canUpdate={canUpdate}
            canAssign={canAssign}
            assignedTo={lead.assignedTo}
            assigneeName={currentAssignee?.fullName ?? null}
            assignees={assignees}
            nextAppointment={nextAppointment}
            className="xl:col-start-2 xl:row-start-1 xl:row-span-5"
          />

          <LeadContextPanels
            lead={lead}
            locationLabel={locationLabel}
            unitTypeLabel={unitTypeLabel}
            className="min-w-0 xl:col-start-1"
          />

          <div className="min-w-0 xl:col-start-1">
            <AppointmentWorkspace
              leadId={lead.id}
              workspace={appointmentWorkspace}
              canMutate={canUpdate}
            />
          </div>

          <AdminPanel
            title="Ghi chú nội bộ"
            description="Chỉ nhân sự được phân quyền mới có thể thêm ghi chú; nội dung này không được gửi cho khách hàng."
            className="min-w-0 xl:col-start-1"
          >
            {canNote ? <LeadNoteForm leadId={lead.id} /> : null}
            <div className="mt-6 grid gap-3">
              {lead.notes.map((note) => (
                <article
                  key={note.id}
                  className="rounded-xl bg-[var(--nupsbox-surface)] p-4"
                >
                  <p className="whitespace-pre-wrap leading-6 text-[var(--nupsbox-navy)]">
                    {note.note}
                  </p>
                  <p className="mt-3 text-xs text-[var(--nupsbox-slate)]">
                    {formatDate(note.createdAt)}
                    {note.authorId
                      ? ' · ' + (actorNames.get(note.authorId) ?? 'Nhân sự')
                      : ''}
                  </p>
                </article>
              ))}
              {!lead.notes.length ? (
                <p className="py-5 text-center text-sm text-[var(--nupsbox-slate)]">
                  Chưa có ghi chú nội bộ.
                </p>
              ) : null}
            </div>
          </AdminPanel>

          <AdminPanel
            title="Timeline CRM"
            description="Lịch sử lead, ghi chú nội bộ và thay đổi lịch hẹn theo thứ tự thời gian."
            className="min-w-0 xl:col-start-1"
          >
            <div className="grid gap-3">
              {timeline.map((entry) => (
                <article
                  key={entry.kind + '-' + entry.id}
                  className="rounded-xl border border-[var(--nupsbox-border)] p-4"
                >
                  <p className="font-black text-[var(--nupsbox-navy)]">{entry.title}</p>
                  {entry.detail ? (
                    <p className="mt-1 text-sm text-[var(--nupsbox-navy)]">{entry.detail}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-[var(--nupsbox-slate)]">
                    {formatDate(entry.createdAt)}
                    {entry.actorName ? ' · ' + entry.actorName : ''}
                  </p>
                </article>
              ))}
              {!timeline.length ? (
                <p className="py-5 text-center text-sm text-[var(--nupsbox-slate)]">
                  Chưa có hoạt động CRM được ghi nhận.
                </p>
              ) : null}
            </div>
          </AdminPanel>
        </div>
      </Container>
    </main>
  );
}
