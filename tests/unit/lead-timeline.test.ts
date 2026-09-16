import {describe, expect, it} from 'vitest';
import {buildLeadTimeline} from '@/features/admin/lead-timeline';

describe('lead timeline', () => {
  it('orders appointment, lead status, and note events newest first', () => {
    const timeline = buildLeadTimeline({
      notes: [{id: 'n1', note: 'Called', authorName: 'Staff A', createdAt: '2026-09-15T02:00:00Z'}],
      statusHistory: [{id: 's1', fromStatus: 'new', toStatus: 'contacted', changedByName: 'Staff A', createdAt: '2026-09-15T03:00:00Z'}],
      appointmentHistory: [{id: 'a1', eventType: 'created', changedByName: null, createdAt: '2026-09-15T04:00:00Z'}]
    });

    expect(timeline.map((item) => item.id)).toEqual(['a1', 's1', 'n1']);
  });
});
