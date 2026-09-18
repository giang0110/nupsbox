import {describe, expect, it} from 'vitest';
import {
  normalizeAdminDashboardCounts,
  summarizeAdminCrmCounts
} from '@/features/admin/dashboard';

describe('admin dashboard summary', () => {
  it('maps nullable Supabase counts to zero while preserving numeric counts', () => {
    expect(
      normalizeAdminDashboardCounts({
        leads: 14,
        activeLocations: 1,
        activeUnitTypes: null,
        faqs: 7,
        publishedBlogPosts: null
      })
    ).toEqual({
      leads: 14,
      activeLocations: 1,
      activeUnitTypes: 0,
      faqs: 7,
      publishedBlogPosts: 0
    });
  });

  it('derives CRM workload from the seven approved statuses only', () => {
    const result = summarizeAdminCrmCounts({
      new: 4,
      contacted: 3,
      qualified: 2,
      viewing: 5,
      negotiating: 1,
      won: 7,
      lost: 6
    }, 8);

    expect(result).toEqual({
      newLeads: 4,
      inProgressLeads: 11,
      upcomingAppointments: 8,
      wonLeads: 7,
      lostLeads: 6,
      byStatus: {
        new: 4,
        contacted: 3,
        qualified: 2,
        viewing: 5,
        negotiating: 1,
        won: 7,
        lost: 6
      }
    });
  });
});
