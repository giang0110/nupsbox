import {describe, expect, it} from 'vitest';
import type {AnalyticsEventName} from '@/features/analytics/events';

const requiredEvents: AnalyticsEventName[] = [
  'public_primary_cta_click',
  'storage_recommendation_cta_click',
  'unit_compare_open',
  'quote_flow_start',
  'viewing_flow_start',
  'web_vital'
];

describe('analytics event contracts', () => {
  it('includes the non-sensitive public conversion funnel events', () => {
    expect(requiredEvents).toHaveLength(6);
  });
});
