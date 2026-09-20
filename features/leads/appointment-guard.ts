import type {PublicAppointmentRequest} from '@/features/appointments/schema';

const CLOCK_SKEW_MS = 5 * 60 * 1000;

export function assertPublicAppointmentNotPast(
  appointment: PublicAppointmentRequest | undefined,
  now = new Date()
) {
  if (!appointment) return;

  const scheduledAt = new Date(appointment.scheduledAt);
  if (
    Number.isNaN(scheduledAt.getTime()) ||
    scheduledAt.getTime() < now.getTime() - CLOCK_SKEW_MS
  ) {
    throw new Error('appointment_time_in_past');
  }
}
