import {describe, expect, it} from 'vitest';
import {captureUtm} from '@/features/leads/utm';

describe('captureUtm', () => {
  it('keeps only approved attribution fields', () => {
    const params = new URLSearchParams('utm_source=facebook&utm_medium=paid&utm_campaign=launch&utm_content=hero&phone=0901234567');
    expect(captureUtm(params)).toEqual({
      utmSource: 'facebook',
      utmMedium: 'paid',
      utmCampaign: 'launch',
      utmContent: 'hero'
    });
  });

  it('returns an empty attribution when campaign params are absent', () => {
    expect(captureUtm(new URLSearchParams('ref=homepage'))).toEqual({});
  });
});
