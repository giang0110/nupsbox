import {describe, expect, it} from 'vitest';
import {
  buildLeadCsv,
  buildLeadExportHref,
  csvCell
} from '@/features/admin/lead-export';
import type {AdminLeadRow} from '@/features/admin/leads';

const lead: AdminLeadRow = {
  id: 'a8ba1e58-ece7-4a8a-844c-3b5edcbf8ab0',
  fullName: '=2+2',
  phone: '+84901234567',
  email: 'customer@example.com',
  message: 'Sensitive free-form message must not be exported',
  needType: 'sme',
  status: 'new',
  preferredLanguage: 'vi',
  source: 'website',
  utmSource: 'facebook',
  utmCampaign: 'launch',
  assignedTo: 'b8ba1e58-ece7-4a8a-844c-3b5edcbf8ab1',
  createdAt: '2026-09-19T01:00:00.000Z',
  updatedAt: '2026-09-19T02:00:00.000Z'
};

describe('lead CSV export contracts', () => {
  it('preserves CRM filters without exporting the visual workspace mode', () => {
    const href = buildLeadExportHref({
      view: 'pipeline',
      status: 'new',
      assignee: 'b8ba1e58-ece7-4a8a-844c-3b5edcbf8ab1',
      source: 'facebook',
      q: 'Nguyen'
    });

    expect(href).toContain('/admin/leads/export?');
    expect(href).toContain('status=new');
    expect(href).toContain('source=facebook');
    expect(href).toContain('q=Nguyen');
    expect(href).not.toContain('view=');
  });

  it('neutralizes spreadsheet formula prefixes', () => {
    expect(csvCell('=2+2')).toBe('"\'=2+2"');
    expect(csvCell('+84901234567')).toBe('"\'+84901234567"');
    expect(csvCell('normal')).toBe('"normal"');
  });

  it('exports approved CRM columns and excludes free-form message text', () => {
    const csv = buildLeadCsv([lead], {
      'b8ba1e58-ece7-4a8a-844c-3b5edcbf8ab1': 'Admin User'
    });

    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('"\'=2+2"');
    expect(csv).toContain('"\'+84901234567"');
    expect(csv).toContain('"Admin User"');
    expect(csv).not.toContain('Sensitive free-form message must not be exported');
  });
});
