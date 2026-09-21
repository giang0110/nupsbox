import {describe, expect, it} from 'vitest';
import {
  prepareLeadAssignment,
  prepareLeadNote,
  prepareLeadStatusUpdate
} from '@/features/admin/leads';

const leadId = 'a8ba1e58-ece7-4a8a-844c-3b5edcbf8ab0';
const staffId = '51af3597-3eef-47a2-a008-2399be9ac8f6';

describe('admin lead mutation preparation', () => {
  it('preserves nullable lead assignment including unassignment', () => {
    expect(() => prepareLeadAssignment('viewer', leadId, staffId)).toThrow('forbidden');
    expect(prepareLeadAssignment('staff', leadId, staffId)).toEqual({leadId, assigneeId: staffId});
    expect(prepareLeadAssignment('admin', leadId, null)).toEqual({leadId, assigneeId: null});
  });

  it('rejects malformed assignment identifiers', () => {
    expect(() => prepareLeadAssignment('staff', 'not-a-uuid', staffId)).toThrow('invalid_lead_id');
    expect(() => prepareLeadAssignment('staff', leadId, 'not-a-uuid')).toThrow('invalid_assignee_id');
  });

  it('allows staff/admin notes and rejects viewer or invalid notes', () => {
    expect(() => prepareLeadNote('viewer', leadId, 'note')).toThrow('forbidden');
    expect(prepareLeadNote('admin', leadId, '  note  ')).toEqual({leadId, note: 'note'});
    expect(() => prepareLeadNote('staff', leadId, '   ')).toThrow('invalid_note');
    expect(() => prepareLeadNote('admin', leadId, 'x'.repeat(2001))).toThrow('invalid_note');
  });

  it('keeps existing lead status mutation validation intact', () => {
    expect(prepareLeadStatusUpdate('staff', leadId, 'contacted')).toEqual({
      leadId,
      status: 'contacted'
    });
    expect(() => prepareLeadStatusUpdate('viewer', leadId, 'contacted')).toThrow('forbidden');
    expect(() => prepareLeadStatusUpdate('admin', leadId, 'deleted')).toThrow('invalid_status');
  });
});
