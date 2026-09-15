import {describe, expect, it} from 'vitest';
import {isOperationalLeadStatus, prepareLeadStatusUpdate} from '@/features/admin/leads';

const leadId = 'a8ba1e58-ece7-4a8a-844c-3b5edcbf8ab0';

describe('admin lead status updates', () => {
  it('accepts Phase 2 operational statuses and rejects legacy statuses', () => {
    expect(isOperationalLeadStatus('qualified')).toBe(true);
    expect(isOperationalLeadStatus('viewing')).toBe(true);
    expect(isOperationalLeadStatus('visit_scheduled')).toBe(false);
    expect(isOperationalLeadStatus('visited')).toBe(false);
  });

  it('accepts a valid staff transition payload', () => {
    expect(prepareLeadStatusUpdate('staff', leadId, 'contacted')).toEqual({
      leadId,
      status: 'contacted'
    });
  });

  it('rejects roles without leads:update permission', () => {
    expect(() => prepareLeadStatusUpdate('viewer', leadId, 'contacted')).toThrow('forbidden');
  });

  it('rejects unknown lead statuses', () => {
    expect(() => prepareLeadStatusUpdate('admin', leadId, 'deleted')).toThrow('invalid_status');
  });

  it('rejects malformed lead ids', () => {
    expect(() => prepareLeadStatusUpdate('admin', 'not-a-uuid', 'won')).toThrow('invalid_lead_id');
  });
});
