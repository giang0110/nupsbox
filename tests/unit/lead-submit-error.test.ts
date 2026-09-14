import {describe, expect, it} from 'vitest';
import {classifyLeadSubmitError} from '@/features/leads/error-classification';

describe('classifyLeadSubmitError', () => {
  it('classifies missing rate-limit salt without exposing values', () => {
    expect(classifyLeadSubmitError(new Error('Missing LEAD_RATE_LIMIT_SALT'))).toBe('missing_rate_limit_salt');
  });

  it('classifies missing Supabase server configuration', () => {
    expect(classifyLeadSubmitError(new Error('Missing server Supabase configuration'))).toBe('missing_supabase_config');
  });

  it('classifies backend failures generically', () => {
    expect(classifyLeadSubmitError({code: 'PGRST301', message: 'sensitive backend detail'})).toBe('backend_error');
  });
});
