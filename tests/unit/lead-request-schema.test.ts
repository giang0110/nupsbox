import {describe, expect, it} from 'vitest';
import {PublicLeadRequestSchema} from '@/features/leads/request-schema';

const base = {
  fullName: 'Nguyen Van A',
  phone: '0901234567',
  preferredLanguage: 'vi' as const,
  needType: 'other' as const,
  estimatedVolume: 'unknown' as const
};

describe('public lead request schema', () => {
  it('keeps lead-only submissions backward compatible', () => {
    expect(PublicLeadRequestSchema.parse(base).appointment).toBeUndefined();
  });

  it('accepts an optional pending appointment request with default duration', () => {
    const parsed = PublicLeadRequestSchema.parse({
      ...base,
      appointment: {scheduledAt: '2026-09-20T02:30:00.000Z'}
    });
    expect(parsed.appointment?.durationMinutes).toBe(30);
  });

  it('rejects privileged appointment fields from the public browser', () => {
    expect(() => PublicLeadRequestSchema.parse({
      ...base,
      appointment: {
        scheduledAt: '2026-09-20T02:30:00.000Z',
        status: 'confirmed'
      }
    })).toThrow();
  });
});
