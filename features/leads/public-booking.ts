import {hoChiMinhLocalToIso} from '@/features/appointments/time';

export function buildOptionalPublicAppointment(
  enabled: boolean,
  localDateTime: string,
  customerNote: string
) {
  if (!enabled) return undefined;

  let scheduledAt: string;
  try {
    scheduledAt = hoChiMinhLocalToIso(localDateTime);
  } catch {
    throw new Error('invalid_appointment_time');
  }

  const note = customerNote.trim();
  return {
    scheduledAt,
    durationMinutes: 30,
    customerNote: note || undefined
  };
}
