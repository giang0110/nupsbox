import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

vi.mock('@/features/analytics/events', () => ({
  trackEvent: vi.fn()
}));

import {UnitCompare} from '@/components/units/unit-compare';

describe('public catalog empty states', () => {
  it('does not render an empty comparison workflow as if catalog data existed', () => {
    render(<UnitCompare units={[]} locale="vi" />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Chưa có loại kho được công bố.'
    );
    expect(screen.queryByText(/0\/3/)).not.toBeInTheDocument();
  });
});
