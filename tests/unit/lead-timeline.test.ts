import {describe, expect, it} from 'vitest';
import {buildLeadTimeline} from '@/features/admin/lead-timeline';

describe('unified CRM lead timeline', () => {
  it('combines lead and appointment history newest first', () => {
    const timeline = buildLeadTimeline({
      notes: [
        {
          id: 'n1',
          note: 'Called',
          authorName: 'Staff A',
          createdAt: '2026-09-15T02:00:00.000Z'
        }
      ],
      statusHistory: [
        {
          id: 's1',
          fromStatus: 'new',
          toStatus: 'contacted',
          changedByName: 'Staff A',
          createdAt: '2026-09-15T03:00:00.000Z'
        }
      ],
      appointmentHistory: [
        {
          id: 'a1',
          eventType: 'created',
          changedByName: null,
          createdAt: '2026-09-15T04:00:00.000Z'
        }
      ]
    });

    expect(timeline.map((item) => item.id)).toEqual(['a1', 's1', 'n1']);
    expect(timeline.map((item) => item.kind)).toEqual([
      'appointment',
      'lead_status',
      'note'
    ]);
  });

  it('keeps actor labels nullable instead of inventing identities', () => {
    const [item] = buildLeadTimeline({
      notes: [],
      statusHistory: [],
      appointmentHistory: [
        {
          id: 'a1',
          eventType: 'created',
          changedByName: null,
          createdAt: '2026-09-15T04:00:00.000Z'
        }
      ]
    });
    expect(item.actorName).toBeNull();
  });

  it('maps appointment audit event types to readable Vietnamese labels', () => {
    const [item] = buildLeadTimeline({
      notes: [],
      statusHistory: [],
      appointmentHistory: [{
        id: 'a1',
        eventType: 'status_changed',
        changedByName: 'Nhân viên A',
        createdAt: '2026-09-15T04:00:00.000Z'
      }]
    });

    expect(item).toMatchObject({
      title: 'Lịch hẹn',
      detail: 'Đổi trạng thái',
      actorName: 'Nhân viên A'
    });
  });
});
