import {describe, expect, it} from 'vitest';
import {
  mapAdminAppointmentHistoryRow,
  mapAdminAppointmentRow
} from '@/features/admin/appointment-data';

describe('CRM appointment data mapping', () => {
  it('maps database appointment rows without inventing nullable values', () => {
    expect(mapAdminAppointmentRow({
      id: '40000000-0000-4000-8000-000000000001',
      lead_id: '10000000-0000-4000-8000-000000000002',
      location_id: null,
      unit_type_id: '50000000-0000-4000-8000-000000000001',
      assigned_to: null,
      scheduled_at: '2026-09-20T03:00:00.000Z',
      duration_minutes: 30,
      status: 'pending',
      source: 'customer',
      customer_note: 'Muốn xem kho buổi sáng',
      internal_note: null,
      created_by: null,
      created_at: '2026-09-15T03:00:00.000Z',
      updated_at: '2026-09-15T03:00:00.000Z'
    })).toEqual({
      id: '40000000-0000-4000-8000-000000000001',
      leadId: '10000000-0000-4000-8000-000000000002',
      locationId: null,
      unitTypeId: '50000000-0000-4000-8000-000000000001',
      assignedTo: null,
      scheduledAt: '2026-09-20T03:00:00.000Z',
      durationMinutes: 30,
      status: 'pending',
      source: 'customer',
      customerNote: 'Muốn xem kho buổi sáng',
      internalNote: null,
      createdBy: null,
      createdAt: '2026-09-15T03:00:00.000Z',
      updatedAt: '2026-09-15T03:00:00.000Z'
    });
  });

  it('maps appointment audit rows for the unified timeline', () => {
    expect(mapAdminAppointmentHistoryRow({
      id: '60000000-0000-4000-8000-000000000001',
      appointment_id: '40000000-0000-4000-8000-000000000001',
      lead_id: '10000000-0000-4000-8000-000000000002',
      changed_by: null,
      event_type: 'created',
      before_state: null,
      after_state: {status: 'pending'},
      created_at: '2026-09-15T03:00:00.000Z'
    })).toMatchObject({
      id: '60000000-0000-4000-8000-000000000001',
      appointmentId: '40000000-0000-4000-8000-000000000001',
      leadId: '10000000-0000-4000-8000-000000000002',
      changedBy: null,
      eventType: 'created',
      createdAt: '2026-09-15T03:00:00.000Z'
    });
  });
});
