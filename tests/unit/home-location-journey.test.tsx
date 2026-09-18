import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

vi.mock('@/components/locations/location-card', () => ({
  LocationCard: ({location}: {location: {name: string}}) => <article>{location.name}</article>
}));

import {HomeLocationJourney} from '@/components/marketing/home-location-journey';

describe('compact homepage location journey', () => {
  it('keeps the P2.8 truthful empty state when no location is published', () => {
    render(<HomeLocationJourney location={null} locale="vi" />);

    expect(screen.getByRole('status')).toHaveTextContent('Thông tin cơ sở đang được cập nhật.');
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText('03')).toBeInTheDocument();
  });
});
