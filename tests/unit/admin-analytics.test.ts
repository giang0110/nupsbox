import {describe, expect, it} from 'vitest';
import {
  hcmWindowStart,
  normalizeAnalyticsDays,
  summarizeLeadAnalytics
} from '@/features/admin/analytics';

const statusCounts = {
  new: 1,
  contacted: 1,
  qualified: 0,
  viewing: 0,
  negotiating: 0,
  won: 2,
  lost: 1
};

describe('admin lead analytics', () => {
  it('normalizes supported reporting windows', () => {
    expect(normalizeAnalyticsDays('7')).toBe(7);
    expect(normalizeAnalyticsDays(90)).toBe(90);
    expect(normalizeAnalyticsDays('30')).toBe(30);
    expect(normalizeAnalyticsDays('365')).toBe(30);
  });

  it('starts reporting windows at midnight Ho Chi Minh City time', () => {
    const now = new Date('2026-09-19T03:30:00.000Z');
    expect(hcmWindowStart(now, 7).toISOString()).toBe('2026-09-12T17:00:00.000Z');
    expect(hcmWindowStart(now, 30).toISOString()).toBe('2026-08-20T17:00:00.000Z');
  });

  it('summarizes non-PII acquisition and funnel data while preserving exact status counts', () => {
    const rows = [
      {
        created_at: '2026-09-19T00:30:00.000Z',
        status: 'won',
        source: 'website',
        utm_source: 'facebook',
        utm_campaign: 'warehouse-launch',
        landing_page: '/lien-he?lead=private',
        need_type: 'sme',
        preferred_language: 'vi'
      },
      {
        created_at: '2026-09-18T08:00:00.000Z',
        status: 'contacted',
        source: 'website',
        utm_source: null,
        utm_campaign: null,
        landing_page: '/bang-gia#quote',
        need_type: 'personal',
        preferred_language: 'en'
      },
      {
        created_at: '2026-09-18T07:00:00.000Z',
        status: 'new',
        source: null,
        utm_source: null,
        utm_campaign: null,
        landing_page: null,
        need_type: 'sme',
        preferred_language: 'vi'
      }
    ];

    const result = summarizeLeadAnalytics(
      rows,
      statusCounts,
      5,
      7,
      '2026-09-12T17:00:00.000Z',
      new Date('2026-09-19T03:30:00.000Z')
    );

    expect(result.totalLeads).toBe(5);
    expect(result.sampleSize).toBe(3);
    expect(result.truncated).toBe(true);
    expect(result.wonLeads).toBe(2);
    expect(result.activeLeads).toBe(1);
    expect(result.conversionRate).toBe(0.4);
    expect(result.bySource.map(item => [item.label, item.count])).toEqual([
      ['Direct / chưa xác định', 1],
      ['facebook', 1],
      ['website', 1]
    ]);
    expect(result.byLandingPage.map(item => item.label)).toContain('/lien-he');
    expect(result.byLandingPage.map(item => item.label)).not.toContain('/lien-he?lead=private');
    expect(result.byNeedType[0]).toMatchObject({key: 'sme', count: 2});
    expect(result.byLanguage.map(item => [item.label, item.count])).toEqual([
      ['Tiếng Việt', 2],
      ['English', 1]
    ]);
    expect(result.daily).toHaveLength(7);
  });
});
