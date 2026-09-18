import {describe, expect, it} from 'vitest';
import {
  isSameOriginTelemetryRequest,
  normalizeWebVitalPayload,
  sanitizeMetricPath
} from '@/features/analytics/web-vitals';

describe('web vitals telemetry contract', () => {
  it('normalizes an allowed metric and strips query/hash data from the path', () => {
    expect(normalizeWebVitalPayload({
      id: 'v4-123',
      name: 'INP',
      value: 142.5,
      rating: 'good',
      path: '/bang-gia?phone=secret#quote'
    })).toEqual({
      id: 'v4-123',
      name: 'INP',
      value: 142.5,
      rating: 'good',
      path: '/bang-gia'
    });
  });

  it('rejects unsupported names, unsafe paths and invalid values', () => {
    expect(normalizeWebVitalPayload({
      id: 'x',
      name: 'CUSTOM',
      value: 1,
      rating: 'good',
      path: '/'
    })).toBeNull();

    expect(normalizeWebVitalPayload({
      id: 'x',
      name: 'LCP',
      value: -1,
      rating: 'good',
      path: '/'
    })).toBeNull();

    expect(sanitizeMetricPath('https://example.com/private')).toBeNull();
  });

  it('requires the browser origin to match the request origin', () => {
    expect(isSameOriginTelemetryRequest('https://nupsbox.vercel.app', 'https://nupsbox.vercel.app')).toBe(true);
    expect(isSameOriginTelemetryRequest('https://evil.example', 'https://nupsbox.vercel.app')).toBe(false);
    expect(isSameOriginTelemetryRequest(null, 'https://nupsbox.vercel.app')).toBe(false);
  });
});
