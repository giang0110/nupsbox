import {can} from '@/features/auth/permissions';
import {createSupabaseServerClient} from '@/lib/supabase/server';
import {getAdminLeadDetailReadModel, type AdminLeadWorkspace} from '@/features/admin/lead-detail';
import type {AppointmentStatus, AppRole, LeadStatus} from '@/types/database';

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
  assignedTo: string | null;
  assignedName: string | null;
  nextAppointment: AdminLeadNextAppointment | null;
};

export type AdminLeadNextAppointment = {
  id: string;
  scheduledAt: string;
  status: 'pending' | 'confirmed';
  overdue: boolean;
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
    createdAt: String(row.created_at ?? ''),
    assignedTo: nullableString(row.assigned_to),
    assignedName: nullableString(row.assigned_name),
    nextAppointment: null
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
    notes: notes.map(mapLeadNote),
    history: history.map(mapLeadHistory).filter((item): item is AdminLeadHistoryRow => item !== null)
  };
}

export function selectNextAppointment(
  rows: Array<{id: string; status: AppointmentStatus; scheduledAt: string}>,
  now: Date = new Date()
): AdminLeadNextAppointment | null {
  const actionable = rows
    .filter((row): row is {id: string; status: 'pending' | 'confirmed'; scheduledAt: string} =>
      row.status === 'pending' || row.status === 'confirmed'
    )
    .sort((left, right) => Date.parse(left.scheduledAt) - Date.parse(right.scheduledAt));
  const future = actionable.find((row) => Date.parse(row.scheduledAt) >= now.getTime());
  const selected = future ?? actionable.filter((row) => Date.parse(row.scheduledAt) < now.getTime()).at(-1);

  return selected ? {
    ...selected,
    overdue: selected.status === 'confirmed' && Date.parse(selected.scheduledAt) < now.getTime()
  } : null;
}

export async function listAdminLeads(
  options: {status?: OperationalLeadStatus; limit?: number} = {}
): Promise<AdminLeadRow[]> {
  const supabase = await createSupabaseServerClient();
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
  let query = supabase
    .from('leads')
    .select('id, full_name, phone, email, message, need_type, status, preferred_language, utm_source, utm_campaign, assigned_to, created_at')
    .order('created_at', {ascending: false})
    .limit(limit);

  if (options.status) query = query.eq('status', options.status);

  const {data, error} = await query;
  if (error) throw error;
  const leads = (data ?? []).map((row) => mapLeadRow(row as Record<string, unknown>));
  if (!leads.length) return leads;

  const leadIds = leads.map((lead) => lead.id);
  const assigneeIds = leads.flatMap((lead) => lead.assignedTo ? [lead.assignedTo] : []);
  const [profilesResult, appointmentsResult] = await Promise.all([
    assigneeIds.length
      ? supabase.from('profiles').select('id, full_name').eq('active', true).in('role', ['admin', 'staff']).in('id', assigneeIds)
      : Promise.resolve({data: [], error: null}),
    supabase
      .from('lead_appointments')
      .select('id, lead_id, scheduled_at, status')
      .in('lead_id', leadIds)
      .in('status', ['pending', 'confirmed'])
  ]);
  if (profilesResult.error) throw profilesResult.error;
  if (appointmentsResult.error) throw appointmentsResult.error;

  const names = new Map((profilesResult.data ?? []).map((profile) => [profile.id, nullableString(profile.full_name)]));
  const appointmentsByLead = new Map<string, Array<{id: string; status: AppointmentStatus; scheduledAt: string}>>();
  for (const appointment of appointmentsResult.data ?? []) {
    const rows = appointmentsByLead.get(appointment.lead_id) ?? [];
    rows.push({id: appointment.id, status: appointment.status, scheduledAt: appointment.scheduled_at});
    appointmentsByLead.set(appointment.lead_id, rows);
  }

  return leads.map((lead) => ({
    ...lead,
    assignedName: lead.assignedTo ? names.get(lead.assignedTo) ?? null : null,
    nextAppointment: selectNextAppointment(appointmentsByLead.get(lead.id) ?? [])
  }));
}

export async function getAdminLeadDetail(leadId: string, role: AppRole = 'viewer'): Promise<AdminLeadWorkspace | null> {
  return getAdminLeadDetailReadModel(leadId, role);
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
