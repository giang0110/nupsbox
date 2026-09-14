import {describe, expect, it} from 'vitest';
import {LeadInputSchema} from '@/features/leads/schema';

describe('LeadInputSchema', () => {
  it('requires a plausible phone number', () => {
    const result = LeadInputSchema.safeParse({fullName: 'A', phone: '12'});
    expect(result.success).toBe(false);
  });

  it('rejects a filled honeypot', () => {
    const result = LeadInputSchema.safeParse({
      fullName: 'Nguyen A',
      phone: '0901234567',
      website: 'spam.example'
    });
    expect(result.success).toBe(false);
  });

  it('normalizes phone whitespace for a valid lead', () => {
    const result = LeadInputSchema.parse({
      fullName: 'Nguyen A',
      phone: '090 123 4567',
      preferredLanguage: 'vi'
    });
    expect(result.phone).toBe('0901234567');
  });
});
