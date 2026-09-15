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

export type AdminLeadNoteRow = {
  id: string;
  note: string;
  authorId: string | null;
  createdAt: string;
};

export type AdminLeadHistoryRow = {
  id: string;
  fromStatus: OperationalLeadStatus | null;
  toStatus: OperationalLeadStatus;
  changedBy: string | null;
  createdAt: string;
};

export type AdminLeadDetail = AdminLeadRow & {
  estimatedVolume: string;
  locationId: string | null;
  unitTypeId: string | null;
  source: string | null;
  utmMedium: string | null;
  utmContent: string | null;
  landingPage: string | null;
  referrer: string | null;
  assignedTo: string | null;
  notes: AdminLeadNoteRow[];
  history: AdminLeadHistoryRow[];
};

export type LeadAssigneeOption = {
  id: string;
  fullName: string;
  role: 'admin' | 'staff';
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const maxLeadNoteLength = 2000;

export function isOperationalLeadStatus(value: unknown): value is OperationalLeadStatus {
  return typeof value === 'string' && (operationalLeadStatuses as readonly string[]).includes(value);
}

export function prepareLeadStatusUpdate(role: AppRole, leadId: string, status: unknown) {
  if (!can(role, 'leads:update')) throw new Error('forbidden');
  if (!uuidPattern.test(leadId)) throw new Error('invalid_lead_id');
  if (!isOperationalLeadStatus(status)) throw new Error('invalid_status');
  return {leadId, status};
}

export function prepareLeadAssignment(role: AppRole, leadId: string, assigneeId: string | null) {
  if (!can(role, 'leads:assign')) throw new Error('forbidden');
  if (!uuidPattern.test(leadId)) throw new Error('invalid_lead_id');
  if (assigneeId !== null && !uuidPattern.test(assigneeId)) throw new Error('invalid_assignee_id');
  return {leadId, assigneeId};
}

export function prepareLeadNote(role: AppRole, leadId: string, note: unknown) {
  if (!can(role, 'leads:note')) throw new Error('forbidden');
  if (!uuidPattern.test(leadId)) throw new Error('invalid_lead_id');
  if (typeof note !== 'string') throw new Error('invalid_note');

  const normalizedNote = note.trim();
  if (!normalizedNote || normalizedNote.length > maxLeadNoteLength) throw new Error('invalid_note');
  return {leadId, note: normalizedNote};
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

function mapLeadNote(row: Record<string, unknown>): AdminLeadNoteRow {
  return {
    id: String(row.id ?? ''),
    note: String(row.note ?? ''),
    authorId: nullableString(row.author_id),
    createdAt: String(row.created_at ?? '')
  };
}

function mapLeadHistory(row: Record<string, unknown>): AdminLeadHistoryRow | null {
  if (!isOperationalLeadStatus(row.to_status)) return null;
  return {
    id: String(row.id ?? ''),
    fromStatus: isOperationalLeadStatus(row.from_status) ? row.from_status : null,
    toStatus: row.to_status,
    changedBy: nullableString(row.changed_by),
    createdAt: String(row.created_at ?? '')
  };
}

export function projectAdminLeadDetail(
  lead: Record<string, unknown>,
  notes: Record<string, unknown>[],
  history: Record<string, unknown>[]
): AdminLeadDetail {
  return {
    ...mapLeadRow(lead),
    estimatedVolume: String(lead.estimated_volume ?? 'unknown'),
    locationId: nullableString(lead.location_id),
    unitTypeId: nullableString(lead.unit_type_id),
    source: nullableString(lead.source),
    utmMedium: nullableString(lead.utm_medium),
    utmContent: nullableString(lead.utm_content),
    landingPage: nullableString(lead.landing_page),
    referrer: nullableString(lead.referrer),
    assignedTo: nullableString(lead.assigned_to),
    notes: notes.map(mapLeadNote),
    history: history.map(mapLeadHistory).filter((item): item is AdminLeadHistoryRow => item !== null)
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

export async function getAdminLeadDetail(leadId: string): Promise<AdminLeadDetail | null> {
  if (!uuidPattern.test(leadId)) return null;

  const supabase = await createSupabaseServerClient();
  const {data: lead, error: leadError} = await supabase
    .from('leads')
    .select('id, full_name, phone, email, message, need_type, estimated_volume, preferred_language, location_id, unit_type_id, source, utm_source, utm_medium, utm_campaign, utm_content, landing_page, referrer, status, assigned_to, created_at')
    .eq('id', leadId)
    .maybeSingle();

  if (leadError) throw leadError;
  if (!lead) return null;

  const [notesResult, historyResult] = await Promise.all([
    supabase
      .from('lead_notes')
      .select('id, note, author_id, created_at')
      .eq('lead_id', leadId)
      .order('created_at', {ascending: false})
      .limit(100),
    supabase
      .from('lead_status_history')
      .select('id, from_status, to_status, changed_by, created_at')
      .eq('lead_id', leadId)
      .order('created_at', {ascending: false})
      .limit(100)
  ]);

  if (notesResult.error) throw notesResult.error;
  if (historyResult.error) throw historyResult.error;

  return projectAdminLeadDetail(
    lead as Record<string, unknown>,
    (notesResult.data ?? []) as Record<string, unknown>[],
    (historyResult.data ?? []) as Record<string, unknown>[]
  );
}

export async function listLeadAssignees(): Promise<LeadAssigneeOption[]> {
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('active', true)
    .in('role', ['admin', 'staff'])
    .order('full_name', {ascending: true});

  if (error) throw error;

  return (data ?? []).flatMap((row) => {
    if (row.role !== 'admin' && row.role !== 'staff') return [];
    return [{
      id: row.id,
      fullName: row.full_name?.trim() || row.id,
      role: row.role
    }];
  });
}
