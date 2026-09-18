import {describe, expect, it} from 'vitest';
import {
  resolveLeadReferenceLabel,
  selectNextAppointment
} from '@/features/admin/lead-detail';

const now = new Date('2026-09-15T03:00:00.000Z');

describe('CRM next appointment selection', () => {
  it('selects the earliest future actionable appointment', () => {
    expect(selectNextAppointment([
      {id: 'done', status: 'completed', scheduledAt: '2026-09-16T03:00:00.000Z'},
      {id: 'later', status: 'pending', scheduledAt: '2026-09-17T03:00:00.000Z'},
      {id: 'next', status: 'confirmed', scheduledAt: '2026-09-16T04:00:00.000Z'}
    ], now)).toMatchObject({id: 'next', overdue: false});
  });

  it('falls back to the latest past actionable appointment and flags confirmed overdue', () => {
    expect(selectNextAppointment([
      {id: 'older', status: 'confirmed', scheduledAt: '2026-09-13T03:00:00.000Z'},
      {id: 'overdue', status: 'confirmed', scheduledAt: '2026-09-14T03:00:00.000Z'}
    ], now)).toMatchObject({id: 'overdue', overdue: true});
  });

  it('ignores terminal appointments', () => {
    expect(selectNextAppointment([
      {id: 'done', status: 'completed', scheduledAt: '2026-09-16T03:00:00.000Z'},
      {id: 'cancelled', status: 'cancelled', scheduledAt: '2026-09-17T03:00:00.000Z'}
    ], now)).toBeNull();
  });

  it('resolves a readable reference label without inventing missing metadata', () => {
    expect(resolveLeadReferenceLabel(
      '30000000-0000-4000-8000-000000000001',
      [{id: '30000000-0000-4000-8000-000000000001', label: 'NupsBox Tân Phú'}]
    )).toBe('NupsBox Tân Phú');
    expect(resolveLeadReferenceLabel('missing', [])).toBeNull();
  });
});
