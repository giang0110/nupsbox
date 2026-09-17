import {
  canTransitionAppointment,
  isTerminalAppointmentStatus,
  type AppointmentStatus
} from '@/features/appointments/domain';
import {
  AppointmentCreateInputSchema,
  AppointmentUpdateInputSchema,
  type AppointmentCreateInput,
  type AppointmentUpdateInput
} from '@/features/appointments/schema';
import {can} from '@/features/auth/permissions';
import type {AppRole} from '@/types/database';

export class AppointmentConflictError extends Error {
  constructor() {
    super('appointment_conflict');
    this.name = 'AppointmentConflictError';
  }
}

export type CurrentAppointment = {
  id: string;
  leadId: string;
  status: AppointmentStatus;
  locationId: string | null;
  unitTypeId: string | null;
  assignedTo: string | null;
  scheduledAt: string;
  durationMinutes: number;
  customerNote: string | null;
  internalNote: string | null;
  updatedAt: string;
};

export type PreparedAppointmentUpdate = AppointmentUpdateInput & {
  status: AppointmentStatus;
  locationId: string | null;
  unitTypeId: string | null;
  assignedTo: string | null;
  scheduledAt: string;
  durationMinutes: number;
  customerNote: string | null;
  internalNote: string | null;
};

function isFuture(value: string, now: Date) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && timestamp > now.getTime();
}

function formText(formData: FormData, key: string) {
  return String(formData.get(key) ?? '');
}

export function appointmentCreatePayloadFromFormData(formData: FormData) {
  return {
    leadId: formText(formData, 'leadId'),
    locationId: formText(formData, 'locationId'),
    unitTypeId: formText(formData, 'unitTypeId'),
    assignedTo: formText(formData, 'assignedTo'),
    scheduledAtLocal: formText(formData, 'scheduledAt'),
    durationMinutes: formText(formData, 'durationMinutes'),
    customerNote: formText(formData, 'customerNote'),
    internalNote: formText(formData, 'internalNote')
  };
}

export function appointmentUpdatePayloadFromFormData(formData: FormData) {
  return {
    appointmentId: formText(formData, 'appointmentId'),
    leadId: formText(formData, 'leadId'),
    expectedUpdatedAt: formText(formData, 'expectedUpdatedAt'),
    status: formText(formData, 'status'),
    locationId: formText(formData, 'locationId'),
    unitTypeId: formText(formData, 'unitTypeId'),
    assignedTo: formText(formData, 'assignedTo'),
    scheduledAtLocal: formText(formData, 'scheduledAt'),
    durationMinutes: formText(formData, 'durationMinutes'),
    customerNote: formText(formData, 'customerNote'),
    internalNote: formText(formData, 'internalNote')
  };
}

export function prepareAppointmentCreate(
  role: AppRole,
  input: unknown,
  now = new Date()
) {
  if (!can(role, 'leads:update')) throw new Error('forbidden');
  const parsed = AppointmentCreateInputSchema.parse(input);
  if (!isFuture(parsed.scheduledAt, now)) throw new Error('scheduled_at_not_future');
  return parsed;
}

export function prepareAppointmentUpdate(
  role: AppRole,
  current: CurrentAppointment,
  input: unknown,
  now = new Date()
): PreparedAppointmentUpdate {
  if (!can(role, 'leads:update')) throw new Error('forbidden');
  const parsed = AppointmentUpdateInputSchema.parse(input);

  if (parsed.appointmentId !== current.id || parsed.leadId !== current.leadId) {
    throw new Error('appointment_mismatch');
  }
  if (isTerminalAppointmentStatus(current.status)) {
    throw new Error('terminal_appointment');
  }

  const status = parsed.status ?? current.status;
  if (
    parsed.status &&
    parsed.status !== current.status &&
    !canTransitionAppointment(current.status, parsed.status)
  ) {
    throw new Error('invalid_status_transition');
  }

  const locationId = parsed.locationId !== undefined ? parsed.locationId : current.locationId;
  const unitTypeId = parsed.unitTypeId !== undefined ? parsed.unitTypeId : current.unitTypeId;
  const assignedTo = parsed.assignedTo !== undefined ? parsed.assignedTo : current.assignedTo;
  const scheduledAt = parsed.scheduledAt ?? current.scheduledAt;
  const durationMinutes = parsed.durationMinutes ?? current.durationMinutes;
  const customerNote = parsed.customerNote !== undefined ? parsed.customerNote : current.customerNote;
  const internalNote = parsed.internalNote !== undefined ? parsed.internalNote : current.internalNote;

  if (status === 'confirmed' && (!locationId || !assignedTo || !isFuture(scheduledAt, now))) {
    throw new Error('confirmed_requires_location_assignee_future_time');
  }
  if ((status === 'pending' || status === 'confirmed') && !isFuture(scheduledAt, now)) {
    throw new Error('scheduled_at_not_future');
  }

  return {
    appointmentId: parsed.appointmentId,
    leadId: parsed.leadId,
    expectedUpdatedAt: parsed.expectedUpdatedAt,
    status,
    locationId,
    unitTypeId,
    assignedTo,
    scheduledAt,
    durationMinutes,
    customerNote,
    internalNote
  };
}

export function toAppointmentInsertRow(input: AppointmentCreateInput, createdBy: string) {
  return {
    lead_id: input.leadId,
    location_id: input.locationId ?? null,
    unit_type_id: input.unitTypeId ?? null,
    assigned_to: input.assignedTo ?? null,
    scheduled_at: input.scheduledAt,
    duration_minutes: input.durationMinutes,
    status: 'pending' as const,
    source: 'staff' as const,
    customer_note: input.customerNote ?? null,
    internal_note: input.internalNote ?? null,
    created_by: createdBy
  };
}

export function toAppointmentUpdatePatch(input: PreparedAppointmentUpdate) {
  return {
    status: input.status,
    location_id: input.locationId,
    unit_type_id: input.unitTypeId,
    assigned_to: input.assignedTo,
    scheduled_at: input.scheduledAt,
    duration_minutes: input.durationMinutes,
    customer_note: input.customerNote,
    internal_note: input.internalNote
  };
}

export function assertAppointmentWriteResult<T extends {id: string; updated_at: string}>(row: T | null) {
  if (!row) throw new AppointmentConflictError();
  return row;
}
