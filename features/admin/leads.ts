import {can} from '@/features/auth/permissions';
import {createSupabaseServerClient} from '@/lib/supabase/server';
import type {AppRole, LeadStatus} from '@/types/database';

export const operationalLeadStatuses = [
  'new',
  'contacted',
  'qualified',
  'viewing',
  'negotiating',
  'won',
  'lost'
] as const satisfies readonly LeadStatus[];

export const leadStatuses = operationalLeadStatuses;
export type OperationalLeadStatus = (typeof operationalLeadStatuses)[number];

export type AdminLeadRow = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  message: string | null;
  needType: string;
  status: OperationalLeadStatus;
  preferredLanguage: 'vi' | 'en';
  utmSource: string | null;
  utmCampaign: string | null;
  createdAt: string;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isOperationalLeadStatus(value: unknown): value is OperationalLeadStatus {
  return typeof value === 'string' && (operationalLeadStatuses as readonly string[]).includes(value);
}

export function prepareLeadStatusUpdate(role: AppRole, leadId: string, status: unknown) {
  if (!can(role, 'leads:update')) throw new Error('forbidden');
  if (!uuidPattern.test(leadId)) throw new Error('invalid_lead_id');
  if (!isOperationalLeadStatus(status)) throw new Error('invalid_status');
  return {leadId, status};
}

function nullableString(value: unknown): string | null {
  return typeof value === 'string' && value.length ? value : null;
}

function mapLeadRow(row: Record<string, unknown>): AdminLeadRow {
  const status = isOperationalLeadStatus(row.status) ? row.status : 'new';
  return {
    id: String(row.id ?? ''),
    fullName: String(row.full_name ?? ''),
    phone: String(row.phone ?? ''),
    email: nullableString(row.email),
    message: nullableString(row.message),
    needType: String(row.need_type ?? 'other'),
    status,
    preferredLanguage: row.preferred_language === 'en' ? 'en' : 'vi',
    utmSource: nullableString(row.utm_source),
    utmCampaign: nullableString(row.utm_campaign),
    createdAt: String(row.created_at ?? '')
  };
}

export async function listAdminLeads(
  options: {status?: OperationalLeadStatus; limit?: number} = {}
): Promise<AdminLeadRow[]> {
  const supabase = await createSupabaseServerClient();
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
  let query = supabase
    .from('leads')
    .select('id, full_name, phone, email, message, need_type, status, preferred_language, utm_source, utm_campaign, created_at')
    .order('created_at', {ascending: false})
    .limit(limit);

  if (options.status) query = query.eq('status', options.status);

  const {data, error} = await query;
  if (error) throw error;
  return (data ?? []).map((row) => mapLeadRow(row as Record<string, unknown>));
}
