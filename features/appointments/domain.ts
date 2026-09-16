import type {Database} from '@/types/database';

export type AppointmentStatus = Database['public']['Enums']['appointment_status'];
export type AppointmentSource = Database['public']['Enums']['appointment_source'];

export const terminalAppointmentStatuses = ['completed', 'cancelled', 'no_show'] as const;

const transitions: Record<AppointmentStatus, readonly AppointmentStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled', 'no_show'],
  completed: [],
  cancelled: [],
  no_show: []
};

export function canTransitionAppointment(from: AppointmentStatus, to: AppointmentStatus): boolean {
  return transitions[from].includes(to);
}
