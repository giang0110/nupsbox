import {describe, expect, it} from 'vitest';
import {
  appointmentCreatePayloadFromFormData,
  appointmentUpdatePayloadFromFormData
} from '@/features/admin/appointments';

const leadId = '10000000-0000-4000-8000-000000000002';
const appointmentId = '40000000-0000-4000-8000-000000000001';

describe('CRM appointment form payload mapping', () => {
  it('maps create form values while preserving empty optional ids', () => {
    const form = new FormData();
    form.set('leadId', leadId);
    form.set('locationId', '');
    form.set('unitTypeId', '');
    form.set('assignedTo', '');
    form.set('scheduledAt', '2026-09-20T09:30');
    form.set('durationMinutes', '45');
    form.set('customerNote', '  Khách muốn xem kho  ');
    form.set('internalNote', '');

    expect(appointmentCreatePayloadFromFormData(form)).toEqual({
      leadId,
      locationId: '',
      unitTypeId: '',
      assignedTo: '',
      scheduledAtLocal: '2026-09-20T09:30',
      durationMinutes: '45',
      customerNote: '  Khách muốn xem kho  ',
      internalNote: ''
    });
  });

  it('maps update form values including optimistic concurrency token', () => {
    const form = new FormData();
    form.set('appointmentId', appointmentId);
    form.set('leadId', leadId);
    form.set('expectedUpdatedAt', '2026-09-15T03:00:00.000Z');
    form.set('status', 'confirmed');
    form.set('locationId', '30000000-0000-4000-8000-000000000001');
    form.set('unitTypeId', '');
    form.set('assignedTo', '20000000-0000-4000-8000-000000000001');
    form.set('scheduledAt', '2026-09-20T09:30');
    form.set('durationMinutes', '30');
    form.set('customerNote', '');
    form.set('internalNote', 'Đã xác nhận');

    expect(appointmentUpdatePayloadFromFormData(form)).toEqual({
      appointmentId,
      leadId,
      expectedUpdatedAt: '2026-09-15T03:00:00.000Z',
      status: 'confirmed',
      locationId: '30000000-0000-4000-8000-000000000001',
      unitTypeId: '',
      assignedTo: '20000000-0000-4000-8000-000000000001',
      scheduledAtLocal: '2026-09-20T09:30',
      durationMinutes: '30',
      customerNote: '',
      internalNote: 'Đã xác nhận'
    });
  });
});
