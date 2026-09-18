import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';

const {updateLeadStatusValue} = vi.hoisted(() => ({
  updateLeadStatusValue: vi.fn()
}));

vi.mock('@/app/admin/leads/actions', () => ({
  updateLeadStatus: vi.fn(),
  updateLeadStatusValue
}));

import {LeadStatusForm} from '@/components/admin/lead-status-form';

describe('lead action feedback', () => {
  it('shows a visible message when a status mutation fails', async () => {
    updateLeadStatusValue.mockResolvedValueOnce({
      ok: false,
      message: 'Không thể cập nhật trạng thái.'
    });
    const user = userEvent.setup();

    render(
      <LeadStatusForm
        leadId="a8ba1e58-ece7-4a8a-844c-3b5edcbf8ab0"
        status="new"
      />
    );

    await user.selectOptions(screen.getByLabelText('Trạng thái'), 'contacted');
    await user.click(screen.getByRole('button', {name: 'Lưu trạng thái'}));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Không thể cập nhật trạng thái.'
      );
      expect(screen.getByRole('alert')).toBeVisible();
    });
  });
});
