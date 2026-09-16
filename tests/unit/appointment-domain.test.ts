import {describe, expect, it} from 'vitest';
import {
  canTransitionAppointment,
  terminalAppointmentStatuses
} from '@/features/appointments/domain';

describe('appointment status transitions', () => {
  it('allows configured active-status transitions', () => {
    expect(canTransitionAppointment('pending', 'confirmed')).toBe(true);
    expect(canTransitionAppointment('confirmed', 'no_show')).toBe(true);
  });

  it('rejects skipped and terminal-status transitions', () => {
    expect(canTransitionAppointment('pending', 'completed')).toBe(false);
    expect(canTransitionAppointment('completed', 'confirmed')).toBe(false);
  });

  it('identifies terminal appointment statuses', () => {
    expect(terminalAppointmentStatuses).toEqual(['completed', 'cancelled', 'no_show']);
  });
});
