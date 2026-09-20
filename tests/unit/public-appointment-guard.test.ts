import {describe, expect, it} from 'vitest';
import {assertPublicAppointmentNotPast} from '@/features/leads/appointment-guard';

describe('public appointment operational guard', () => {
  const now = new Date('2026-09-20T07:00:00.000Z');

  it('allows requests in the future', () => {
    expect(() => assertPublicAppointmentNotPast({
      scheduledAt: '2026-09-20T08:00:00.000Z',
      durationMinutes: 30
    }, now)).not.toThrow();
  });

  it('allows small clock skew near the current time', () => {
    expect(() => assertPublicAppointmentNotPast({
      scheduledAt: '2026-09-20T06:56:00.000Z',
      durationMinutes: 30
    }, now)).not.toThrow();
  });

  it('rejects stale viewing requests', () => {
    expect(() => assertPublicAppointmentNotPast({
      scheduledAt: '2026-09-20T06:30:00.000Z',
      durationMinutes: 30
    }, now)).toThrow('appointment_time_in_past');
  });
});
