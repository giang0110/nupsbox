import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({children, href, ...props}: {children: React.ReactNode; href: string}) => (
    <a href={href} {...props}>{children}</a>
  )
}));

vi.mock('@/components/marketing/conversion-cta', () => ({
  ConversionCta: ({children}: {children: React.ReactNode}) => <a href="#storage-finder">{children}</a>
}));

import {Hero} from '@/components/marketing/hero';
import {HomeProofBento} from '@/components/marketing/home-proof-bento';
import type {PublicLocation, PublicUnitType} from '@/features/catalog/types';

const unit: PublicUnitType = {
  id: 'unit-1',
  slug: 's',
  name: 'Kho S',
  areaM2: 2.5,
  recommendedFor: 'Shop nhỏ',
  capacityNote: null,
  monthlyPrice: null,
  promoPrice: null,
  availabilityStatus: 'contact',
  availableCount: null,
  featured: true,
  sortOrder: 10
};

const location: PublicLocation = {
  id: 'loc-1',
  slug: 'central',
  name: 'NupsBox Central',
  address: 'Approved address',
  district: 'District X',
  city: 'Ho Chi Minh City',
  latitude: null,
  longitude: null,
  phone: null,
  zaloUrl: null,
  openingHours: {},
  unitTypes: [unit]
};

describe('fact-safe adaptive homepage marketing', () => {
  it('renders a neutral hero when no published location exists', () => {
    render(<Hero locale="vi" location={null} units={[]} />);

    expect(screen.getByText('Thông tin cơ sở sẽ xuất hiện sau khi được công bố.')).toBeInTheDocument();
    expect(screen.queryByText(/Tân Phú/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/CCTV/i)).not.toBeInTheDocument();
  });

  it('uses database-backed location and area values when they exist', () => {
    render(<Hero locale="vi" location={location} units={[unit]} />);

    expect(screen.getByText('NupsBox Central')).toBeInTheDocument();
    expect(screen.getByText(/Đang công bố loại kho từ 2.50 m²/)).toBeInTheDocument();
  });

  it('does not invent facility security claims in the proof bento', () => {
    render(<HomeProofBento locale="vi" location={null} units={[]} />);

    expect(screen.getByText('Chưa có cơ sở được công bố thì không hiển thị facility facts.')).toBeInTheDocument();
    expect(screen.queryByText('CCTV')).not.toBeInTheDocument();
    expect(screen.queryByText(/Keypad/i)).not.toBeInTheDocument();
  });

  it('summarizes published location and unit ranges from props', () => {
    render(<HomeProofBento locale="vi" location={location} units={[unit]} />);

    expect(screen.getAllByText('NupsBox Central').length).toBeGreaterThan(0);
    expect(screen.getByText('1 loại kho đang hiển thị, từ 2.50 đến 2.50 m².')).toBeInTheDocument();
  });
});
