import type {NextRequest} from 'next/server';
import {
  buildLeadCsv,
  listAdminLeadsForExport,
  MAX_LEAD_EXPORT_ROWS
} from '@/features/admin/lead-export';
import {normalizeLeadWorkspaceQuery} from '@/features/admin/lead-workspace';
import {listLeadAssignees} from '@/features/admin/leads';
import {can} from '@/features/auth/permissions';
import {requireAdminUser} from '@/features/auth/require-admin-user';

export async function GET(request: NextRequest) {
  const session = await requireAdminUser();
  if (!can(session.role, 'leads:export')) {
    return Response.json({ok: false, error: 'forbidden'}, {status: 403});
  }

  const rawParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  const filters = normalizeLeadWorkspaceQuery(rawParams);
  const [leads, assignees] = await Promise.all([
    listAdminLeadsForExport(filters, MAX_LEAD_EXPORT_ROWS),
    listLeadAssignees()
  ]);
  const assigneeNames = Object.fromEntries(
    assignees.map(assignee => [assignee.id, assignee.fullName])
  );
  const csv = buildLeadCsv(leads, assigneeNames);
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="nupsbox-leads-${date}.csv"`,
      'cache-control': 'private, no-store'
    }
  });
}
