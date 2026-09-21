import {z} from 'zod';
import {
  canTransitionAppointment,
  terminalAppointmentStatuses
} from '@/features/appointments/domain';
import {
  AppointmentCreateInputSchema,
  AppointmentUpdateInputSchema
} from '@/features/appointments/schema';
import {requirePermission} from '@/features/admin/mutation-guard';
import type {AppointmentStatus, AppRole} from '@/types/database';

export type AppointmentCreateInput = z.infer<typeof AppointmentCreateInputSchema>;
export type AppointmentUpdateInput = z.infer<typeof AppointmentUpdateInputSchema>;

export type AppointmentMutationCurrent = {
  id: string;
  leadId: string;
  status: AppointmentStatus;
  locationId: string | null;
  unitTypeId: string | null;
  assignedTo: string | null;
  scheduledAt: string;
  updatedAt: string;
};

export type PreparedAppointmentUpdate = AppointmentUpdateInput & {
  locationId: string | null;
  unitTypeId: string | null;
  assignedTo: string | null;
  scheduledAt: string;
  status: AppointmentStatus;
};

export class AppointmentConflictError extends Error {
  constructor() {
    super('appointment_conflict');
    this.name = 'AppointmentConflictError';
  }
}

export function prepareAppointmentCreate(
  role: AppRole,
  input: unknown,
  now = new Date()
) {
  requirePermission(role, 'leads:update');
  const parsed = AppointmentCreateInputSchema.parse(input);
  if (Date.parse(parsed.scheduledAt) <= now.getTime()) {
    throw new Error('scheduled_at_not_future');
  }

  return {
    ...parsed,
    status: 'pending' as const,
    source: 'staff' as const
  };
}

export function prepareAppointmentUpdate(
  role: AppRole,
  current: AppointmentMutationCurrent,
  input: unknown,
  now = new Date()
): PreparedAppointmentUpdate {
  requirePermission(role, 'leads:update');
  const parsed = AppointmentUpdateInputSchema.parse(input);

  if (parsed.appointmentId !== current.id || parsed.leadId !== current.leadId) {
    throw new Error('appointment_not_owned');
  }
  if (terminalAppointmentStatuses.includes(current.status as typeof terminalAppointmentStatuses[number])) {
    throw new Error('terminal_appointment');
  }
  if (current.status === 'confirmed' && parsed.customerNote !== undefined) {
    throw new Error('customer_note_immutable_after_confirmation');
  }
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
  const status = parsed.status ?? current.status;

  if (
    status === 'confirmed' &&
    (!locationId || !assignedTo || Date.parse(scheduledAt) <= now.getTime())
  ) {
    throw new Error('confirmed_requires_location_assignee_future_time');
  }
  if (
    (status === 'pending' || status === 'confirmed') &&
    Date.parse(scheduledAt) <= now.getTime()
  ) {
    throw new Error('scheduled_at_not_future');
  }

  return {...parsed, locationId, unitTypeId, assignedTo, scheduledAt, status};
}

export function toAppointmentUpdatePatch(input: AppointmentUpdateInput) {
  const patch: {
    location_id?: string | null;
    unit_type_id?: string | null;
    assigned_to?: string | null;
    scheduled_at?: string;
    duration_minutes?: number;
    status?: AppointmentStatus;
    customer_note?: string | null;
    internal_note?: string | null;
  } = {};

  if (input.locationId !== undefined) patch.location_id = input.locationId;
  if (input.unitTypeId !== undefined) patch.unit_type_id = input.unitTypeId;
  if (input.assignedTo !== undefined) patch.assigned_to = input.assignedTo;
  if (input.scheduledAt !== undefined) patch.scheduled_at = input.scheduledAt;
  if (input.durationMinutes !== undefined) patch.duration_minutes = input.durationMinutes;
  if (input.status !== undefined) patch.status = input.status;
  if (input.customerNote !== undefined) patch.customer_note = input.customerNote;
  if (input.internalNote !== undefined) patch.internal_note = input.internalNote;

  return patch;
}
