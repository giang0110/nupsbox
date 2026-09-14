import {describe, expect, it} from 'vitest';
import {parseEnv} from '@/lib/env';

describe('parseEnv', () => {
  it('rejects a missing Supabase URL', () => {
    expect(() =>
      parseEnv({
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
        NEXT_PUBLIC_SITE_URL: 'http://localhost:3000'
      })
    ).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it('accepts the minimum development environment', () => {
    const result = parseEnv({
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000'
    });

    expect(result.NEXT_PUBLIC_SITE_URL).toBe('http://localhost:3000');
  });

  it('rejects a weak lead rate-limit salt when one is configured', () => {
    expect(() =>
      parseEnv({
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
        NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
        LEAD_RATE_LIMIT_SALT: 'too-short'
      })
    ).toThrow(/LEAD_RATE_LIMIT_SALT/);
  });

  it('accepts a strong lead rate-limit salt', () => {
    const result = parseEnv({
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      LEAD_RATE_LIMIT_SALT: 'nupsbox-ci-rate-limit-salt-32-chars'
    });

    expect(result.LEAD_RATE_LIMIT_SALT).toBe('nupsbox-ci-rate-limit-salt-32-chars');
  });
});
