import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

vi.mock('@/i18n/navigation', () => ({
  Link: ({children, href, ...props}: {children: React.ReactNode; href: string}) => (
    <a href={href} {...props}>{children}</a>
  )
}));

vi.mock('@/components/storage-finder/storage-finder', () => ({
  StorageFinder: () => <div data-testid="finder">Finder content</div>
}));

vi.mock('@/components/units/unit-card', () => ({
  UnitCard: ({unit}: {unit: {name: string}}) => <article>{unit.name}</article>
}));

import {HomeChoiceHub} from '@/components/marketing/home-choice-hub';

const units = [
  {
    id: 'u1',
    slug: 's',
    name: 'Kho S',
    areaM2: 1.64,
    recommendedFor: 'Shop nhỏ',
    capacityNote: null,
    monthlyPrice: null,
    promoPrice: null,
    availabilityStatus: 'contact' as const,
    availableCount: null,
    featured: true,
    sortOrder: 10
  }
];

describe('compact homepage choice hub', () => {
  it('shows one active panel while keeping all three tab choices available', () => {
    render(
      <HomeChoiceHub
        units={units}
        finderUnits={units.map(({id, slug, name, areaM2, sortOrder}) => ({id, slug, name, areaM2, sortOrder}))}
        locale="vi"
      />
    );

    expect(screen.getByRole('tab', {name: 'Tìm nhanh'})).toHaveAttribute('aria-selected', 'true');
    expect(document.getElementById('choice-panel-finder')).not.toHaveAttribute('hidden');
    expect(document.getElementById('choice-panel-units')).toHaveAttribute('hidden');
    expect(document.getElementById('choice-panel-use-cases')).toHaveAttribute('hidden');

    fireEvent.click(screen.getByRole('tab', {name: 'Loại kho'}));

    expect(screen.getByRole('tab', {name: 'Loại kho'})).toHaveAttribute('aria-selected', 'true');
    expect(document.getElementById('choice-panel-finder')).toHaveAttribute('hidden');
    expect(document.getElementById('choice-panel-units')).not.toHaveAttribute('hidden');
    expect(screen.getByText('Kho S')).toBeInTheDocument();
  });

  it('supports arrow-key tab navigation', () => {
    render(
      <HomeChoiceHub
        units={units}
        finderUnits={units.map(({id, slug, name, areaM2, sortOrder}) => ({id, slug, name, areaM2, sortOrder}))}
        locale="vi"
      />
    );

    const finderTab = screen.getByRole('tab', {name: 'Tìm nhanh'});
    finderTab.focus();
    fireEvent.keyDown(finderTab, {key: 'ArrowRight'});

    expect(screen.getByRole('tab', {name: 'Loại kho'})).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', {name: 'Loại kho'})).toHaveFocus();
  });
});
