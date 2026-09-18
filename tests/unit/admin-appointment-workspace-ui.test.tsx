import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {AppointmentWorkspace} from '@/components/admin/appointment-workspace';
import type {AppointmentWorkspace as AppointmentWorkspaceModel} from '@/features/admin/appointment-read-model';

vi.mock('next/navigation', () => ({
  useRouter: () => ({refresh: vi.fn()})
}));

vi.mock('@/app/admin/leads/[leadId]/actions', () => ({
  createAppointment: vi.fn(),
  updateAppointment: vi.fn(),
  createAppointmentValue: vi.fn().mockResolvedValue({ok: true}),
  updateAppointmentValue: vi.fn().mockResolvedValue({ok: true})
}));

const workspace: AppointmentWorkspaceModel = {
  appointments: [{
    id: '40000000-0000-4000-8000-000000000001',
    leadId: '10000000-0000-4000-8000-000000000002',
    locationId: '30000000-0000-4000-8000-000000000001',
    locationName: 'NupsBox Tân Phú',
    unitTypeId: '50000000-0000-4000-8000-000000000001',
    unitTypeName: 'Kho 3 m²',
    assignedTo: '20000000-0000-4000-8000-000000000001',
    assignedName: 'Nhân viên A',
    scheduledAt: '2026-09-20T02:30:00.000Z',
    durationMinutes: 30,
    status: 'confirmed',
    source: 'staff',
    customerNote: null,
    internalNote: null,
    createdBy: '20000000-0000-4000-8000-000000000001',
    createdAt: '2026-09-15T03:00:00.000Z',
    updatedAt: '2026-09-15T04:00:00.000Z'
  }],
  history: [{
    id: '60000000-0000-4000-8000-000000000001',
    appointmentId: '40000000-0000-4000-8000-000000000001',
    leadId: '10000000-0000-4000-8000-000000000002',
    changedBy: '20000000-0000-4000-8000-000000000001',
    changedByName: 'Nhân viên A',
    eventType: 'status_changed',
    beforeState: {},
    afterState: {},
    createdAt: '2026-09-15T04:00:00.000Z'
  }],
  locationOptions: [{
    id: '30000000-0000-4000-8000-000000000001',
    label: 'NupsBox Tân Phú'
  }],
  unitTypeOptions: [{
    id: '50000000-0000-4000-8000-000000000001',
    label: 'Kho 3 m²'
  }],
  assigneeOptions: [{
    id: '20000000-0000-4000-8000-000000000001',
    label: 'Nhân viên A',
    role: 'staff'
  }]
};

describe('admin appointment workspace presentation', () => {
  it('keeps Light Booking compact and moves audit history to the unified timeline', () => {
    render(
      <AppointmentWorkspace
        leadId="10000000-0000-4000-8000-000000000002"
        workspace={workspace}
        canMutate
      />
    );

    expect(screen.getByRole('heading', {name: 'Lịch xem kho'})).toBeInTheDocument();
    expect(screen.getByText('Tạo lịch xem kho')).toBeInTheDocument();
    expect(screen.getAllByText('Đã xác nhận').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('NupsBox Tân Phú').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Kho 3 m²').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Nhân viên A').length).toBeGreaterThanOrEqual(1);
    expect(
      screen.queryByRole('heading', {name: /lịch sử.*lịch hẹn/i})
    ).not.toBeInTheDocument();
  });
});
