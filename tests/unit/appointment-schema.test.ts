import {describe, expect, it} from 'vitest';
import {
  AppointmentCreateInputSchema,
  AppointmentUpdateInputSchema,
  PublicAppointmentRequestSchema
} from '@/features/appointments/schema';

const leadId = '10000000-0000-4000-8000-000000000002';
const appointmentId = '40000000-0000-4000-8000-000000000001';

describe('appointment schemas', () => {
  it('defaults public requests to 30 minutes and rejects privileged fields', () => {
    expect(PublicAppointmentRequestSchema.parse({
      scheduledAt: '2026-09-20T02:30:00.000Z'
    }).durationMinutes).toBe(30);

    expect(() => PublicAppointmentRequestSchema.parse({
      scheduledAt: '2026-09-20T02:30:00.000Z',
      durationMinutes: 14
    })).toThrow();

    expect(() => PublicAppointmentRequestSchema.parse({
      scheduledAt: '2026-09-20T02:30:00.000Z',
      status: 'confirmed'
    })).toThrow();
  });

  it('normalizes optional create identifiers and text', () => {
    const result = AppointmentCreateInputSchema.parse({
      leadId,
      locationId: '',
      assignedTo: '',
      scheduledAt: '2026-09-20T02:30:00.000Z',
      customerNote: '  Hẹn xem buổi sáng  '
    });
    expect(result.locationId).toBeUndefined();
    expect(result.assignedTo).toBeUndefined();
    expect(result.customerNote).toBe('Hẹn xem buổi sáng');
    expect(result.durationMinutes).toBe(30);
  });

  it('uses null to represent fields cleared by an update', () => {
    const result = AppointmentUpdateInputSchema.parse({
      appointmentId,
      leadId,
      expectedUpdatedAt: '2026-09-15T03:00:00.000Z',
      unitTypeId: '',
      internalNote: ''
    });
    expect(result.unitTypeId).toBeNull();
    expect(result.internalNote).toBeNull();
  });
});
