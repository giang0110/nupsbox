import {appointmentStatuses, type AppointmentStatus} from '@/features/appointments/domain';
import {createSupabaseServerClient} from '@/lib/supabase/server';
import type {Json} from '@/types/database';

export type AppointmentSource = 'customer' | 'staff';

export type AdminAppointmentRow = {
  id: string;
  leadId: string;
  locationId: string | null;
  unitTypeId: string | null;
  assignedTo: string | null;
  scheduledAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  source: AppointmentSource;
  customerNote: string | null;
  internalNote: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminAppointmentHistoryRow = {
  id: string;
  appointmentId: string;
  leadId: string;
  changedBy: string | null;
  eventType: string;
  beforeState: Json | null;
  afterState: Json;
  createdAt: string;
};

export type AppointmentLocationOption = {
  id: string;
  name: string;
};

export type AppointmentUnitTypeOption = {
  id: string;
  name: string;
};

type Phase2RowsResult = {
  data: Record<string, unknown>[] | null;
  error: unknown | null;
};

type Phase2SingleResult = {
  data: Record<string, unknown> | null;
  error: unknown | null;
};

type Phase2Query = PromiseLike<Phase2RowsResult> & {
  select: (columns: string) => Phase2Query;
  eq: (column: string, value: unknown) => Phase2Query;
  order: (column: string, options?: {ascending?: boolean}) => Phase2Query;
  limit: (count: number) => Phase2Query;
  maybeSingle: () => PromiseLike<Phase2SingleResult>;
};

type Phase2ReadClient = {
  from: (table: 'lead_appointments' | 'lead_appointment_history') => Phase2Query;
};

function nullableString(value: unknown): string | null {
  return typeof value === 'string' && value.length ? value : null;
}

function isAppointmentStatus(value: unknown): value is AppointmentStatus {
  return typeof value === 'string' && (appointmentStatuses as readonly string[]).includes(value);
}

function toJson(value: unknown): Json {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) return value;
  if (Array.isArray(value)) return value.map(toJson);
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, toJson(item)])
    );
  }
  return String(value);
}

export function mapAdminAppointmentRow(row: Record<string, unknown>): AdminAppointmentRow {
  return {
    id: String(row.id ?? ''),
    leadId: String(row.lead_id ?? ''),
    locationId: nullableString(row.location_id),
    unitTypeId: nullableString(row.unit_type_id),
    assignedTo: nullableString(row.assigned_to),
    scheduledAt: String(row.scheduled_at ?? ''),
    durationMinutes: Number(row.duration_minutes ?? 30),
    status: isAppointmentStatus(row.status) ? row.status : 'pending',
    source: row.source === 'staff' ? 'staff' : 'customer',
    customerNote: nullableString(row.customer_note),
    internalNote: nullableString(row.internal_note),
    createdBy: nullableString(row.created_by),
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? '')
  };
}

export function mapAdminAppointmentHistoryRow(
  row: Record<string, unknown>
): AdminAppointmentHistoryRow {
  return {
    id: String(row.id ?? ''),
    appointmentId: String(row.appointment_id ?? ''),
    leadId: String(row.lead_id ?? ''),
    changedBy: nullableString(row.changed_by),
    eventType: String(row.event_type ?? ''),
    beforeState: row.before_state === null || row.before_state === undefined
      ? null
      : toJson(row.before_state),
    afterState: toJson(row.after_state ?? {}),
    createdAt: String(row.created_at ?? '')
  };
}

function getPhase2Client(client: unknown): Phase2ReadClient {
  // The branch contains migration 00400 while the generated production types still
  // intentionally describe deployed schema 00300. Keep the temporary cast local.
  return client as Phase2ReadClient;
}

export async function listLeadAppointments(leadId: string): Promise<AdminAppointmentRow[]> {
  const supabase = await createSupabaseServerClient();
  const phase2 = getPhase2Client(supabase);
  const {data, error} = await phase2
    .from('lead_appointments')
    .select('id, lead_id, location_id, unit_type_id, assigned_to, scheduled_at, duration_minutes, status, source, customer_note, internal_note, created_by, created_at, updated_at')
    .eq('lead_id', leadId)
    .order('scheduled_at', {ascending: false})
    .limit(100);

  if (error) throw error;
  return (data ?? []).map(mapAdminAppointmentRow);
}

export async function getLeadAppointment(
  appointmentId: string,
  leadId: string
): Promise<AdminAppointmentRow | null> {
  const supabase = await createSupabaseServerClient();
  const phase2 = getPhase2Client(supabase);
  const {data, error} = await phase2
    .from('lead_appointments')
    .select('id, lead_id, location_id, unit_type_id, assigned_to, scheduled_at, duration_minutes, status, source, customer_note, internal_note, created_by, created_at, updated_at')
    .eq('id', appointmentId)
    .eq('lead_id', leadId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapAdminAppointmentRow(data) : null;
}

export async function listLeadAppointmentHistory(
  leadId: string
): Promise<AdminAppointmentHistoryRow[]> {
  const supabase = await createSupabaseServerClient();
  const phase2 = getPhase2Client(supabase);
  const {data, error} = await phase2
    .from('lead_appointment_history')
    .select('id, appointment_id, lead_id, changed_by, event_type, before_state, after_state, created_at')
    .eq('lead_id', leadId)
    .order('created_at', {ascending: false})
    .limit(200);

  if (error) throw error;
  return (data ?? []).map(mapAdminAppointmentHistoryRow);
}

export async function listAppointmentLocationOptions(): Promise<AppointmentLocationOption[]> {
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('locations')
    .select('id, name_vi')
    .eq('status', 'active')
    .order('sort_order', {ascending: true});

  if (error) throw error;
  return (data ?? []).map((row) => ({id: row.id, name: row.name_vi}));
}

export async function listAppointmentUnitTypeOptions(): Promise<AppointmentUnitTypeOption[]> {
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('unit_types')
    .select('id, name_vi')
    .eq('active', true)
    .order('sort_order', {ascending: true});

  if (error) throw error;
  return (data ?? []).map((row) => ({id: row.id, name: row.name_vi}));
}
