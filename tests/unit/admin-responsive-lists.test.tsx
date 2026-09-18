import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {CatalogTables} from '@/components/admin/catalog-tables';
import type {AdminCatalog} from '@/features/admin/catalog';

const catalog: AdminCatalog = {
  locations: [{
    id: 'loc-1',
    slug: 'tan-phu',
    nameVi: 'NupsBox Tân Phú',
    nameEn: 'NupsBox Tan Phu',
    district: 'Tân Phú',
    status: 'active',
    isFeatured: true,
    sortOrder: 0
  }],
  unitTypes: [{
    id: 'unit-1',
    slug: 'kho-s',
    nameVi: 'Kho S',
    nameEn: 'S Unit',
    areaM2: 3,
    active: true,
    sortOrder: 0
  }],
  pricing: [{
    id: 'price-1',
    locationId: 'loc-1',
    unitTypeId: 'unit-1',
    monthlyPrice: 1_000_000,
    promoPrice: null,
    depositAmount: null,
    availabilityStatus: 'available',
    availableCount: null,
    featured: false
  }]
};

describe('admin responsive catalog lists', () => {
  it('renders desktop tables and mobile cards from the same catalog data', () => {
    const {container} = render(<CatalogTables catalog={catalog} />);

    expect(container.querySelectorAll('[data-admin-desktop-table]')).toHaveLength(3);
    expect(container.querySelectorAll('[data-admin-mobile-list]')).toHaveLength(3);
    expect(screen.getAllByText('NupsBox Tân Phú').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Kho S').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Có thể tư vấn').length).toBeGreaterThanOrEqual(2);
  });
});
