import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

vi.mock('@/i18n/navigation', () => ({
  Link: ({children, href, ...props}: {children: React.ReactNode; href: string}) => (
    <a href={typeof href === 'string' ? href : '#location'} {...props}>{children}</a>
  )
}));

vi.mock('@/components/marketing/conversion-cta', () => ({
  ConversionCta: ({children}: {children: React.ReactNode}) => <a href="#viewing">{children}</a>
}));

import {HomeLocationJourney} from '@/components/marketing/home-location-journey';

describe('compact homepage location journey', () => {
  it('keeps the truthful empty state when no location is published', () => {
    render(<HomeLocationJourney location={null} locale="vi" />);

    expect(screen.getByText('Thông tin cơ sở đang được cập nhật.')).toBeInTheDocument();
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText('03')).toBeInTheDocument();
  });
});
