import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';

const {updateLeadStatusValue, refresh} = vi.hoisted(() => ({
  updateLeadStatusValue: vi.fn(),
  refresh: vi.fn()
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({refresh})
}));

vi.mock('@/app/admin/leads/actions', () => ({
  updateLeadStatusValue
}));

import {LeadPipeline} from '@/components/admin/lead-pipeline';

const lead = {
  id: 'a8ba1e58-ece7-4a8a-844c-3b5edcbf8ab0',
  fullName: 'Nguyễn An',
  phone: '0900000000',
  email: null,
  message: null,
  needType: 'inventory',
  status: 'new' as const,
  preferredLanguage: 'vi' as const,
  source: 'website',
  utmSource: null,
  utmCampaign: null,
  assignedTo: null,
  createdAt: '2026-09-15T03:00:00.000Z',
  updatedAt: '2026-09-15T03:00:00.000Z'
};

describe('lead pipeline', () => {
  it('renders all seven columns, an explicit status fallback and appointment context', () => {
    updateLeadStatusValue.mockResolvedValue({ok: true});

    render(
      <LeadPipeline
        leads={[lead]}
        assigneeNames={{}}
        appointmentSummaries={{
          [lead.id]: {
            id: 'appointment-1',
            leadId: lead.id,
            status: 'confirmed',
            scheduledAt: '2026-09-20T02:30:00.000Z',
            overdue: false
          }
        }}
        canUpdate
      />
    );

    expect(screen.getByRole('heading', {name: 'Mới'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'Đã liên hệ'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'Đã xác nhận nhu cầu'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'Đang xem kho'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'Đang thương lượng'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'Đã thuê'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'Không chuyển đổi'})).toBeInTheDocument();
    expect(screen.getByLabelText('Chuyển trạng thái Nguyễn An')).toBeInTheDocument();\n    expect(screen.getByLabelText('Chuyển trạng thái Nguyễn An')).toHaveClass('min-h-11');
    expect(screen.getByText(/lịch gần nhất/i)).toBeInTheDocument();
  });

  it('rolls back the selector when a status mutation fails', async () => {
    updateLeadStatusValue.mockResolvedValueOnce({
      ok: false,
      message: 'Không thể cập nhật trạng thái.'
    });
    const user = userEvent.setup();

    render(
      <LeadPipeline
        leads={[lead]}
        assigneeNames={{}}
        appointmentSummaries={{}}
        canUpdate
      />
    );

    const select = screen.getByLabelText('Chuyển trạng thái Nguyễn An');
    await user.selectOptions(select, 'contacted');

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Không thể cập nhật trạng thái.'
      );
      expect(select).toHaveValue('new');
    });
    expect(screen.getByRole('link', {name: /mở hồ sơ/i})).toBeInTheDocument();
  });
});
