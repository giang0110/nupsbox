import {isOperationalLeadStatus} from '@/features/admin/lead-status';
import {sanitizeLeadSearchTerm, type AdminLeadRow} from '@/features/admin/leads';
import type {LeadWorkspaceFilters} from '@/features/admin/lead-workspace';
import {createSupabaseServerClient} from '@/lib/supabase/server';

export const MAX_LEAD_EXPORT_ROWS = 5000;

export function buildLeadExportHref(filters: LeadWorkspaceFilters): string {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.assignee) params.set('assignee', filters.assignee);
  if (filters.source) params.set('source', filters.source);
  if (filters.q) params.set('q', filters.q);
  const query = params.toString();
  return query ? '/admin/leads/export?' + query : '/admin/leads/export';
}

function spreadsheetSafeText(value: unknown): string {
  const text = value == null ? '' : String(value);
  return /^[=+\-@\t\r]/.test(text) ? "'" + text : text;
}

export function csvCell(value: unknown): string {
  return '"' + spreadsheetSafeText(value).replace(/"/g, '""') + '"';
}

export function buildLeadCsv(
  leads: AdminLeadRow[],
  assigneeNames: Record<string, string> = {}
): string {
  const header = [
    'ID',
    'Họ tên',
    'Điện thoại',
    'Email',
    'Trạng thái',
    'Nhu cầu',
    'Ngôn ngữ',
    'Nguồn',
    'UTM Source',
    'UTM Campaign',
    'Phụ trách',
    'Tạo lúc',
    'Cập nhật lúc'
  ];

  const rows = leads.map(lead => [
    lead.id,
    lead.fullName,
    lead.phone,
    lead.email ?? '',
    lead.status,
    lead.needType,
    lead.preferredLanguage,
    lead.source ?? '',
    lead.utmSource ?? '',
    lead.utmCampaign ?? '',
    lead.assignedTo ? assigneeNames[lead.assignedTo] ?? lead.assignedTo : '',
    lead.createdAt,
    lead.updatedAt
  ]);

  return '\uFEFF' + [header, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n');
}

function mapExportLead(row: Record<string, unknown>): AdminLeadRow {
  return {
    id: String(row.id ?? ''),
    fullName: String(row.full_name ?? ''),
    phone: String(row.phone ?? ''),
    email: typeof row.email === 'string' && row.email ? row.email : null,
    message: null,
    needType: String(row.need_type ?? 'other'),
    status: isOperationalLeadStatus(row.status) ? row.status : 'new',
    preferredLanguage: row.preferred_language === 'en' ? 'en' : 'vi',
    source: typeof row.source === 'string' && row.source ? row.source : null,
    utmSource: typeof row.utm_source === 'string' && row.utm_source ? row.utm_source : null,
    utmCampaign: typeof row.utm_campaign === 'string' && row.utm_campaign ? row.utm_campaign : null,
    assignedTo: typeof row.assigned_to === 'string' && row.assigned_to ? row.assigned_to : null,
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? row.created_at ?? '')
  };
}

export async function listAdminLeadsForExport(
  filters: Pick<LeadWorkspaceFilters, 'status' | 'assignee' | 'source' | 'q'>,
  maxRows = MAX_LEAD_EXPORT_ROWS
): Promise<AdminLeadRow[]> {
  const supabase = await createSupabaseServerClient();
  const safeMax = Math.min(Math.max(maxRows, 1), MAX_LEAD_EXPORT_ROWS);
  const pageSize = 1000;
  const rows: AdminLeadRow[] = [];

  for (let offset = 0; offset < safeMax; offset += pageSize) {
    const end = Math.min(offset + pageSize - 1, safeMax - 1);
    let query = supabase
      .from('leads')
      .select('id, full_name, phone, email, need_type, status, preferred_language, source, utm_source, utm_campaign, assigned_to, created_at, updated_at')
      .order('created_at', {ascending: false})
      .range(offset, end);

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.assignee) query = query.eq('assigned_to', filters.assignee);
    if (filters.source) query = query.eq('source', filters.source);

    const search = filters.q ? sanitizeLeadSearchTerm(filters.q) : '';
    if (search) {
      query = query.or(
        'full_name.ilike.*' + search +
        '*,phone.ilike.*' + search +
        '*,email.ilike.*' + search + '*'
      );
    }

    const {data, error} = await query;
    if (error) throw error;

    const page = data ?? [];
    rows.push(...page.map(row => mapExportLead(row as Record<string, unknown>)));
    if (page.length < end - offset + 1) break;
  }

  return rows.slice(0, safeMax);
}
