import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {LeadContactHeader} from '@/components/admin/lead-contact-header';
import {LeadContextPanels} from '@/components/admin/lead-context-panels';
import type {AdminLeadDetail} from '@/features/admin/leads';

const lead: AdminLeadDetail = {
  id: 'a8ba1e58-ece7-4a8a-844c-3b5edcbf8ab0',
  fullName: 'Nguyễn An',
  phone: '0900000000',
  email: 'an@example.com',
  message: 'Cần kho gần Tân Phú',
  needType: 'inventory',
  status: 'qualified',
  preferredLanguage: 'vi',
  source: 'website',
  utmSource: 'facebook',
  utmCampaign: 'sep-2026',
  assignedTo: null,
  createdAt: '2026-09-15T03:00:00.000Z',
  updatedAt: '2026-09-15T04:00:00.000Z',
  estimatedVolume: 'boxes_20_50',
  locationId: 'location-1',
  unitTypeId: 'unit-1',
  utmMedium: 'social',
  utmContent: 'hero',
  landingPage: '/kho-mini',
  referrer: 'https://facebook.com/',
  notes: [],
  history: []
};

describe('admin lead detail layout', () => {
  it('keeps contact actions primary and acquisition context subordinate', () => {
    const {container} = render(
      <>
        <LeadContactHeader
          fullName={lead.fullName}
          createdAt={lead.createdAt}
          preferredLanguage={lead.preferredLanguage}
          phone={lead.phone}
          email={lead.email}
        />
        <LeadContextPanels
          lead={lead}
          locationLabel="NupsBox Tân Phú"
          unitTypeLabel="Kho 3 m²"
        />
      </>
    );

    expect(screen.getByRole('heading', {level: 1, name: 'Nguyễn An'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /gọi 0900000000/i})).toHaveAttribute(
      'href',
      'tel:0900000000'
    );
    expect(screen.getByRole('link', {name: 'an@example.com'})).toHaveAttribute(
      'href',
      'mailto:an@example.com'
    );
    expect(screen.getByRole('heading', {name: 'Nhu cầu lưu trữ'})).toBeInTheDocument();
    expect(container.querySelector('details')).toBeInTheDocument();
    expect(screen.getByText('Nguồn & attribution')).toBeInTheDocument();
  });
});
