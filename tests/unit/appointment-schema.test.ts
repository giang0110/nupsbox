import {describe, expect, it} from 'vitest';
import {PublicAppointmentRequestSchema} from '@/features/appointments/schema';

describe('PublicAppointmentRequestSchema', () => {
  it('defaults a public appointment request to 30 minutes', () => {
    expect(PublicAppointmentRequestSchema.parse({
      scheduledAt: '2026-09-20T02:30:00.000Z'
    }).durationMinutes).toBe(30);
  });

  it('rejects public appointment durations below 15 minutes', () => {
    expect(() => PublicAppointmentRequestSchema.parse({
      scheduledAt: '2026-09-20T02:30:00.000Z',
      durationMinutes: 14
    })).toThrow();
  });

  it('rejects privileged status fields in public appointment requests', () => {
    expect(() => PublicAppointmentRequestSchema.parse({
      scheduledAt: '2026-09-20T02:30:00.000Z',
      status: 'confirmed'
    })).toThrow();
  });
});
