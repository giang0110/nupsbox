import {describe, expect, it} from 'vitest';
import {
  AppointmentConflictError,
  prepareAppointmentCreate,
  prepareAppointmentUpdate
} from '@/features/admin/appointments';

const leadId = '10000000-0000-4000-8000-000000000002';
const appointmentId = '40000000-0000-4000-8000-000000000001';
const locationId = '30000000-0000-4000-8000-000000000001';
const assigneeId = '20000000-0000-4000-8000-000000000001';
const now = new Date('2026-09-15T03:00:00.000Z');
const futureScheduledAt = '2026-09-20T03:00:00.000Z';
const expectedUpdatedAt = '2026-09-15T03:00:00.000Z';

const validCreate = {
  leadId,
  scheduledAt: futureScheduledAt,
  durationMinutes: 30
};

const pending = {
  id: appointmentId,
  leadId,
  status: 'pending' as const,
  locationId: null,
  unitTypeId: null,
  assignedTo: null,
  scheduledAt: futureScheduledAt,
  updatedAt: expectedUpdatedAt
};

describe('admin appointment mutation preparation', () => {
  it('rejects viewers and forces staff-created appointments to pending/staff', () => {
    expect(() => prepareAppointmentCreate('viewer', validCreate, now)).toThrow('forbidden');

    expect(prepareAppointmentCreate('staff', validCreate, now)).toMatchObject({
      leadId,
      scheduledAt: futureScheduledAt,
      durationMinutes: 30,
      status: 'pending',
      source: 'staff'
    });
  });

  it('does not accept privileged create fields from untrusted input', () => {
    expect(() => prepareAppointmentCreate('staff', {
      ...validCreate,
      status: 'confirmed',
      source: 'customer',
      createdBy: assigneeId
    }, now)).toThrow();
  });

  it('rejects create times that are not in the future', () => {
    expect(() => prepareAppointmentCreate('staff', {
      ...validCreate,
      scheduledAt: '2026-09-15T03:00:00.000Z'
    }, now)).toThrow('scheduled_at_not_future');
  });

  it('rejects confirmation without a location and appointment assignee', () => {
    expect(() => prepareAppointmentUpdate('staff', pending, {
      appointmentId,
      leadId,
      expectedUpdatedAt,
      status: 'confirmed'
    }, now)).toThrow('confirmed_requires_location_assignee_future_time');
  });

  it('allows pending to become confirmed when all confirmation requirements are present', () => {
    expect(prepareAppointmentUpdate('staff', {
      ...pending,
      locationId,
      assignedTo: assigneeId
    }, {
      appointmentId,
      leadId,
      expectedUpdatedAt,
      status: 'confirmed'
    }, now)).toMatchObject({
      appointmentId,
      leadId,
      status: 'confirmed',
      locationId,
      assignedTo: assigneeId,
      scheduledAt: futureScheduledAt
    });
  });

  it('enforces the exact transition matrix', () => {
    expect(() => prepareAppointmentUpdate('staff', pending, {
      appointmentId,
      leadId,
      expectedUpdatedAt,
      status: 'completed'
    }, now)).toThrow('invalid_status_transition');

    expect(() => prepareAppointmentUpdate('staff', {
      ...pending,
      status: 'confirmed',
      locationId,
      assignedTo: assigneeId
    }, {
      appointmentId,
      leadId,
      expectedUpdatedAt,
      status: 'pending'
    }, now)).toThrow('invalid_status_transition');
  });

  it('rejects active appointments scheduled in the past', () => {
    expect(() => prepareAppointmentUpdate('staff', pending, {
      appointmentId,
      leadId,
      expectedUpdatedAt,
      scheduledAt: '2026-09-15T02:59:59.000Z'
    }, now)).toThrow('scheduled_at_not_future');
  });

  it('resolves explicit nulls as clear operations while preserving omitted values', () => {
    expect(prepareAppointmentUpdate('staff', {
      ...pending,
      locationId,
      assignedTo: assigneeId
    }, {
      appointmentId,
      leadId,
      expectedUpdatedAt,
      locationId: null,
      assignedTo: null
    }, now)).toMatchObject({
      locationId: null,
      assignedTo: null,
      scheduledAt: futureScheduledAt,
      status: 'pending'
    });
  });

  it('rejects updates for another lead and edits to terminal appointments', () => {
    expect(() => prepareAppointmentUpdate('staff', pending, {
      appointmentId,
      leadId: '10000000-0000-4000-8000-000000000003',
      expectedUpdatedAt,
      status: 'cancelled'
    }, now)).toThrow('appointment_not_owned');

    expect(() => prepareAppointmentUpdate('staff', {
      ...pending,
      status: 'completed',
      locationId,
      assignedTo: assigneeId
    }, {
      appointmentId,
      leadId,
      expectedUpdatedAt,
      internalNote: 'edit'
    }, now)).toThrow('terminal_appointment');
  });

  it('does not allow customer notes to change after confirmation', () => {
    expect(() => prepareAppointmentUpdate('staff', {
      ...pending,
      status: 'confirmed',
      locationId,
      assignedTo: assigneeId
    }, {
      appointmentId,
      leadId,
      expectedUpdatedAt,
      customerNote: 'updated'
    }, now)).toThrow('customer_note_immutable_after_confirmation');
  });
});

describe('AppointmentConflictError', () => {
  it('identifies stale optimistic-concurrency updates', () => {
    const error = new AppointmentConflictError();
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('AppointmentConflictError');
    expect(error.message).toBe('appointment_conflict');
  });
});
