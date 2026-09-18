import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />
}));

import {Gallery} from '@/components/marketing/gallery';
import {getFacilityMedia} from '@/features/content/facility-media';
import type {PublicLocation} from '@/features/catalog/types';

function location(slug: string, name: string): PublicLocation {
  return {
    id: slug,
    slug,
    name,
    address: 'Approved address',
    district: 'District X',
    city: 'Ho Chi Minh City',
    latitude: null,
    longitude: null,
    phone: null,
    zaloUrl: null,
    openingHours: {},
    unitTypes: []
  };
}

describe('facility media integrity', () => {
  it('maps the Tan Phu asset only to the Tan Phu slug', () => {
    expect(getFacilityMedia('tan-phu')?.imageUrl).toContain('/nupsbox-tan-phu/');
    expect(getFacilityMedia('central')).toBeNull();
    expect(getFacilityMedia(null)).toBeNull();
  });

  it('does not reuse the Tan Phu image for another published location', () => {
    render(<Gallery locale="vi" location={location('central', 'NupsBox Central')} />);

    expect(screen.getByRole('status')).toHaveTextContent('Chưa có ảnh đã gắn cho cơ sở này.');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders the mapped image for the matching published location', () => {
    render(<Gallery locale="vi" location={location('tan-phu', 'NupsBox Tân Phú')} />);

    expect(screen.getByRole('img', {name: 'Hình ảnh cơ sở NupsBox Tân Phú'})).toBeInTheDocument();
    expect(screen.getByText(/asset được gắn theo cơ sở/)).toBeInTheDocument();
  });
});
