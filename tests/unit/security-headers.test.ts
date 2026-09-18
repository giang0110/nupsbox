import {describe, expect, it} from 'vitest';
import {SECURITY_RESPONSE_HEADERS} from '@/features/security/headers';

describe('security response headers', () => {
  it('defines the baseline hardening headers used by Next.js', () => {
    expect(SECURITY_RESPONSE_HEADERS).toEqual([
      {key: 'X-Content-Type-Options', value: 'nosniff'},
      {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), payment=()'
      },
      {key: 'X-Frame-Options', value: 'SAMEORIGIN'}
    ]);
  });
});
