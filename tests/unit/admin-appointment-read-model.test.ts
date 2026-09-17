import {describe, expect, it} from 'vitest';
import {projectAppointmentWorkspace} from '@/features/admin/appointment-read-model';

const leadId = '10000000-0000-4000-8000-000000000002';
const appointmentId = '40000000-0000-4000-8000-000000000001';
const locationId = '30000000-0000-4000-8000-000000000001';
const unitTypeId = '50000000-0000-4000-8000-000000000001';
const staffId = '20000000-0000-4000-8000-000000000001';

describe('appointment CRM read model', () => {
  it('projects appointment labels and audit actor names without inventing missing data', () => {
    const result = projectAppointmentWorkspace({
      appointments: [{
        id: appointmentId,
        lead_id: leadId,
        location_id: locationId,
        unit_type_id: unitTypeId,
        assigned_to: staffId,
        scheduled_at: '2026-09-20T02:30:00.000Z',
        duration_minutes: 30,
        status: 'confirmed',
        source: 'staff',
        customer_note: 'Khách cần xem cửa cuốn',
        internal_note: null,
        created_by: staffId,
        created_at: '2026-09-15T03:00:00.000Z',
        updated_at: '2026-09-15T04:00:00.000Z'
      }],
      history: [{
        id: '60000000-0000-4000-8000-000000000001',
        appointment_id: appointmentId,
        lead_id: leadId,
        changed_by: staffId,
        event_type: 'status_changed',
        before_state: {},
        after_state: {},
        created_at: '2026-09-15T04:00:00.000Z'
      }],
      locations: [{id: locationId, name_vi: 'NupsBox Tân Phú'}],
      unitTypes: [{id: unitTypeId, name_vi: 'Kho 3 m²'}],
      profiles: [{id: staffId, full_name: 'Nhân viên A', role: 'staff'}]
    });

    expect(result.appointments[0]).toMatchObject({
      id: appointmentId,
      locationName: 'NupsBox Tân Phú',
      unitTypeName: 'Kho 3 m²',
      assignedName: 'Nhân viên A',
      status: 'confirmed'
    });
    expect(result.history[0]).toMatchObject({
      appointmentId,
      eventType: 'status_changed',
      changedByName: 'Nhân viên A'
    });
    expect(result.locationOptions).toEqual([{id: locationId, label: 'NupsBox Tân Phú'}]);
    expect(result.unitTypeOptions).toEqual([{id: unitTypeId, label: 'Kho 3 m²'}]);
  });

  it('returns null labels when referenced metadata is unavailable', () => {
    const result = projectAppointmentWorkspace({
      appointments: [{
        id: appointmentId,
        lead_id: leadId,
        location_id: locationId,
        unit_type_id: null,
        assigned_to: staffId,
        scheduled_at: '2026-09-20T02:30:00.000Z',
        duration_minutes: 30,
        status: 'pending',
        source: 'customer',
        customer_note: null,
        internal_note: null,
        created_by: null,
        created_at: '2026-09-15T03:00:00.000Z',
        updated_at: '2026-09-15T03:00:00.000Z'
      }],
      history: [],
      locations: [],
      unitTypes: [],
      profiles: []
    });

    expect(result.appointments[0]).toMatchObject({
      locationName: null,
      unitTypeName: null,
      assignedName: null
    });
  });
});
