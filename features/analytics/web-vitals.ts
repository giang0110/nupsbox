export const WEB_VITAL_NAMES = ['CLS', 'FCP', 'INP', 'LCP', 'TTFB'] as const;
export const WEB_VITAL_RATINGS = ['good', 'needs-improvement', 'poor'] as const;

export type WebVitalName = (typeof WEB_VITAL_NAMES)[number];
export type WebVitalRating = (typeof WEB_VITAL_RATINGS)[number];

export type WebVitalPayload = {
  id: string;
  name: WebVitalName;
  value: number;
  rating: WebVitalRating;
  path: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function sanitizeMetricPath(value: unknown): string | null {
  if (typeof value !== 'string' || !value.startsWith('/')) return null;
  const path = value.split(/[?#]/, 1)[0].slice(0, 240);
  return path || '/';
}

export function normalizeWebVitalPayload(input: unknown): WebVitalPayload | null {
  if (!isRecord(input)) return null;

  const {id, name, value, rating, path} = input;
  if (typeof id !== 'string' || id.length < 1 || id.length > 128) return null;
  if (!WEB_VITAL_NAMES.includes(name as WebVitalName)) return null;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 600_000) return null;
  if (!WEB_VITAL_RATINGS.includes(rating as WebVitalRating)) return null;

  const safePath = sanitizeMetricPath(path);
  if (!safePath) return null;

  return {
    id,
    name: name as WebVitalName,
    value,
    rating: rating as WebVitalRating,
    path: safePath
  };
}

export function isSameOriginTelemetryRequest(originHeader: string | null, requestOrigin: string): boolean {
  if (!originHeader) return false;

  try {
    return new URL(originHeader).origin === requestOrigin;
  } catch {
    return false;
  }
}
