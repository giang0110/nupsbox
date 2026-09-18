'use client';

import {useReportWebVitals} from 'next/web-vitals';
import {trackEvent} from '@/features/analytics/events';
import {WEB_VITAL_NAMES} from '@/features/analytics/web-vitals';

const SAMPLE_RATE = 0.25;
const sampledForThisRuntime = Math.random() < SAMPLE_RATE;

type ReportWebVitalsCallback = Parameters<typeof useReportWebVitals>[0];

const reportMetric: ReportWebVitalsCallback = (metric) => {
  if (!sampledForThisRuntime) return;
  if (!WEB_VITAL_NAMES.includes(metric.name as (typeof WEB_VITAL_NAMES)[number])) return;

  const path = window.location.pathname;
  const payload = {
    id: metric.id,
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    path
  };

  trackEvent('web_vital', payload);

  void fetch('/api/telemetry/web-vitals', {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify(payload),
    credentials: 'omit',
    keepalive: true
  }).catch(() => {
    // Telemetry is best-effort and must never affect navigation or conversion.
  });
};

export function WebVitalsReporter() {
  useReportWebVitals(reportMetric);
  return null;
}
