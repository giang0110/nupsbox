import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

vi.mock('@/features/analytics/events', () => ({
  trackEvent: vi.fn()
}));

vi.mock('@/components/units/unit-card', () => ({
  UnitCard: () => null
}));

import {UnitCompare} from '@/components/units/unit-compare';

describe('public catalog empty states', () => {
  it('does not render an empty comparison workflow as if catalog data existed', () => {
    render(<UnitCompare units={[]} locale="vi" />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Catalog đang được hoàn thiện bằng dữ liệu đã xác minh.'
    );
    expect(screen.getByRole('link', {name: 'Gửi nhu cầu để được tư vấn'})).toBeInTheDocument();
    expect(screen.queryByText(/0\/3/)).not.toBeInTheDocument();
  });
});
