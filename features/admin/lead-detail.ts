import {can} from '@/features/auth/permissions';
import {buildLeadTimeline, type LeadTimelineItem} from '@/features/admin/lead-timeline';
import {
  isOperationalLeadStatus,
  projectAdminLeadDetail,
  selectNextAppointment,
  type AdminLeadDetail,
  type AdminLeadHistoryRow,
  type LeadAssigneeOption,
  type OperationalLeadStatus
} from '@/features/admin/leads';
import {createSupabaseServerClient} from '@/lib/supabase/server';
import type {AppointmentSource, AppointmentStatus, AppRole} from '@/types/database';

export type AdminLeadAppointment = {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  source: AppointmentSource;
  locationId: string | null;
  unitTypeId: string | null;
  assignedTo: string | null;
  assignedName: string | null;
  customerNote: string | null;
  internalNote: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminAppointmentHistoryRow = {
  id: string;
  appointmentId: string;
  eventType: string;
  changedBy: string | null;
  changedByName: string | null;
  createdAt: string;
};

export type AdminLeadWorkspace = AdminLeadDetail & {
  lead: AdminLeadDetail;
  appointments: AdminLeadAppointment[];
  statusHistory: Array<AdminLeadHistoryRow & {changedByName: string | null}>;
  appointmentHistory: AdminAppointmentHistoryRow[];
  assigneeOptions: LeadAssigneeOption[];
  locationOptions: Array<{id: string; name: string}>;
  unitTypeOptions: Array<{id: string; name: string}>;
  timeline: LeadTimelineItem[];
  canMutateAppointments: boolean;
  canAssignLead: boolean;
  canAddNote: boolean;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function nullableString(value: unknown): string | null {
  return typeof value === 'string' && value.length ? value : null;
}

function profileName(profiles: Map<string, string | null>, id: string | null): string | null {
  return id ? profiles.get(id) ?? null : null;
}

export async function getAdminLeadDetailReadModel(leadId: string, role: AppRole = 'viewer'): Promise<AdminLeadWorkspace | null> {
  if (!uuidPattern.test(leadId)) return null;

  const supabase = await createSupabaseServerClient();
  const {data: lead, error: leadError} = await supabase
    .from('leads')
    .select('id, full_name, phone, email, message, need_type, estimated_volume, preferred_language, location_id, unit_type_id, source, utm_source, utm_medium, utm_campaign, utm_content, landing_page, referrer, status, assigned_to, created_at')
    .eq('id', leadId)
    .maybeSingle();
  if (leadError) throw leadError;
  if (!lead) return null;

  const [notesResult, statusResult, appointmentsResult, profilesResult, locationsResult, unitTypesResult] = await Promise.all([
    supabase.from('lead_notes').select('id, note, author_id, created_at').eq('lead_id', leadId).order('created_at', {ascending: false}).limit(100),
    supabase.from('lead_status_history').select('id, from_status, to_status, changed_by, created_at').eq('lead_id', leadId).order('created_at', {ascending: false}).limit(100),
    supabase.from('lead_appointments').select('id, scheduled_at, duration_minutes, status, source, location_id, unit_type_id, assigned_to, customer_note, internal_note, created_at, updated_at').eq('lead_id', leadId).order('scheduled_at', {ascending: false}),
    supabase.from('profiles').select('id, full_name, role').eq('active', true).in('role', ['admin', 'staff']).order('full_name', {ascending: true}),
    supabase.from('locations').select('id, name_vi, name_en').eq('status', 'active').order('name_vi', {ascending: true}),
    supabase.from('unit_types').select('id, name_vi, name_en').eq('active', true).order('name_vi', {ascending: true})
  ]);
  for (const result of [notesResult, statusResult, appointmentsResult, profilesResult, locationsResult, unitTypesResult]) {
    if (result.error) throw result.error;
  }

  const appointmentIds = (appointmentsResult.data ?? []).map((appointment) => appointment.id);
  const historyResult = appointmentIds.length
    ? await supabase.from('lead_appointment_history').select('id, appointment_id, event_type, changed_by, created_at').in('appointment_id', appointmentIds).order('created_at', {ascending: false})
    : {data: [], error: null};
  if (historyResult.error) throw historyResult.error;

  const profileNames = new Map((profilesResult.data ?? []).map((profile) => [profile.id, nullableString(profile.full_name)]));
  const notes = (notesResult.data ?? []).map((row) => ({
    id: row.id, note: row.note, authorId: row.author_id, authorName: profileName(profileNames, row.author_id), createdAt: row.created_at
  }));
  const statusHistory = (statusResult.data ?? []).flatMap((row) => isOperationalLeadStatus(row.to_status) ? [{
    id: row.id,
    fromStatus: isOperationalLeadStatus(row.from_status) ? row.from_status : null,
    toStatus: row.to_status as OperationalLeadStatus,
    changedBy: row.changed_by,
    changedByName: profileName(profileNames, row.changed_by),
    createdAt: row.created_at
  }] : []);
  const appointments = (appointmentsResult.data ?? []).map((row) => ({
    id: row.id, scheduledAt: row.scheduled_at, durationMinutes: row.duration_minutes, status: row.status,
    source: row.source, locationId: row.location_id, unitTypeId: row.unit_type_id, assignedTo: row.assigned_to,
    assignedName: profileName(profileNames, row.assigned_to), customerNote: row.customer_note,
    internalNote: row.internal_note, createdAt: row.created_at, updatedAt: row.updated_at
  }));
  const appointmentHistory = (historyResult.data ?? []).map((row) => ({
    id: row.id, appointmentId: row.appointment_id, eventType: row.event_type, changedBy: row.changed_by,
    changedByName: profileName(profileNames, row.changed_by), createdAt: row.created_at
  }));
  const flatLead = projectAdminLeadDetail(lead, notes, statusHistory);
  const assigneeOptions = (profilesResult.data ?? []).flatMap((profile) => profile.role === 'admin' || profile.role === 'staff' ? [{
    id: profile.id, fullName: nullableString(profile.full_name) ?? profile.id, role: profile.role
  }] : []);
  const workspace: AdminLeadWorkspace = {
    ...flatLead,
    assignedName: profileName(profileNames, flatLead.assignedTo),
    nextAppointment: selectNextAppointment(appointments),
    lead: flatLead,
    appointments,
    notes,
    statusHistory,
    appointmentHistory,
    assigneeOptions,
    locationOptions: (locationsResult.data ?? []).map((row) => ({id: row.id, name: nullableString(row.name_vi) ?? nullableString(row.name_en) ?? row.id})),
    unitTypeOptions: (unitTypesResult.data ?? []).map((row) => ({id: row.id, name: nullableString(row.name_vi) ?? nullableString(row.name_en) ?? row.id})),
    timeline: buildLeadTimeline({notes, statusHistory, appointmentHistory}),
    canMutateAppointments: can(role, 'leads:update'),
    canAssignLead: can(role, 'leads:assign'),
    canAddNote: can(role, 'leads:note')
  };
  return workspace;
}
