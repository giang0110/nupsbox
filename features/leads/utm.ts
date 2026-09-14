export type LeadAttribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
};

const STORAGE_KEY = 'nupsbox_lead_attribution';
const MAX_VALUE_LENGTH = 200;

function clean(value: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, MAX_VALUE_LENGTH) : undefined;
}

export function captureUtm(searchParams: Pick<URLSearchParams, 'get'>): LeadAttribution {
  const attribution: LeadAttribution = {
    utmSource: clean(searchParams.get('utm_source')),
    utmMedium: clean(searchParams.get('utm_medium')),
    utmCampaign: clean(searchParams.get('utm_campaign')),
    utmContent: clean(searchParams.get('utm_content'))
  };

  return Object.fromEntries(Object.entries(attribution).filter(([, value]) => value !== undefined)) as LeadAttribution;
}

export function persistAttribution(attribution: LeadAttribution) {
  if (typeof window === 'undefined' || Object.keys(attribution).length === 0) return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
}

export function readPersistedAttribution(): LeadAttribution {
  if (typeof window === 'undefined') return {};
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as LeadAttribution;
    return {
      utmSource: clean(parsed.utmSource ?? null),
      utmMedium: clean(parsed.utmMedium ?? null),
      utmCampaign: clean(parsed.utmCampaign ?? null),
      utmContent: clean(parsed.utmContent ?? null)
    };
  } catch {
    return {};
  }
}
