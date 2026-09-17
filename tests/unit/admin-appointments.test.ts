import {describe, expect, it} from 'vitest';
import {
  AppointmentConflictError,
  prepareAppointmentCreate,
  prepareAppointmentUpdate
} from '@/features/admin/appointments';

const now = new Date('2026-09-15T03:00:00.000Z');
const leadId = '10000000-0000-4000-8000-000000000002';
const appointmentId = '40000000-0000-4000-8000-000000000001';
const locationId = '30000000-0000-4000-8000-000000000001';
const assigneeId = '20000000-0000-4000-8000-000000000001';
const expectedUpdatedAt = '2026-09-15T03:00:00.000Z';

const validCreate = {
  leadId,
  scheduledAt: '2026-09-20T03:00:00.000Z',
  durationMinutes: 30
};

const pending = {
  id: appointmentId,
  leadId,
  status: 'pending' as const,
  locationId: null,
  unitTypeId: null,
  assignedTo: null,
  scheduledAt: '2026-09-20T03:00:00.000Z',
  durationMinutes: 30,
  customerNote: null,
  internalNote: null,
  updatedAt: expectedUpdatedAt
};

describe('CRM appointment mutation preparation', () => {
  it('allows admin/staff creation but rejects viewer and past time', () => {
    expect(() => prepareAppointmentCreate('viewer', validCreate, now)).toThrow('forbidden');
    expect(prepareAppointmentCreate('staff', validCreate, now)).toMatchObject({
      leadId,
      scheduledAt: validCreate.scheduledAt,
      durationMinutes: 30
    });
    expect(() => prepareAppointmentCreate('admin', {
      ...validCreate,
      scheduledAt: '2026-09-14T03:00:00.000Z'
    }, now)).toThrow('scheduled_at_not_future');
  });

  it('enforces the status graph and confirmation invariants', () => {
    expect(() => prepareAppointmentUpdate('staff', pending, {
      appointmentId,
      leadId,
      expectedUpdatedAt,
      status: 'confirmed'
    }, now)).toThrow('confirmed_requires_location_assignee_future_time');

    expect(() => prepareAppointmentUpdate('staff', pending, {
      appointmentId,
      leadId,
      expectedUpdatedAt,
      status: 'completed'
    }, now)).toThrow('invalid_status_transition');

    const ready = {...pending, locationId, assignedTo: assigneeId};
    expect(prepareAppointmentUpdate('staff', ready, {
      appointmentId,
      leadId,
      expectedUpdatedAt,
      status: 'confirmed'
    }, now)).toMatchObject({status: 'confirmed', locationId, assignedTo: assigneeId});
  });

  it('rejects all ordinary edits after terminal status', () => {
    const completed = {...pending, status: 'completed' as const, locationId, assignedTo: assigneeId};
    expect(() => prepareAppointmentUpdate('staff', completed, {
      appointmentId,
      leadId,
      expectedUpdatedAt,
      internalNote: 'late edit'
    }, now)).toThrow('terminal_appointment');
  });

  it('keeps null-aware patch semantics for explicit clearing', () => {
    const ready = {...pending, locationId, unitTypeId: locationId, assignedTo: assigneeId};
    expect(prepareAppointmentUpdate('admin', ready, {
      appointmentId,
      leadId,
      expectedUpdatedAt,
      unitTypeId: ''
    }, now).unitTypeId).toBeNull();
  });

  it('exposes a dedicated optimistic-concurrency error', () => {
    const error = new AppointmentConflictError();
    expect(error.name).toBe('AppointmentConflictError');
    expect(error.message).toBe('appointment_conflict');
  });
});
