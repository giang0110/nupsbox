import {describe, expect, it} from 'vitest';
import {PublicLeadRequestSchema} from '@/features/leads/request-schema';

const base = {
  fullName: 'Nguyen Van A',
  phone: '0901234567',
  preferredLanguage: 'vi' as const,
  needType: 'other' as const,
  estimatedVolume: 'unknown' as const
};

describe('PublicLeadRequestSchema', () => {
  it('accepts a lead-only request', () => {
    expect(PublicLeadRequestSchema.parse(base).appointment).toBeUndefined();
  });

  it('defaults a public appointment request to 30 minutes', () => {
    expect(PublicLeadRequestSchema.parse({
      ...base,
      appointment: {scheduledAt: '2026-09-20T02:30:00.000Z'}
    }).appointment?.durationMinutes).toBe(30);
  });

  it('rejects public appointment status overrides', () => {
    expect(() => PublicLeadRequestSchema.parse({
      ...base,
      appointment: {scheduledAt: '2026-09-20T02:30:00.000Z', status: 'confirmed'}
    })).toThrow();
  });
});
