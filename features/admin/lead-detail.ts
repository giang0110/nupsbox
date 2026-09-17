import type {AppointmentStatus} from '@/features/appointments/domain';

export type AppointmentSummaryInput = {
  id: string;
  status: AppointmentStatus;
  scheduledAt: string;
};

export type NextAppointmentSummary = AppointmentSummaryInput & {
  overdue: boolean;
};

export function selectNextAppointment(
  rows: readonly AppointmentSummaryInput[],
  now = new Date()
): NextAppointmentSummary | null {
  const actionable = rows
    .filter((row) => row.status === 'pending' || row.status === 'confirmed')
    .map((row) => ({row, timestamp: Date.parse(row.scheduledAt)}))
    .filter((item) => Number.isFinite(item.timestamp));

  const nowMs = now.getTime();
  const future = actionable
    .filter((item) => item.timestamp >= nowMs)
    .sort((a, b) => a.timestamp - b.timestamp)[0];

  if (future) {
    return {...future.row, overdue: false};
  }

  const past = actionable
    .filter((item) => item.timestamp < nowMs)
    .sort((a, b) => b.timestamp - a.timestamp)[0];

  if (!past) return null;
  return {...past.row, overdue: past.row.status === 'confirmed'};
}
