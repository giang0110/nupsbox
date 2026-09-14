import {describe, expect, it} from 'vitest';
import {normalizeAdminDashboardCounts} from '@/features/admin/dashboard';

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
});
