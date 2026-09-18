import {describe, expect, it} from 'vitest';
import {projectLeadAppointmentSummaries} from '@/features/admin/lead-appointment-summary';

const now = new Date('2026-09-18T03:00:00.000Z');

describe('lead pipeline appointment summaries', () => {
  it('selects the earliest future actionable appointment per lead', () => {
    const result = projectLeadAppointmentSummaries([
      {
        id: 'a-later',
        leadId: 'lead-a',
        status: 'pending',
        scheduledAt: '2026-09-20T03:00:00.000Z'
      },
      {
        id: 'a-next',
        leadId: 'lead-a',
        status: 'confirmed',
        scheduledAt: '2026-09-19T03:00:00.000Z'
      }
    ], ['lead-a'], now);

    expect(result['lead-a']).toMatchObject({
      id: 'a-next',
      status: 'confirmed',
      overdue: false
    });
  });

  it('falls back to the latest past appointment and flags confirmed overdue', () => {
    const result = projectLeadAppointmentSummaries([
      {
        id: 'a-old',
        leadId: 'lead-a',
        status: 'confirmed',
        scheduledAt: '2026-09-16T03:00:00.000Z'
      },
      {
        id: 'a-recent',
        leadId: 'lead-a',
        status: 'confirmed',
        scheduledAt: '2026-09-17T03:00:00.000Z'
      }
    ], ['lead-a'], now);

    expect(result['lead-a']).toMatchObject({id: 'a-recent', overdue: true});
  });
});
