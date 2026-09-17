import {describe, expect, it} from 'vitest';
import {
  AppointmentConflictError,
  assertAppointmentWriteResult,
  toAppointmentInsertRow,
  toAppointmentUpdatePatch
} from '@/features/admin/appointments';

const leadId = '10000000-0000-4000-8000-000000000002';
const appointmentId = '40000000-0000-4000-8000-000000000001';
const staffId = '20000000-0000-4000-8000-000000000001';
const locationId = '30000000-0000-4000-8000-000000000001';

describe('CRM appointment persistence mapping', () => {
  it('forces staff-created appointments to start pending with staff source', () => {
    expect(toAppointmentInsertRow({
      leadId,
      locationId,
      unitTypeId: undefined,
      assignedTo: staffId,
      scheduledAt: '2026-09-20T03:00:00.000Z',
      durationMinutes: 45,
      customerNote: 'Khách muốn xem kho',
      internalNote: 'Ưu tiên buổi sáng'
    }, staffId)).toEqual({
      lead_id: leadId,
      location_id: locationId,
      unit_type_id: null,
      assigned_to: staffId,
      scheduled_at: '2026-09-20T03:00:00.000Z',
      duration_minutes: 45,
      status: 'pending',
      source: 'staff',
      customer_note: 'Khách muốn xem kho',
      internal_note: 'Ưu tiên buổi sáng',
      created_by: staffId
    });
  });

  it('maps only mutable appointment fields for optimistic updates', () => {
    expect(toAppointmentUpdatePatch({
      appointmentId,
      leadId,
      expectedUpdatedAt: '2026-09-15T03:00:00.000Z',
      status: 'confirmed',
      locationId,
      unitTypeId: null,
      assignedTo: staffId,
      scheduledAt: '2026-09-20T03:00:00.000Z',
      durationMinutes: 30,
      customerNote: null,
      internalNote: 'Đã gọi xác nhận'
    })).toEqual({
      status: 'confirmed',
      location_id: locationId,
      unit_type_id: null,
      assigned_to: staffId,
      scheduled_at: '2026-09-20T03:00:00.000Z',
      duration_minutes: 30,
      customer_note: null,
      internal_note: 'Đã gọi xác nhận'
    });
  });

  it('turns a missing update row into a concurrency conflict', () => {
    expect(() => assertAppointmentWriteResult(null)).toThrow(AppointmentConflictError);
    expect(assertAppointmentWriteResult({id: appointmentId, updated_at: '2026-09-15T03:01:00.000Z'})).toEqual({
      id: appointmentId,
      updated_at: '2026-09-15T03:01:00.000Z'
    });
  });
});
