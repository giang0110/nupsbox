import {describe, expect, it} from 'vitest';
import * as leadModule from '@/features/admin/leads';

type LeadDetailModule = typeof leadModule & {
  projectAdminLeadDetail?: (
    lead: Record<string, unknown>,
    notes: Record<string, unknown>[],
    history: Record<string, unknown>[]
  ) => unknown;
};

const detailModule = leadModule as LeadDetailModule;

describe('Phase 2 CRM lead detail projection', () => {
  it('projects lead metadata, notes and status history into the admin detail model', () => {
    expect(detailModule.projectAdminLeadDetail).toBeTypeOf('function');
    const project = detailModule.projectAdminLeadDetail!;

    expect(project(
      {
        id: 'a8ba1e58-ece7-4a8a-844c-3b5edcbf8ab0',
        full_name: 'Nguyễn An',
        phone: '0900000000',
        email: 'an@example.com',
        message: 'Cần kho gần Tân Phú',
        need_type: 'inventory',
        estimated_volume: 'boxes_20_50',
        preferred_language: 'vi',
        location_id: '3bb8f237-ce72-4c5b-8eba-25a470b87a42',
        unit_type_id: null,
        source: 'website',
        utm_source: 'facebook',
        utm_medium: 'social',
        utm_campaign: 'sep-2026',
        utm_content: 'hero',
        landing_page: '/kho-mini',
        referrer: 'https://facebook.com/',
        status: 'qualified',
        assigned_to: '51af3597-3eef-47a2-a008-2399be9ac8f6',
        created_at: '2026-09-15T03:00:00.000Z'
      },
      [
        {
          id: 'f28d36fe-a9dd-4f21-b0a1-307563fc5cb1',
          note: 'Đã xác nhận nhu cầu.',
          author_id: '51af3597-3eef-47a2-a008-2399be9ac8f6',
          created_at: '2026-09-15T03:15:00.000Z'
        }
      ],
      [
        {
          id: '1b43a702-8025-46b8-8092-a5a0aaf7450f',
          from_status: 'contacted',
          to_status: 'qualified',
          changed_by: '51af3597-3eef-47a2-a008-2399be9ac8f6',
          created_at: '2026-09-15T03:10:00.000Z'
        }
      ]
    )).toMatchObject({
      id: 'a8ba1e58-ece7-4a8a-844c-3b5edcbf8ab0',
      fullName: 'Nguyễn An',
      status: 'qualified',
      assignedTo: '51af3597-3eef-47a2-a008-2399be9ac8f6',
      estimatedVolume: 'boxes_20_50',
      locationId: '3bb8f237-ce72-4c5b-8eba-25a470b87a42',
      unitTypeId: null,
      source: 'website',
      utmSource: 'facebook',
      utmMedium: 'social',
      utmCampaign: 'sep-2026',
      utmContent: 'hero',
      landingPage: '/kho-mini',
      referrer: 'https://facebook.com/',
      notes: [
        {
          note: 'Đã xác nhận nhu cầu.',
          authorId: '51af3597-3eef-47a2-a008-2399be9ac8f6'
        }
      ],
      history: [
        {
          fromStatus: 'contacted',
          toStatus: 'qualified',
          changedBy: '51af3597-3eef-47a2-a008-2399be9ac8f6'
        }
      ]
    });
  });

  it('normalizes nullable metadata without inventing CRM values', () => {
    expect(detailModule.projectAdminLeadDetail).toBeTypeOf('function');
    const project = detailModule.projectAdminLeadDetail!;

    expect(project(
      {
        id: 'a8ba1e58-ece7-4a8a-844c-3b5edcbf8ab0',
        full_name: 'Khách mới',
        phone: '0900000000',
        email: null,
        message: null,
        need_type: 'other',
        estimated_volume: 'unknown',
        preferred_language: 'en',
        location_id: null,
        unit_type_id: null,
        source: null,
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        utm_content: null,
        landing_page: null,
        referrer: null,
        status: 'new',
        assigned_to: null,
        created_at: '2026-09-15T03:00:00.000Z'
      },
      [],
      []
    )).toMatchObject({
      assignedTo: null,
      locationId: null,
      unitTypeId: null,
      source: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmContent: null,
      landingPage: null,
      referrer: null,
      notes: [],
      history: []
    });
  });
});
