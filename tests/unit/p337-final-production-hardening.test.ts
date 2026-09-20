import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

const source = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('P3.37 final production hardening', () => {
  it('redirects the observed legacy English about URL', () => {
    const config = source('next.config.ts');
    expect(config).toContain("source: '/en/about'");
    expect(config).toContain("destination: '/en/about-nupsbox'");
    expect(config).toContain('permanent: true');
  });

  it('requires JSON and byte-bounds telemetry payloads', () => {
    const route = source('app/api/telemetry/web-vitals/route.ts');
    expect(route).toContain("error: 'unsupported_media_type'");
    expect(route).toContain("error: 'payload_too_large'");
    expect(route).toContain("new TextEncoder().encode(body).byteLength");
    expect(route).toContain("request.headers.get('content-length')");
  });
});
