export type AnalyticsEventName =
  | 'click_zalo'
  | 'click_phone'
  | 'lead_submit'
  | 'storage_finder_start'
  | 'storage_finder_complete'
  | 'view_unit'
  | 'view_location'
  | 'view_pricing'
  | 'public_primary_cta_click'
  | 'storage_recommendation_cta_click'
  | 'unit_compare_open'
  | 'quote_flow_start'
  | 'viewing_flow_start'
  | 'web_vital';

export type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function trackEvent(event: AnalyticsEventName, payload: AnalyticsPayload = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({event, ...payload});
}
