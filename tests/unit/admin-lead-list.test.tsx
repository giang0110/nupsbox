import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {LeadList} from '@/components/admin/lead-list';

vi.mock('@/components/admin/lead-status-form', () => ({
  LeadStatusForm: ({status}: {status: string}) => <span>status:{status}</span>
}));

const lead = {
  id: 'a8ba1e58-ece7-4a8a-844c-3b5edcbf8ab0',
  fullName: 'Nguyễn An',
  phone: '0900000000',
  email: 'an@example.com',
  message: 'Cần kho gần Tân Phú',
  needType: 'inventory',
  status: 'qualified' as const,
  preferredLanguage: 'vi' as const,
  source: 'website',
  utmSource: 'facebook',
  utmCampaign: null,
  assignedTo: '51af3597-3eef-47a2-a008-2399be9ac8f6',
  createdAt: '2026-09-15T03:00:00.000Z',
  updatedAt: '2026-09-15T04:00:00.000Z'
};

describe('admin lead list', () => {
  it('renders one desktop table and one mobile card representation from the same row', () => {
    render(
      <LeadList
        leads={[lead]}
        assigneeNames={{[lead.assignedTo!]: 'Nhân viên A'}}
        canUpdate
      />
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByText('Nguyễn An').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Nhân viên A').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByRole('link', {name: /mở hồ sơ/i}).length).toBeGreaterThanOrEqual(1);
  });
});
