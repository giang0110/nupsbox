import {describe, expect, it} from 'vitest';
import {
  canTransitionAppointment,
  terminalAppointmentStatuses
} from '@/features/appointments/domain';

describe('appointment domain transitions', () => {
  it('allows only the approved active lifecycle transitions', () => {
    expect(canTransitionAppointment('pending', 'confirmed')).toBe(true);
    expect(canTransitionAppointment('pending', 'cancelled')).toBe(true);
    expect(canTransitionAppointment('confirmed', 'completed')).toBe(true);
    expect(canTransitionAppointment('confirmed', 'cancelled')).toBe(true);
    expect(canTransitionAppointment('confirmed', 'no_show')).toBe(true);

    expect(canTransitionAppointment('pending', 'completed')).toBe(false);
    expect(canTransitionAppointment('completed', 'confirmed')).toBe(false);
    expect(canTransitionAppointment('cancelled', 'pending')).toBe(false);
  });

  it('exposes the terminal statuses explicitly', () => {
    expect(terminalAppointmentStatuses).toEqual(['completed', 'cancelled', 'no_show']);
  });
});
