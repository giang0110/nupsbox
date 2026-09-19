import {redirect} from 'next/navigation';
import {AdminPageHeader} from '@/components/admin/admin-page-header';
import {LeadFilterBar} from '@/components/admin/lead-filter-bar';
import {LeadList} from '@/components/admin/lead-list';
import {LeadPipeline} from '@/components/admin/lead-pipeline';
import {Container} from '@/components/ui/container';
import {listAdminLeadAppointmentSummaries} from '@/features/admin/lead-appointment-summary';
import {buildLeadExportHref} from '@/features/admin/lead-export';
import {normalizeLeadWorkspaceQuery} from '@/features/admin/lead-workspace';
import {
  listAdminLeads,
  listAdminLeadSources,
  listLeadAssignees
} from '@/features/admin/leads';
import {can} from '@/features/auth/permissions';
import {requireAdminUser} from '@/features/auth/require-admin-user';

export default async function AdminLeadsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAdminUser();
  if (!can(session.role, 'leads:read')) redirect('/admin');

  const query = normalizeLeadWorkspaceQuery(await searchParams);
  const [leads, assignees, sources] = await Promise.all([
    listAdminLeads({
      status: query.status,
      assignee: query.assignee,
      source: query.source,
      q: query.q,
      limit: 100
    }),
    listLeadAssignees(),
    listAdminLeadSources()
  ]);
  const appointmentSummaries =
    query.view === 'pipeline'
      ? await listAdminLeadAppointmentSummaries(leads.map((lead) => lead.id))
      : {};
  const assigneeNames = Object.fromEntries(
    assignees.map((item) => [item.id, item.fullName])
  );
  const canUpdate = can(session.role, 'leads:update');
  const canExport = can(session.role, 'leads:export');
  const exportHref = buildLeadExportHref(query);

  return (
    <main className="py-8 sm:py-10">
      <Container className="grid gap-6">
        <AdminPageHeader
          eyebrow="CRM"
          title="Khách hàng tiềm năng"
          description="Tìm, lọc và xử lý lead theo cùng một trạng thái workspace có thể chia sẻ bằng URL."
          actions={canExport ? (
            <a
              href={exportHref}
              className="inline-flex min-h-11 items-center rounded-xl bg-[var(--nupsbox-navy)] px-4 text-sm font-bold text-white"
            >
              Xuất CSV theo bộ lọc
            </a>
          ) : null}
        />

        <LeadFilterBar filters={query} assignees={assignees} sources={sources} />

        <p className="text-sm text-[var(--nupsbox-slate)]">
          Tối đa 100 lead mới nhất phù hợp bộ lọc hiện tại.
          {query.view === 'pipeline'
            ? ' Kéo ngang để xem đủ bảy cột trên màn hình hẹp.'
            : ''}
        </p>

        {query.view === 'pipeline' ? (
          <LeadPipeline
            leads={leads}
            assigneeNames={assigneeNames}
            appointmentSummaries={appointmentSummaries}
            canUpdate={canUpdate}
          />
        ) : (
          <LeadList
            leads={leads}
            assigneeNames={assigneeNames}
            canUpdate={canUpdate}
          />
        )}
      </Container>
    </main>
  );
}
