import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & {fill?: boolean}) => {
    const {fill, alt = '', ...imageProps} = props;
    void fill;
    // Test double for next/image; native img is intentional here.
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt} {...imageProps} />;
  }
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

    expect(screen.getByText('Không gian kho được cập nhật theo từng cơ sở.')).toBeInTheDocument();
    expect(screen.queryByText(/Tân Phú/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/CCTV/i)).not.toBeInTheDocument();
  });

  it('uses database-backed location and area values when they exist', () => {
    render(<Hero locale="vi" location={location} units={[unit]} />);

    expect(screen.getByText('NupsBox Central')).toBeInTheDocument();
    expect(screen.getByText('Approved address')).toBeInTheDocument();
    expect(screen.getByText('2.50 m²+')).toBeInTheDocument();
  });

  it('does not invent facility security claims in the proof bento', () => {
    render(<HomeProofBento locale="vi" location={null} units={[]} />);

    expect(screen.getByText('Thông tin cơ sở được hiển thị khi đã có dữ liệu.')).toBeInTheDocument();
    expect(screen.queryByText('CCTV')).not.toBeInTheDocument();
    expect(screen.queryByText(/Keypad/i)).not.toBeInTheDocument();
  });

  it('summarizes published location and unit ranges from props', () => {
    render(<HomeProofBento locale="vi" location={location} units={[unit]} />);

    expect(screen.getByText('Cơ sở đang hiển thị tại District X, Ho Chi Minh City.')).toBeInTheDocument();
    expect(screen.getByText('Các loại kho đang hiển thị từ 2.50 đến 2.50 m².')).toBeInTheDocument();
  });
});
