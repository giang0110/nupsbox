import type {
  LeadAppointmentHistoryRow,
  LeadAppointmentRow
} from '@/types/appointment-database';

export type AppointmentReferenceOption = {
  id: string;
  label: string;
};

export type AppointmentAssigneeOption = AppointmentReferenceOption & {
  role: 'admin' | 'staff';
};

export type AdminAppointmentRow = {
  id: string;
  leadId: string;
  locationId: string | null;
  locationName: string | null;
  unitTypeId: string | null;
  unitTypeName: string | null;
  assignedTo: string | null;
  assignedName: string | null;
  scheduledAt: string;
  durationMinutes: number;
  status: LeadAppointmentRow['status'];
  source: LeadAppointmentRow['source'];
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
  changedByName: string | null;
  eventType: LeadAppointmentHistoryRow['event_type'];
  beforeState: LeadAppointmentHistoryRow['before_state'];
  afterState: LeadAppointmentHistoryRow['after_state'];
  createdAt: string;
};

type LocationInput = {id: string; name_vi: string};
type UnitTypeInput = {id: string; name_vi: string};
type ProfileInput = {id: string; full_name: string | null; role: 'admin' | 'staff' | 'viewer'};

export type AppointmentWorkspaceInput = {
  appointments: readonly LeadAppointmentRow[];
  history: readonly LeadAppointmentHistoryRow[];
  locations: readonly LocationInput[];
  unitTypes: readonly UnitTypeInput[];
  profiles: readonly ProfileInput[];
};

export type AppointmentWorkspace = {
  appointments: AdminAppointmentRow[];
  history: AdminAppointmentHistoryRow[];
  locationOptions: AppointmentReferenceOption[];
  unitTypeOptions: AppointmentReferenceOption[];
  assigneeOptions: AppointmentAssigneeOption[];
};

export function projectAppointmentWorkspace(input: AppointmentWorkspaceInput): AppointmentWorkspace {
  const locations = new Map(input.locations.map((item) => [item.id, item.name_vi]));
  const unitTypes = new Map(input.unitTypes.map((item) => [item.id, item.name_vi]));
  const profiles = new Map(input.profiles.map((item) => [item.id, item.full_name?.trim() || item.id]));

  return {
    appointments: input.appointments.map((row) => ({
      id: row.id,
      leadId: row.lead_id,
      locationId: row.location_id,
      locationName: row.location_id ? locations.get(row.location_id) ?? null : null,
      unitTypeId: row.unit_type_id,
      unitTypeName: row.unit_type_id ? unitTypes.get(row.unit_type_id) ?? null : null,
      assignedTo: row.assigned_to,
      assignedName: row.assigned_to ? profiles.get(row.assigned_to) ?? null : null,
      scheduledAt: row.scheduled_at,
      durationMinutes: row.duration_minutes,
      status: row.status,
      source: row.source,
      customerNote: row.customer_note,
      internalNote: row.internal_note,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    })),
    history: input.history.map((row) => ({
      id: row.id,
      appointmentId: row.appointment_id,
      leadId: row.lead_id,
      changedBy: row.changed_by,
      changedByName: row.changed_by ? profiles.get(row.changed_by) ?? null : null,
      eventType: row.event_type,
      beforeState: row.before_state,
      afterState: row.after_state,
      createdAt: row.created_at
    })),
    locationOptions: input.locations.map((item) => ({id: item.id, label: item.name_vi})),
    unitTypeOptions: input.unitTypes.map((item) => ({id: item.id, label: item.name_vi})),
    assigneeOptions: input.profiles.flatMap((item) => {
      if (item.role !== 'admin' && item.role !== 'staff') return [];
      return [{id: item.id, label: item.full_name?.trim() || item.id, role: item.role}];
    })
  };
}
