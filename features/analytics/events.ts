export type AnalyticsEventName =
  | 'click_zalo'
  | 'click_phone'
  | 'lead_submit'
  | 'storage_finder_start'
  | 'storage_finder_complete'
  | 'view_unit'
  | 'view_location'
  | 'view_pricing';

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
