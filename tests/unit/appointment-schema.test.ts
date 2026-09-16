import {describe, expect, it} from 'vitest';
import {
  AppointmentCreateInputSchema,
  AppointmentUpdateInputSchema,
  PublicAppointmentRequestSchema
} from '@/features/appointments/schema';

const leadId = 'a8ba1e58-ece7-4a8a-844c-3b5edcbf8ab0';
const appointmentId = '51af3597-3eef-47a2-a008-2399be9ac8f6';
const expectedUpdatedAt = '2026-09-20T02:30:00.000Z';

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

describe('AppointmentCreateInputSchema', () => {
  it('defaults and coerces a valid duration', () => {
    expect(AppointmentCreateInputSchema.parse({
      leadId,
      scheduledAt: expectedUpdatedAt
    }).durationMinutes).toBe(30);

    expect(AppointmentCreateInputSchema.parse({
      leadId,
      scheduledAt: expectedUpdatedAt,
      durationMinutes: '45'
    }).durationMinutes).toBe(45);
  });

  it('rejects durations outside the permitted range', () => {
    expect(() => AppointmentCreateInputSchema.parse({
      leadId,
      scheduledAt: expectedUpdatedAt,
      durationMinutes: 14
    })).toThrow();

    expect(() => AppointmentCreateInputSchema.parse({
      leadId,
      scheduledAt: expectedUpdatedAt,
      durationMinutes: 181
    })).toThrow();
  });
});

describe('AppointmentUpdateInputSchema', () => {
  const baseUpdate = {appointmentId, leadId, expectedUpdatedAt};

  it('preserves omitted clearable fields as undefined', () => {
    const parsed = AppointmentUpdateInputSchema.parse(baseUpdate);
    expect(parsed.locationId).toBeUndefined();
    expect(parsed.assignedTo).toBeUndefined();
    expect(parsed.customerNote).toBeUndefined();
  });

  it('preserves explicit null and blank values as clear operations', () => {
    expect(AppointmentUpdateInputSchema.parse({
      ...baseUpdate,
      locationId: null,
      assignedTo: '',
      customerNote: ''
    })).toMatchObject({
      locationId: null,
      assignedTo: null,
      customerNote: null
    });
  });

  it('rejects update durations outside the permitted range', () => {
    expect(() => AppointmentUpdateInputSchema.parse({...baseUpdate, durationMinutes: 14}))
      .toThrow();
    expect(() => AppointmentUpdateInputSchema.parse({...baseUpdate, durationMinutes: 181}))
      .toThrow();
  });
});
