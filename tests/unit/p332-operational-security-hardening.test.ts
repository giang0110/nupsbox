import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('P3.32 operational security hardening', () => {
  it('adds baseline security response headers without a stale image origin', () => {
    const config = source('next.config.ts');
    expect(config).toContain("'X-Content-Type-Options'");
    expect(config).toContain("'X-Frame-Options'");
    expect(config).toContain("'Strict-Transport-Security'");
    expect(config).toContain("'Content-Security-Policy'");
    expect(config).not.toContain('siaodieqxzlarnvfppox.supabase.co');
  });

  it('rejects cross-origin and oversized public lead requests', () => {
    const route = source('app/api/leads/route.ts');
    expect(route).toContain("error: 'invalid_origin'");
    expect(route).toContain("error: 'payload_too_large'");
    expect(route).toContain("error: 'unsupported_media_type'");
    expect(route).toContain("MAX_BODY_BYTES = 16_384");
    expect(route).toContain("'retry-after': '900'");
  });

  it('fails closed when auth code exchange is missing or invalid', () => {
    const callback = source('app/auth/callback/route.ts');
    expect(callback).toContain('missing_code');
    expect(callback).toContain('callback_failed');
    expect(callback).toContain('exchangeCodeForSession');
  });

  it('ships DB least-privilege and FK-index hardening as a migration', () => {
    const migration = source('supabase/migrations/20260920080000_p332_operational_security_hardening.sql');
    expect(migration).toContain('revoke all privileges on table public.lead_rate_limits from anon, authenticated');
    expect(migration).toContain('using (id = (select auth.uid()))');
    expect(migration).toContain('location_unit_types_unit_type_id_idx');
  });
});
