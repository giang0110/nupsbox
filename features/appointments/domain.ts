export const appointmentStatuses = [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'no_show'
] as const;

export const appointmentSources = ['customer', 'staff'] as const;

export type AppointmentStatus = (typeof appointmentStatuses)[number];
export type AppointmentSource = (typeof appointmentSources)[number];

export const terminalAppointmentStatuses = [
  'completed',
  'cancelled',
  'no_show'
] as const satisfies readonly AppointmentStatus[];

const transitions: Record<AppointmentStatus, readonly AppointmentStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled', 'no_show'],
  completed: [],
  cancelled: [],
  no_show: []
};

export function canTransitionAppointment(
  from: AppointmentStatus,
  to: AppointmentStatus
): boolean {
  return transitions[from].includes(to);
}

export function isTerminalAppointmentStatus(
  status: AppointmentStatus
): status is (typeof terminalAppointmentStatuses)[number] {
  return (terminalAppointmentStatuses as readonly AppointmentStatus[]).includes(status);
}
