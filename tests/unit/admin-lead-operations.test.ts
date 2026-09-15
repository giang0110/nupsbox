import {describe, expect, it} from 'vitest';
import * as leadModule from '@/features/admin/leads';

const leadId = 'a8ba1e58-ece7-4a8a-844c-3b5edcbf8ab0';
const assigneeId = '51af3597-3eef-47a2-a008-2399be9ac8f6';

type LeadOperationsModule = typeof leadModule & {
  prepareLeadAssignment?: (
    role: 'admin' | 'staff' | 'viewer',
    targetLeadId: string,
    targetAssigneeId: string | null
  ) => {leadId: string; assigneeId: string | null};
  prepareLeadNote?: (
    role: 'admin' | 'staff' | 'viewer',
    targetLeadId: string,
    note: unknown
  ) => {leadId: string; note: string};
};

const operations = leadModule as LeadOperationsModule;

describe('Phase 2 CRM lead operations', () => {
  it('prepares staff lead assignment payloads and permits unassignment', () => {
    expect(operations.prepareLeadAssignment).toBeTypeOf('function');
    const prepare = operations.prepareLeadAssignment!;

    expect(prepare('staff', leadId, assigneeId)).toEqual({leadId, assigneeId});
    expect(prepare('admin', leadId, null)).toEqual({leadId, assigneeId: null});
  });

  it('rejects unauthorized or malformed lead assignments', () => {
    expect(operations.prepareLeadAssignment).toBeTypeOf('function');
    const prepare = operations.prepareLeadAssignment!;

    expect(() => prepare('viewer', leadId, assigneeId)).toThrow('forbidden');
    expect(() => prepare('staff', 'not-a-uuid', assigneeId)).toThrow('invalid_lead_id');
    expect(() => prepare('staff', leadId, 'not-a-uuid')).toThrow('invalid_assignee_id');
  });

  it('trims valid CRM notes and rejects blank notes', () => {
    expect(operations.prepareLeadNote).toBeTypeOf('function');
    const prepare = operations.prepareLeadNote!;

    expect(prepare('staff', leadId, '  Gọi lại khách lúc 14:00  ')).toEqual({
      leadId,
      note: 'Gọi lại khách lúc 14:00'
    });
    expect(() => prepare('staff', leadId, '   ')).toThrow('invalid_note');
  });

  it('rejects unauthorized notes and notes above the CRM limit', () => {
    expect(operations.prepareLeadNote).toBeTypeOf('function');
    const prepare = operations.prepareLeadNote!;

    expect(() => prepare('viewer', leadId, 'Nội dung')).toThrow('forbidden');
    expect(() => prepare('admin', 'not-a-uuid', 'Nội dung')).toThrow('invalid_lead_id');
    expect(() => prepare('admin', leadId, 'x'.repeat(2001))).toThrow('invalid_note');
  });
});
