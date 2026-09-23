import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';
import {normalizeClientErrorEvent} from '@/features/ops/client-error';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('P3.43 production observability and recovery', () => {
  it('accepts only bounded privacy-safe client error fields', () => {
    expect(normalizeClientErrorEvent({
      scope: 'admin',
      digest: 'abc-123',
      path: '/admin/leads'
    })).toEqual({
      scope: 'admin',
      digest: 'abc-123',
      path: '/admin/leads'
    });

    expect(normalizeClientErrorEvent({
      scope: 'admin',
      digest: 'abc 123',
      path: '/admin/leads'
    })).toBeNull();

    expect(normalizeClientErrorEvent({
      scope: 'other',
      digest: null,
      path: '/admin'
    })).toBeNull();
  });

  it('does not transmit exception messages or stacks from recovery boundaries', () => {
    const reporter = source('components/ops/client-error-reporter.tsx');
    expect(reporter).toContain("JSON.stringify({scope, digest: digest ?? null, path})");
    expect(reporter).not.toContain('error.message');
    expect(reporter).not.toContain('error.stack');

    const endpoint = source('app/api/telemetry/client-errors/route.ts');
    expect(endpoint).toContain('MAX_BODY_BYTES = 1_024');
    expect(endpoint).toContain("error: 'invalid_origin'");
    expect(endpoint).toContain("error: 'unsupported_media_type'");
  });

  it('provides a no-store health endpoint with deployment commit identity', () => {
    const health = source('app/api/health/route.ts');
    expect(health).toContain("status: 'ok'");
    expect(health).toContain("service: 'nupsbox'");
    expect(health).toContain('VERCEL_GIT_COMMIT_SHA');
    expect(health).toContain("'cache-control': 'no-store, max-age=0'");
  });

  it('has public, admin and global recovery boundaries wired to safe telemetry', () => {
    expect(source('app/admin/error.tsx')).toContain('scope="admin"');
    expect(source('app/[locale]/error.tsx')).toContain('scope="public"');
    const globalError = source('app/global-error.tsx');
    expect(globalError).toContain('scope="global"');
    expect(globalError).toContain('<html lang="vi">');
    expect(globalError).toContain('onClick={reset}');
  });
});
