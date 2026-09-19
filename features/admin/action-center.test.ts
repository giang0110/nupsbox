import {describe, expect, it} from 'vitest';
import {buildAdminActionCenter} from '@/features/admin/action-center';
import type {AdminContentCalendar} from '@/features/admin/content-calendar';
import type {AdminDashboardSummary} from '@/features/admin/dashboard';
import type {AdminQualityIssue} from '@/features/admin/quality';

function dashboard(overdue = false): AdminDashboardSummary {
  return {
    crm: {
      newLeads: 0,
      inProgressLeads: 0,
      upcomingAppointments: 0,
      wonLeads: 0,
      lostLeads: 0,
      byStatus: {
        new: 0,
        contacted: 0,
        qualified: 0,
        viewing: 0,
        negotiating: 0,
        won: 0,
        lost: 0
      }
    },
    attention: {
      newLeads: [],
      unassignedLeads: [],
      appointments: overdue
        ? [{
            id: 'appointment-1',
            leadId: 'lead-1',
            leadName: 'Lead',
            status: 'confirmed',
            scheduledAt: '2026-09-19T01:00:00.000Z',
            overdue: true
          }]
        : []
    },
    health: {
      activeLocations: 1,
      activeUnitTypes: 1,
      faqs: 1,
      publishedBlogPosts: 1
    }
  };
}

const emptyCalendar: AdminContentCalendar = {
  scheduled: [],
  next7Days: [],
  drafts: [],
  recentPublished: [],
  archived: 0
};

describe('buildAdminActionCenter', () => {
  it('orders high-priority actions before informational content reminders', () => {
    const issues: AdminQualityIssue[] = [{
      id: 'crm-sla',
      area: 'crm',
      tone: 'danger',
      title: 'Lead quá SLA',
      detail: 'Cần xử lý',
      href: '/admin/leads',
      count: 2
    }];

    const calendar: AdminContentCalendar = {
      ...emptyCalendar,
      next7Days: [{
        id: 'blog-1',
        slug: 'scheduled-post',
        status: 'published',
        publishedAt: '2026-09-20T02:00:00.000Z',
        coverMediaId: null,
        sourceUrl: null,
        authorId: null,
        createdAt: '2026-09-19T00:00:00.000Z',
        updatedAt: '2026-09-19T00:00:00.000Z',
        vi: {locale: 'vi', title: 'Bài VI', excerpt: null, body: {}, seoTitle: null, seoDescription: null},
        en: {locale: 'en', title: 'EN post', excerpt: null, body: {}, seoTitle: null, seoDescription: null}
      }]
    };

    const result = buildAdminActionCenter({
      qualityIssues: issues,
      calendar,
      dashboard: dashboard()
    });

    expect(result.items[0].tone).toBe('danger');
    expect(result.items.some(item => item.id === 'content:scheduled-next-7-days')).toBe(true);
    expect(result.counts.danger).toBe(1);
  });

  it('adds an urgent action for overdue confirmed appointments', () => {
    const result = buildAdminActionCenter({
      qualityIssues: [],
      calendar: emptyCalendar,
      dashboard: dashboard(true)
    });

    expect(result.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'crm:overdue-appointments',
          tone: 'danger',
          count: 1
        })
      ])
    );
  });

  it('returns an empty queue when there is nothing to triage', () => {
    const result = buildAdminActionCenter({
      qualityIssues: [],
      calendar: emptyCalendar,
      dashboard: dashboard()
    });

    expect(result.items).toEqual([]);
    expect(result.counts).toEqual({danger: 0, warning: 0, info: 0});
  });
});
